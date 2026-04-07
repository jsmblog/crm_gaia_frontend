import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Bot, X, Plus, Send, ChevronLeft, Trash2,
    MessageSquare, Loader2, Paperclip, Info,
} from 'lucide-react';
import { chatService } from '../../Services/chatService';
import { useAuth } from '../../Context/AuthContext';
import { markdownToHtml } from '../../Utils/markdownToHtml';
import type { Chat, Mensaje } from '../../Interfaces/i_chat';
import './ChatBot.css';

// ── Configuración de proveedores y modelos ──────────────────
const PROVIDERS = {
    claude: {
        label: 'Claude',
        avatar: '◆',
        avatarColor: '#D97706',
        models: [
            { id: 'claude-opus-4-6',             label: 'Opus 4.6',   desc: 'Máxima capacidad' },
            { id: 'claude-sonnet-4-6',            label: 'Sonnet 4.6', desc: 'Equilibrado' },
            { id: 'claude-haiku-4-5-20251001',    label: 'Haiku 4.5',  desc: 'Más rápido' },
        ],
    },
    deepseek: {
        label: 'Deepseek',
        avatar: '◉',
        avatarColor: '#2563EB',
        models: [
            { id: 'deepseek-chat',     label: 'Chat',      desc: 'Conversacional' },
            { id: 'deepseek-reasoner', label: 'Reasoner',  desc: 'Razonamiento profundo' },
        ],
    },
} as const;

type ProviderKey = keyof typeof PROVIDERS;

// ── Tipos de archivo permitidos ─────────────────────────────
const ALLOWED_EXTENSIONS      = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg', '.webp', '.gif'];
const IMAGE_EXTENSIONS        = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

const fmtDate = (iso: string) => {
    const d   = new Date(iso);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) return 'Hoy';
    const ayer = new Date(hoy); ayer.setDate(hoy.getDate() - 1);
    if (d.toDateString() === ayer.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' });
};

const isImage = (name: string) => {
    const ext = `.${name.split('.').pop()?.toLowerCase()}`;
    return IMAGE_EXTENSIONS.includes(ext);
};

const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf')  return '📄';
    if (ext === 'docx') return '📝';
    if (ext === 'xlsx') return '📊';
    if (IMAGE_EXTENSIONS.includes(`.${ext}`)) return '🖼️';
    return '📎';
};

const EJEMPLOS = [
    '¿Cuántos procesos están en ejecución este mes?',
    '¿Qué proyectos tiene el cliente con más actividad?',
    '¿Cuáles son los procesos aprobados en los últimos 30 días?',
    '¿Cuántos consultores están activos actualmente?',
];

const TYPING_SPEED = 8;

// ── Modal de contexto ───────────────────────────────────────
interface ContextoChat {
    resumen: string | null;
    mensajes_resumidos: number;
    tokens_acumulados: number;
}

interface ContextoModalProps {
    contexto: ContextoChat | null;
    onClose: () => void;
}

export const ChatBot = () => {
    const { user } = useAuth();

    const [open,        setOpen]        = useState(false);
    const [view,        setView]        = useState<'list' | 'chat'>('list');
    const [chats,       setChats]       = useState<Chat[]>([]);
    const [activeChat,  setActiveChat]  = useState<Chat | null>(null);
    const [mensajes,    setMensajes]    = useState<Mensaje[]>([]);
    const [sugerencias, setSugerencias] = useState<string[]>([]);
    const [input,       setInput]       = useState('');
    const [sending,     setSending]     = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [errorMsg,    setErrorMsg]    = useState<string | null>(null);
    const [typingHtml,  setTypingHtml]  = useState<string>('');
    const [isTyping,    setIsTyping]    = useState(false);

    // ── Contexto modal ───────────────────────────────────────
    const [contextoData,    setContextoData]    = useState<ContextoChat | null>(null);
    const [showContexto,    setShowContexto]    = useState(false);

    // ── Proveedor / modelo ───────────────────────────────────
    const [provider,      setProvider]      = useState<ProviderKey>('claude');
    const [modelId,       setModelId]       = useState(PROVIDERS.claude.models[0].id);
    const [selectorOpen,  setSelectorOpen]  = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node))
                setSelectorOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const seleccionarModelo = (prov: ProviderKey, mid: any) => {
        setProvider(prov);
        setModelId(mid);
        setSelectorOpen(false);
    };

    const provActual  = PROVIDERS[provider];
    const modelActual = provActual.models.find(m => m.id === modelId) ?? provActual.models[0];

    // ── Archivos adjuntos ────────────────────────────────────
    const [archivos,    setArchivos]    = useState<File[]>([]);
    // Preview URLs para imágenes seleccionadas (pendientes de envío)
    const [previews,    setPreviews]    = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const bottomRef  = useRef<HTMLDivElement>(null);
    const inputRef   = useRef<HTMLTextAreaElement>(null);
    const typingRef  = useRef<boolean>(false);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => { if (open) scrollToBottom(); }, [mensajes, typingHtml, sending]);
    useEffect(() => { if (open && user) fetchChats(); }, [open, user]);

    // Libera object URLs al desmontar o cambiar archivos
    useEffect(() => {
        return () => { previews.forEach(URL.revokeObjectURL); };
    }, [previews]);

    const fetchChats = async () => {
        setLoadingList(true);
        try { setChats(await chatService.listar()); }
        catch { /* silencioso */ }
        finally { setLoadingList(false); }
    };

    const typeResponse = async (markdown: string): Promise<void> => {
        const html = markdownToHtml(markdown);
        setTypingHtml('');
        setIsTyping(true);
        typingRef.current = true;
        for (let i = 0; i < html.length; i++) {
            if (!typingRef.current) break;
            setTypingHtml(prev => prev + html[i]);
            await new Promise(r => setTimeout(r, TYPING_SPEED));
        }
        setIsTyping(false);
        typingRef.current = false;
    };

    const abrirChat = useCallback(async (chat: Chat) => {
        typingRef.current = false;
        setIsTyping(false);
        setTypingHtml('');
        setActiveChat(chat);
        setView('chat');
        setSugerencias([]);
        setErrorMsg(null);
        setArchivos([]);
        setPreviews([]);
        setContextoData(null);
        try {
            const { data, contexto } = await chatService.getMensajes(chat.id);
            setMensajes(data);
            setContextoData(contexto);
        } catch { setMensajes([]); }
        setTimeout(scrollToBottom, 80);
    }, []);

    const nuevoChat = async () => {
        if (!user) return;
        try {
            const chat = await chatService.crear({});
            setChats(prev => [chat, ...prev]);
            await abrirChat(chat);
        } catch { /* silencioso */ }
    };

    const eliminarChat = async (e: React.MouseEvent, chatId: string) => {
        e.stopPropagation();
        try {
            await chatService.eliminar(chatId);
            setChats(prev => prev.filter(c => c.id !== chatId));
            if (activeChat?.id === chatId) {
                typingRef.current = false;
                setIsTyping(false);
                setTypingHtml('');
                setView('list');
                setActiveChat(null);
                setMensajes([]);
                setArchivos([]);
                setPreviews([]);
            }
        } catch { /* silencioso */ }
    };

    // ── Selección de archivos (docs + imágenes) ──────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevos = Array.from(e.target.files ?? []).filter(f => {
            const ext = `.${f.name.split('.').pop()?.toLowerCase()}`;
            return ALLOWED_EXTENSIONS.includes(ext);
        });
        setArchivos(prev => {
            const combined = [...prev, ...nuevos].slice(0, 5);
            // Regenerar previews para imágenes
            const newPreviews = combined.map(f =>
                isImage(f.name) ? URL.createObjectURL(f) : ''
            );
            setPreviews(newPreviews);
            return combined;
        });
        e.target.value = '';
    };

    const quitarArchivo = (idx: number) => {
        setArchivos(prev => {
            const next = prev.filter((_, i) => i !== idx);
            const newPreviews = next.map(f =>
                isImage(f.name) ? URL.createObjectURL(f) : ''
            );
            setPreviews(newPreviews);
            return next;
        });
    };

    // ── Envío ────────────────────────────────────────────────
    const enviar = async (texto?: string) => {
        const pregunta = (texto ?? input).trim();
        if (!pregunta || sending || isTyping) return;

        let chatActual = activeChat;
        if (!chatActual) {
            try {
                chatActual = await chatService.crear({});
                setActiveChat(chatActual);
                setView('chat');
            } catch { return; }
        }

        const archivosNombres = archivos.map(f => f.name);
        // Guardar las preview URLs actuales para mostrarlas en el mensaje
        const previewsEnvio = [...previews];

        const tempUser: Mensaje = {
            id:           `tmp-${Date.now()}`,
            chat_id:      chatActual.id,
            rol:          'user',
            contenido:    pregunta,
            archivos:     archivosNombres,
            archivoPreviews: previewsEnvio,   // ← URLs de preview para imágenes
            indice_orden: mensajes.length,
            tokens:       null,
            createdAt:    new Date().toISOString(),
            updatedAt:    new Date().toISOString(),
        };

        setMensajes(prev => [...prev, tempUser]);
        setInput('');
        const archivosEnvio = [...archivos];
        setArchivos([]);
        setPreviews([]);
        setSending(true);
        setErrorMsg(null);
        setSugerencias([]);

        try {
            const formData = new FormData();
            formData.append('pregunta', pregunta);
            formData.append('provider', provider);
            formData.append('model',    modelId);
            archivosEnvio.forEach(f => formData.append('archivos', f));

            const res = await chatService.enviarConArchivos(chatActual.id, formData);

            setSending(false);
            await typeResponse(res.respuesta);

            const botMsg: Mensaje = {
                id:           `bot-${Date.now()}`,
                chat_id:      chatActual.id,
                rol:          'assistant',
                contenido:    res.respuesta,
                indice_orden: mensajes.length + 1,
                tokens:       null,
                createdAt:    new Date().toISOString(),
                updatedAt:    new Date().toISOString(),
            };

            setMensajes(prev => [...prev, botMsg]);
            setTypingHtml('');
            setSugerencias(res.sugerencias ?? []);

            // Actualizar contexto si viene en la respuesta
            if (res.contexto) setContextoData(res.contexto);

            if (mensajes.length === 0) {
                setChats(prev => prev.map(c =>
                    c.id === chatActual!.id ? { ...c, titulo: pregunta.slice(0, 80) } : c
                ));
                setActiveChat(prev => prev ? { ...prev, titulo: pregunta.slice(0, 80) } : prev);
            }
        } catch (err: any) {
            setSending(false);
            const msg = err?.response?.data?.mensaje;
            setErrorMsg(msg || 'No se pudo procesar tu solicitud. Intenta de nuevo.');
        } finally {
            inputRef.current?.focus();
        }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
    };

    return (
        <>
            <button
                className={`chatbot-bubble ${open ? 'chatbot-bubble--open' : ''}`}
                onClick={() => setOpen(o => !o)}
                title="Asistente IA"
                aria-label="Abrir asistente"
            >
                {open ? <X size={20} /> : <Bot size={20} />}
                {!open && chats.length > 0 && (
                    <span className="chatbot-bubble__badge">{chats.length}</span>
                )}
            </button>

            {open && (
                <div className="chatbot-panel">
                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="chatbot-panel__head">
                        <div className="chatbot-panel__icon"><Bot size={18} /></div>
                        <div>
                            <span>GA</span><span id='chatbot-panel__resaltado'>IA</span>
                        </div>

                        {/* Selector modelo */}
                        <div className="chatbot-model-selector" ref={selectorRef}>
                            <button
                                className="chatbot-model-trigger"
                                onClick={() => setSelectorOpen(o => !o)}
                                title="Cambiar modelo"
                            >
                                <span
                                    className="chatbot-model-trigger__dot"
                                    style={{ background: provActual.avatarColor }}
                                />
                                <span className="chatbot-model-trigger__label">
                                    {provActual.label} · {modelActual.label}
                                </span>
                                <span className={`chatbot-model-trigger__caret ${selectorOpen ? 'open' : ''}`}>▾</span>
                            </button>

                            {selectorOpen && (
                                <div className="chatbot-model-dropdown">
                                    {(Object.entries(PROVIDERS) as [ProviderKey, typeof PROVIDERS[ProviderKey]][]).map(([pKey, pVal]) => (
                                        <div key={pKey} className="chatbot-model-group">
                                            <div className="chatbot-model-group__header">
                                                <span style={{ color: pVal.avatarColor }}>{pVal.avatar}</span>
                                                {pVal.label}
                                            </div>
                                            {pVal.models.map(m => (
                                                <button
                                                    key={m.id}
                                                    className={`chatbot-model-option ${provider === pKey && modelId === m.id ? 'chatbot-model-option--active' : ''}`}
                                                    onClick={() => seleccionarModelo(pKey, m.id)}
                                                >
                                                    <span className="chatbot-model-option__name">{m.label}</span>
                                                    <span className="chatbot-model-option__desc">{m.desc}</span>
                                                    {provider === pKey && modelId === m.id && (
                                                        <span className="chatbot-model-option__check">✓</span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="chatbot-panel__actions">
                            {view === 'chat' && (
                                <>
                                    {/* ── Ícono "i" de contexto ── */}
                                    <button
                                        className="chatbot-head-btn chatbot-head-btn--info"
                                        onClick={() => setShowContexto(prev => !prev)}
                                        title="Ver contexto de la conversación"
                                    >
                                        <Info size={14} />
                                    </button>
                                    <button className="chatbot-head-btn" onClick={nuevoChat} title="Nueva conversación">
                                        <Plus size={14} />
                                    </button>
                                </>
                            )}
                            <button className="chatbot-head-btn" onClick={() => {
                                setOpen(false)
                                setShowContexto(false)
                            }} title="Cerrar">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* ── Lista de chats ───────────────────────────────────── */}
                    {view === 'list' && (
                        <div className="chatbot-sidebar">
                            <div className="chatbot-sidebar__toolbar">
                                <span className="chatbot-sidebar__label">Conversaciones</span>
                                <button className="chatbot-new-btn" onClick={nuevoChat}>
                                    <Plus size={12} /> Nueva
                                </button>
                            </div>
                            <div className="chatbot-chat-list">
                                {loadingList ? (
                                    <div className="chatbot-list-empty">
                                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    </div>
                                ) : chats.length === 0 ? (
                                    <div className="chatbot-list-empty">
                                        <MessageSquare size={24} strokeWidth={1.2}
                                            style={{ margin: '0 auto 8px', display: 'block', color: 'var(--border)' }} />
                                        Sin conversaciones aún.<br />
                                        <button className="chatbot-new-btn" style={{ margin: '10px auto 0' }} onClick={nuevoChat}>
                                            <Plus size={12} /> Comenzar
                                        </button>
                                    </div>
                                ) : chats.map(c => (
                                    <button
                                        key={c.id}
                                        className={`chatbot-chat-item ${activeChat?.id === c.id ? 'chatbot-chat-item--active' : ''}`}
                                        onClick={() => abrirChat(c)}
                                    >
                                        <span className="chatbot-chat-item__dot" />
                                        <span className="chatbot-chat-item__title">{c.titulo}</span>
                                        <span className="chatbot-chat-item__date">{fmtDate(c.updatedAt)}</span>
                                        <span className="chatbot-chat-item__del" onClick={e => eliminarChat(e, c.id)} title="Eliminar">
                                            <Trash2 size={11} />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Conversación ─────────────────────────────────────── */}
                    {view === 'chat' && activeChat && (
                        <div className="chatbot-conv">
                            <div className="chatbot-conv__subhead">
                                <button className="chatbot-conv__back" onClick={() => setView('list')} title="Volver">
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="chatbot-conv__title">{activeChat.titulo}</span>
                            </div>
                                    {
                                        showContexto && <div className="chatbot-contexto">
            <div className="chatbot-contexto__head">
                <span className="chatbot-contexto__title">
                    <Info size={13} />
                    Contexto de la conversación
                </span>

                <button
                    className="chatbot-head-btn chatbot-head-btn--info"
                    onClick={() => setShowContexto(true)}
                    title="Ver contexto completo"
                >
                    <Info size={14} />
                </button>
            </div>

            {contextoData?.resumen ? (
                <div className="chatbot-contexto__resumen">
                    {contextoData.resumen}
                </div>
            ) : (
                <div className="chatbot-contexto__empty">
                    Aún no hay suficiente historial para generar un resumen.
                </div>
            )}

        </div>
                                    }

                            <div className="chatbot-messages">
                                {mensajes.length === 0 && !sending && !isTyping && (
                                    <div className="chatbot-welcome">
                                        <div className="chatbot-welcome__icon"><Bot size={22} /></div>
                                        <p className="chatbot-welcome__title">¿En qué puedo ayudarte?</p>
                                        <p className="chatbot-welcome__sub">
                                            Pregunta sobre clientes, proyectos, procesos o consultores. También puedes adjuntar archivos PDF, Word, Excel e imágenes.
                                        </p>
                                        <div className="chatbot-welcome__examples">
                                            {EJEMPLOS.map(ej => (
                                                <button key={ej} className="chatbot-welcome__ex" onClick={() => enviar(ej)}>
                                                    {ej}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mensajes.map(m => (
                                    <div key={m.id} className={`chatbot-bubble-msg chatbot-bubble-msg--${m.rol}`}>

                                        {/* Archivos adjuntos del usuario */}
                                        {m.rol === 'user' && m.archivos && m.archivos.length > 0 && (
                                            <div className="chatbot-msg-files">
                                                {m.archivos.map((nombre: string, idx: number) =>
                                                    isImage(nombre) && m.archivoPreviews?.[idx] ? (
                                                        /* Preview de imagen */
                                                        <div key={nombre} className="chatbot-msg-img-wrap">
                                                            <img
                                                                src={m.archivoPreviews[idx]}
                                                                alt={nombre}
                                                                className="chatbot-msg-img"
                                                            />
                                                            <span className="chatbot-msg-img-name">{nombre}</span>
                                                        </div>
                                                    ) : (
                                                        /* Chip de documento */
                                                        <span key={nombre} className="chatbot-msg-file-chip">
                                                            {fileIcon(nombre)} {nombre}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        )}

                                        {m.rol === 'assistant' ? (
                                            <div
                                                className="chatbot-bubble-msg__text chatbot-bubble-msg__text--html"
                                                dangerouslySetInnerHTML={{ __html: markdownToHtml(m.contenido) }}
                                            />
                                        ) : (
                                            <div className="chatbot-bubble-msg__text">{m.contenido}</div>
                                        )}
                                        <span className="chatbot-bubble-msg__time">{fmtTime(m.createdAt)}</span>
                                    </div>
                                ))}

                                {sending && (
                                    <div className="chatbot-typing"><span /><span /><span /></div>
                                )}

                                {isTyping && typingHtml && (
                                    <div className="chatbot-bubble-msg chatbot-bubble-msg--assistant">
                                        <div
                                            className="chatbot-bubble-msg__text chatbot-bubble-msg__text--html"
                                            dangerouslySetInnerHTML={{ __html: typingHtml }}
                                        />
                                        <span className="chatbot-bubble-msg__cursor">▍</span>
                                    </div>
                                )}

                                {errorMsg && <div className="chatbot-error-msg">{errorMsg}</div>}
                                <div ref={bottomRef} />
                            </div>

                            {sugerencias.length > 0 && !sending && !isTyping && (
                                <div className="chatbot-suggestions">
                                    {sugerencias.map(s => (
                                        <button key={s} className="chatbot-suggestion-chip" onClick={() => enviar(s)}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* ── Chips de archivos pendientes ────────────── */}
                            {archivos.length > 0 && (
                                <div className="chatbot-attached-files">
                                    {archivos.map((f, i) => (
                                        <div key={i} className="chatbot-attached-chip">
                                            {isImage(f.name) && previews[i] ? (
                                                /* Thumbnail para imágenes */
                                                <img
                                                    src={previews[i]}
                                                    alt={f.name}
                                                    className="chatbot-attached-chip__thumb"
                                                />
                                            ) : (
                                                <span>{fileIcon(f.name)}</span>
                                            )}
                                            <span className="chatbot-attached-chip__name" title={f.name}>
                                                {f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name}
                                            </span>
                                            <button
                                                className="chatbot-attached-chip__remove"
                                                onClick={() => quitarArchivo(i)}
                                                title="Quitar archivo"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="chatbot-input-bar">
                                {/* Input oculto para archivos + imágenes */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.gif"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />

                                <button
                                    className={`chatbot-attach-btn ${archivos.length > 0 ? 'chatbot-attach-btn--active' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={sending || isTyping || archivos.length >= 5}
                                    title="Adjuntar archivo (PDF, Word, Excel, imágenes)"
                                >
                                    <Paperclip size={15} />
                                </button>

                                <textarea
                                    ref={inputRef}
                                    className="chatbot-input"
                                    placeholder="Escribe tu pregunta…"
                                    value={input}
                                    rows={1}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    disabled={sending || isTyping}
                                />
                                <button
                                    className="chatbot-send-btn"
                                    onClick={() => enviar()}
                                    disabled={!input.trim() || sending || isTyping}
                                    title="Enviar (Enter)"
                                >
                                    {sending
                                        ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                                        : <Send size={15} />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
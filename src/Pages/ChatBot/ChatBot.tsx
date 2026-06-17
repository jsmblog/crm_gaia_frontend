import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Bot, X, Plus, Send, ChevronLeft, Trash2,
    MessageSquare, Loader2, Paperclip, Info, MoreVertical, Globe,
    Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { chatService } from '../../Services/chatService';
import { useAuth } from '../../Context/AuthContext';
import { markdownToHtml } from '../../Utils/markdownToHtml';
import type { Chat, ContextoChat, Mensaje } from '../../Interfaces/i_chat';
import './ChatBot.css';
import { executeActions } from '../../Components/AI/actionDispactcher';
import { PROVIDERS } from '../../Constants/providers';
import { ALLOWED_EXTENSIONS } from '../../Constants/allowed_extension';
import { useToast } from '../../Hooks/useToast';
import { fmtDate } from '../../Utils/fmtDate';
import { useSpeechRecognition } from './UseSpeechRecognition';
import { EJEMPLOS, fileIcon, fmtTime, isImage, TYPING_SPEED } from '../../Constants/chat';
export type ProviderKey = keyof typeof PROVIDERS;

export const ChatBot = () => {
    const { user, updateUser } = useAuth();
    const { toast, ToastContainer } = useToast();

    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [mensajes, setMensajes] = useState<Mensaje[]>([]);
    const [sugerencias, setSugerencias] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [typingHtml, setTypingHtml] = useState<string>('');
    const [isTyping, setIsTyping] = useState(false);
    const [contextoData, setContextoData] = useState<ContextoChat | null>(null);
    const [showContexto, setShowContexto] = useState(false);
    const [provider, setProvider] = useState<ProviderKey>('deepseek');
    const [modelId, setModelId] = useState(PROVIDERS.deepseek.models[0].id);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    const [optionsOpen, setOptionsOpen] = useState(false);
    const [webSearch, setWebSearch] = useState(false);
    const allowAttach = true;
    const optionsRef = useRef<HTMLDivElement>(null);

    const [archivos, setArchivos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const typingRef = useRef<boolean>(false);
 
const tokensBadge = user?.rol === "admin" ? (
  <span className="chatbot-tokens-badge chatbot-tokens-badge--admin" title="Tokens ilimitados">
    ∞
  </span>
) : user?.tokens !== undefined ? (
  <span
    className={`chatbot-tokens-badge ${user.tokens <= 10 ? 'chatbot-tokens-badge--danger' : user.tokens <= 30 ? 'chatbot-tokens-badge--warn' : ''}`}
    title={user.renovacion_tokens ? `Próxima renovación: ${new Date(new Date(user.renovacion_tokens).getTime() + 30*24*60*60*1000).toLocaleDateString()}` : ''}
  >
    ⚡ {user.tokens}
  </span>
) : null;

    const { transcript, listening, startListening, stopListening, resetTranscript, browserSupport } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {

            setInput(transcript);
            resetTranscript();
        }
    }, [transcript, resetTranscript]);

    useEffect(() => {
        if (sending && listening) stopListening();
    }, [sending, listening, stopListening]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(e.target as Node))
                setSelectorOpen(false);
            if (optionsRef.current && !optionsRef.current.contains(e.target as Node))
                setOptionsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    useEffect(() => { if (open) scrollToBottom(); }, [mensajes, typingHtml, sending]);
    useEffect(() => { if (open && user) fetchChats(); }, [open, user]);
    useEffect(() => { return () => { previews.forEach(URL.revokeObjectURL); }; }, [previews]);

    const seleccionarModelo = (prov: ProviderKey, mid: any) => {
        setProvider(prov);
        setModelId(mid);
        setSelectorOpen(false);
    };

    const provActual = PROVIDERS[provider];
    const modelActual = provActual.models.find(m => m.id === modelId) ?? provActual.models[0];

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
        } catch { }
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
        } catch { }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuevos = Array.from(e.target.files ?? []).filter(f => {
            const ext = `.${f.name.split('.').pop()?.toLowerCase()}`;
            return ALLOWED_EXTENSIONS.includes(ext);
        });
        setArchivos(prev => {
            const combined = [...prev, ...nuevos].slice(0, 5);
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

    const enviar = async (texto?: string) => {
        if (listening) stopListening();

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
        const previewsEnvio = [...previews];

        const tempUser: Mensaje = {
            id: `tmp-${Date.now()}`,
            chat_id: chatActual.id,
            rol: 'user',
            contenido: pregunta,
            archivos: archivosNombres,
            archivoPreviews: previewsEnvio,
            indice_orden: mensajes.length,
            tokens: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setMensajes(prev => [...prev, tempUser]);
        setInput('');
        const archivosEnvio = [...archivos];
        setArchivos([]);
        setPreviews([]);
        setSending(true);
        setSugerencias([]);

        try {
            const formData = new FormData();
            formData.append('pregunta', pregunta);
            formData.append('provider', provider);
            formData.append('model', modelId);
            formData.append('currentRoute', window.location.pathname);
            formData.append('webSearch', webSearch.toString());
            formData.append('allowAttach', allowAttach.toString());
            archivosEnvio.forEach(f => formData.append('archivos', f));

            const res = await chatService.enviarConArchivos(chatActual.id, formData);

            setSending(false);
            await typeResponse(res.respuesta);
            if (res.actions?.length) await executeActions(res.actions);

            const botMsg: Mensaje = {
                id: `bot-${Date.now()}`,
                chat_id: chatActual.id,
                rol: 'assistant',
                contenido: res.respuesta,
                indice_orden: mensajes.length + 1,
                tokens: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setMensajes(prev => [...prev, botMsg]);
            setTypingHtml('');
            setSugerencias(res.sugerencias ?? []);
            if (res.contexto) {
                setContextoData(prev => ({
                    id: (prev && prev.id) || `ctx-${Date.now()}`,
                    chat_id: (prev && prev.chat_id) || chatActual.id,
                    ...(prev ?? {}),
                    ...res.contexto,
                } as ContextoChat));
            }

            if (mensajes.length === 0) {
                setChats(prev => prev.map(c =>
                    c.id === chatActual!.id ? { ...c, titulo: pregunta.slice(0, 80) } : c
                ));
                setActiveChat(prev => prev ? { ...prev, titulo: pregunta.slice(0, 80) } : prev);
            }
            if (res.tokens_ia && updateUser) {
                updateUser({
                    tokens: res.tokens_ia.disponibles,
                    renovacion_tokens: res.tokens_ia.renovacion ? new Date(res.tokens_ia.renovacion) : null,
                });
            }
        } catch (err: any) {
            setSending(false);
            const codigo = err?.response?.data?.codigo;
            const msg = err?.response?.data?.mensaje;

            if (codigo === 'SIN_TOKENS' || codigo === 'IA_DESACTIVADA') {
                toast.error(msg);
                return;
            }
            toast.error(msg || 'No se pudo procesar tu solicitud. Intenta de nuevo.');
        } finally {
            inputRef.current?.focus();
        }
    };

    const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); }
    };

    const sidebarJSX = (
        <>
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
        </>
    );

    const chatBodyJSX = (
        <>
            {showContexto && (
                <div className="chatbot-contexto">
                    <div className="chatbot-contexto__head">
                        <span className="chatbot-contexto__title">
                            <Info size={13} /> Contexto de la conversación
                        </span>
                    </div>
                    {contextoData?.resumen ? (
                        <div className="chatbot-contexto__resumen">{contextoData.resumen}</div>
                    ) : (
                        <div className="chatbot-contexto__empty">
                            Aún no hay suficiente historial para generar un resumen.
                        </div>
                    )}
                </div>
            )}

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
                        {m.rol === 'user' && m.archivos && m.archivos.length > 0 && (
                            <div className="chatbot-msg-files">
                                {m.archivos.map((nombre: string, idx: number) =>
                                    isImage(nombre) && m.archivoPreviews?.[idx] ? (
                                        <div key={nombre} className="chatbot-msg-img-wrap">
                                            <img src={m.archivoPreviews[idx]} alt={nombre} className="chatbot-msg-img" />
                                            <span className="chatbot-msg-img-name">{nombre}</span>
                                        </div>
                                    ) : (
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

                {sending && <div className="chatbot-typing"><span /><span /><span /></div>}

                {isTyping && typingHtml && (
                    <div className="chatbot-bubble-msg chatbot-bubble-msg--assistant">
                        <div
                            className="chatbot-bubble-msg__text chatbot-bubble-msg__text--html"
                            dangerouslySetInnerHTML={{ __html: typingHtml }}
                        />
                        <span className="chatbot-bubble-msg__cursor">▍</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {sugerencias.length > 0 && !sending && !isTyping && (
                <div className="chatbot-suggestions">
                    {sugerencias.map(s => (
                        <button key={s} className="chatbot-suggestion-chip" onClick={() => enviar(s)}>{s}</button>
                    ))}
                </div>
            )}

            {archivos.length > 0 && (
                <div className="chatbot-attached-files">
                    {archivos.map((f, i) => (
                        <div key={i} className="chatbot-attached-chip">
                            {isImage(f.name) && previews[i]
                                ? <img src={previews[i]} alt={f.name} className="chatbot-attached-chip__thumb" />
                                : <span>{fileIcon(f.name)}</span>
                            }
                            <span className="chatbot-attached-chip__name" title={f.name}>
                                {f.name.length > 20 ? f.name.slice(0, 18) + '…' : f.name}
                            </span>
                            <button className="chatbot-attached-chip__remove" onClick={() => quitarArchivo(i)} title="Quitar">
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="chatbot-input-bar">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.webp,.gif"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                <div className="chatbot-options-menu" ref={optionsRef}>
                    <button
                        className={`chatbot-head-btn chatbot-head-btn--input ${optionsOpen ? 'active' : ''}`}
                        onClick={() => setOptionsOpen(o => !o)}
                        title="Opciones y Archivos"
                    >
                        <MoreVertical size={18} />
                    </button>
                    {optionsOpen && (
                        <div className="chatbot-options-dropdown chatbot-options-dropdown--upward">
                            <button
                                className={`chatbot-option-item ${webSearch ? 'chatbot-option-item--active' : ''}`}
                                onClick={() => setWebSearch(w => !w)}
                            >
                                <Globe size={14} />
                                <span>Buscar por internet</span>
                                <span className="chatbot-option-toggle">{webSearch ? '✓' : ''}</span>
                            </button>
                            <button
                                className={`chatbot-option-item ${archivos.length > 0 ? 'chatbot-option-item--active' : ''}`}
                                onClick={() => { fileInputRef.current?.click(); setOptionsOpen(false); }}
                                disabled={sending || isTyping || archivos.length >= 5}
                            >
                                <Paperclip size={14} />
                                <span>Adjuntar archivos</span>
                                {archivos.length > 0 && <span className="chatbot-option-badge">{archivos.length}</span>}
                            </button>
                        </div>
                    )}
                </div>

                {browserSupport && (
                    <button
                        className={`chatbot-voice-btn ${listening ? 'chatbot-voice-btn--recording' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (listening) {
                                stopListening();
                            } else {
                                startListening();
                            }
                        }}
                        title={listening ? 'Detener grabación' : 'Grabar voz (tiempo real)'}
                        disabled={sending || isTyping}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {listening ? (
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                            ) : (
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2" />
                            )}
                        </svg>
                    </button>
                )}

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
        </>
    );

    return (
        <>
            <ToastContainer />
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
                <>
                    {expanded && <div className="chatbot-overlay" onClick={() => setExpanded(false)} />}

                    <div className={`chatbot-panel ${expanded ? 'chatbot-panel--expanded' : ''}`}>
                        <div className="chatbot-panel__head">
                            <div className="chatbot-panel__icon"><Bot size={18} /></div>
                            <div><span>GA</span><span id='chatbot-panel__resaltado'>IA</span></div>

                            <div className="chatbot-model-selector" ref={selectorRef}>
                                <button className="chatbot-model-trigger" onClick={() => setSelectorOpen(o => !o)} title="Cambiar modelo">
                                    <span className="chatbot-model-trigger__dot" style={{ background: provActual.avatarColor }} />
                                    <span className="chatbot-model-trigger__label">{provActual.label} · {modelActual.label}</span>
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
                                                        {provider === pKey && modelId === m.id && <span className="chatbot-model-option__check">✓</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {tokensBadge}
                            <div className="chatbot-panel__actions">
                                {(view === 'chat' || expanded) && (
                                    <>
                                        {expanded && (
                                            <button className="chatbot-head-btn" onClick={() => setSidebarCollapsed(p => !p)} title={sidebarCollapsed ? 'Mostrar sidebar' : 'Ocultar sidebar'}>
                                                {sidebarCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
                                            </button>
                                        )}
                                        <button className="chatbot-head-btn chatbot-head-btn--info" onClick={() => setShowContexto(prev => !prev)} title="Ver contexto">
                                            <Info size={14} />
                                        </button>
                                        <button className="chatbot-head-btn" onClick={nuevoChat} title="Nueva conversación">
                                            <Plus size={14} />
                                        </button>
                                    </>
                                )}
                                <button className="chatbot-head-btn chatbot-head-btn--expand" onClick={() => setExpanded(p => !p)} title={expanded ? 'Contraer' : 'Expandir'}>
                                    {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                </button>
                                <button className="chatbot-head-btn" onClick={() => { setOpen(false); setExpanded(false); setShowContexto(false); }} title="Cerrar">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {expanded ? (
                            <div className="chatbot-expanded-body">
                                <div className={`chatbot-expanded-sidebar ${sidebarCollapsed ? 'chatbot-expanded-sidebar--collapsed' : ''}`}>
                                    {!sidebarCollapsed && sidebarJSX}
                                </div>
                                <div className="chatbot-expanded-main">
                                    {activeChat ? (
                                        <>
                                            <div className="chatbot-expanded-conv-title"><span>{activeChat.titulo}</span></div>
                                            <div className="chatbot-conv" style={{ flex: 1 }}>{chatBodyJSX}</div>
                                        </>
                                    ) : (
                                        <div className="chatbot-expanded-empty">
                                            <div className="chatbot-expanded-empty__icon"><Bot size={40} strokeWidth={1.2} /></div>
                                            <h3 className="chatbot-expanded-empty__title">Asistente GAIA</h3>
                                            <p className="chatbot-expanded-empty__sub">Selecciona una conversación o crea una nueva para comenzar.</p>
                                            <button className="chatbot-new-btn chatbot-new-btn--lg" onClick={nuevoChat}><Plus size={14} /> Nueva conversación</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                {view === 'list' && <div className="chatbot-sidebar">{sidebarJSX}</div>}
                                {view === 'chat' && activeChat && (
                                    <div className="chatbot-conv">
                                        <div className="chatbot-conv__subhead">
                                            <button className="chatbot-conv__back" onClick={() => setView('list')} title="Volver"><ChevronLeft size={14} /></button>
                                            <span className="chatbot-conv__title">{activeChat.titulo}</span>
                                        </div>
                                        {chatBodyJSX}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
};
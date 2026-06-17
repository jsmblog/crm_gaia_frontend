import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/AuthContext";
import { userAdminService, type AdminUser } from "../../Services/userAdminService";
import { useToast } from "../../Hooks/useToast";
import "./AdminUsers.css";
import { Plus, Search } from "lucide-react";
import { fmtDate } from "../../Utils/fmtDate";

export const AdminUsers: React.FC = () => {
    const { user } = useAuth();
    const { toast, ToastContainer } = useToast();

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterIa, setFilterIa] = useState<boolean | undefined>(undefined);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [addTokensModal, setAddTokensModal] = useState<{ id: string; nombre: string } | null>(null);
    const [cantidadTokens, setCantidadTokens] = useState<number>(10);
    const limit = 10;
    const [removeTokensModal, setRemoveTokensModal] = useState<{ id: string; nombre: string; tokens: number } | null>(null);
    const [cantidadQuitar, setCantidadQuitar] = useState<number>(1);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await userAdminService.getAll({
                search: search || undefined,
                ia_activa: filterIa,
                page,
                limit,
            });
            if (res.ok) {
                setUsers(res.data);
                setTotalPages(res.pagination.totalPages);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.mensaje || "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [search, filterIa, page]);

    const toggleIa = async (id: string, current: boolean) => {
        try {
            const res = await userAdminService.updateIaActiva(id, !current);
            if (res.ok) {
                toast.success(res.mensaje);
                setUsers(prev => prev.map(u => (u.id === id ? { ...u, ia_activa: !current } : u)));
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.mensaje || "Error al actualizar IA");
        }
    };

    const handleRenovar = async (id: string) => {
        if (!confirm("¿Renovar tokens a 100 para este usuario?")) return;
        try {
            const res = await userAdminService.renovarTokens(id);
            if (res.ok) {
                toast.success(res.mensaje);
                setUsers(prev =>
                    prev.map(u =>
                        u.id === id
                            ? { ...u, tokens: res.data.tokens, renovacion_tokens: res.data.renovacion_tokens }
                            : u
                    )
                );
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.mensaje || "Error al renovar tokens");
        }
    };

    const handleAddTokens = async () => {
        if (!addTokensModal) return;
        if (!cantidadTokens || cantidadTokens <= 0) {
            toast.error("Ingresa una cantidad válida");
            return;
        }
        try {
            const res = await userAdminService.addTokens(addTokensModal.id, cantidadTokens);
            if (res.ok) {
                toast.success(res.mensaje);
                setUsers(prev =>
                    prev.map(u =>
                        u.id === addTokensModal.id
                            ? { ...u, tokens: res.data.tokens }
                            : u
                    )
                );
                setAddTokensModal(null);
                setCantidadTokens(10);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.mensaje || "Error al agregar tokens");
        }
    };

    const handleRemoveTokens = async () => {
        if (!removeTokensModal) return;
        if (!cantidadQuitar || cantidadQuitar <= 0) {
            toast.error("Ingresa una cantidad válida");
            return;
        }
        if (cantidadQuitar > removeTokensModal.tokens) {
            toast.error(`No tiene suficientes tokens (máximo ${removeTokensModal.tokens})`);
            return;
        }
        try {
            const res = await userAdminService.removeTokens(removeTokensModal.id, cantidadQuitar);
            if (res.ok) {
                toast.success(res.mensaje);
                setUsers(prev =>
                    prev.map(u =>
                        u.id === removeTokensModal.id
                            ? { ...u, tokens: res.data.tokens }
                            : u
                    )
                );
                setRemoveTokensModal(null);
                setCantidadQuitar(1);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.mensaje || "Error al quitar tokens");
        }
    };


    if (!user || user.rol !== "admin") {
        return <div className="admin-users__unauthorized">Acceso restringido a administradores</div>;
    }

    return (
        <div className="soporte-page">
            <ToastContainer />

            {addTokensModal && (
                <div className="modal-overlay" onClick={() => setAddTokensModal(null)}>
                    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
                        <div className="modal__head">
                            <div>
                                <h3 className="modal__title">Agregar tokens</h3>
                                <p className="modal__sub">Usuario: <strong>{addTokensModal.nombre}</strong></p>
                            </div>
                            <button className="modal__close" onClick={() => setAddTokensModal(null)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="mfield">
                                <label className="mfield__label">Cantidad de tokens a agregar</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={cantidadTokens}
                                    onChange={e => setCantidadTokens(parseInt(e.target.value) || 0)}
                                    className="mfield__input"
                                />
                            </div>
                        </div>
                        <div className="modal__foot">
                            <button className="modal__btn modal__btn--ghost" onClick={() => setAddTokensModal(null)}>
                                Cancelar
                            </button>
                            <button className="modal__btn modal__btn--primary" onClick={handleAddTokens}>
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {removeTokensModal && (
                <div className="modal-overlay" onClick={() => setRemoveTokensModal(null)}>
                    <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
                        <div className="modal__head">
                            <div>
                                <h3 className="modal__title">Quitar tokens</h3>
                                <p className="modal__sub">
                                    Usuario: <strong>{removeTokensModal.nombre}</strong> (tokens actuales: {removeTokensModal.tokens})
                                </p>
                            </div>
                            <button className="modal__close" onClick={() => setRemoveTokensModal(null)}>✕</button>
                        </div>
                        <div className="modal__body">
                            <div className="mfield">
                                <label className="mfield__label">Cantidad a quitar</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={removeTokensModal.tokens}
                                    value={cantidadQuitar}
                                    onChange={e => setCantidadQuitar(parseInt(e.target.value) || 0)}
                                    className="mfield__input"
                                />
                            </div>
                        </div>
                        <div className="modal__foot">
                            <button className="modal__btn modal__btn--ghost" onClick={() => setRemoveTokensModal(null)}>
                                Cancelar
                            </button>
                            <button className="modal__btn modal__btn--danger" onClick={handleRemoveTokens}>
                                Quitar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <section className="soporte-section">
                <div className="soporte-section__head">
                    <div>
                        <h2 className="soporte-section__title">Gestión de usuarios</h2>
                        <span className="soporte-section__subtitle">Administra acceso y tokens de IA</span>
                    </div>
                    <button className="btn-new" onClick={() => { }} disabled>
                        <Plus size={15} /> (Solo lectura)
                    </button>
                </div>

                <div className="table-card">
                    <div className="table-card__toolbar">
                        <span className="table-card__label">Usuarios registrados</span>
                        <div className="table-search">
                            <Search size={13} className="table-search__icon" />
                            <input
                                className="table-search__input"
                                placeholder="Buscar por nombre o email…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select
                            className="table-filter"
                            value={filterIa === undefined ? "" : filterIa ? "true" : "false"}
                            onChange={e => {
                                const val = e.target.value;
                                setFilterIa(val === "" ? undefined : val === "true");
                            }}
                        >
                            <option value="">Todos (IA)</option>
                            <option value="true">IA Activa</option>
                            <option value="false">IA Inactiva</option>
                        </select>
                        <span className="table-card__count">{users.length} / {users.length + (totalPages - 1) * limit}</span>
                    </div>

                    <div className="table-wrap">
                        <table className="ctable">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Tokens</th>
                                    <th>Renovación</th>
                                    <th>IA</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="ctable__empty">Cargando…</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={6} className="ctable__empty">Sin resultados</td></tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="ctable__user-cell">
                                                    <span className="ctable__avatar">{u.nombre.charAt(0).toUpperCase()}</span>
                                                    <span className="ctable__name">{u.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="ctable__email">{u.email}</td>
                                            <td>
                                                <div className="ctable__tokens-cell">
                                                    <span className={`ctable__tokens ${u.tokens <= 10 ? "low" : ""}`}>{u.tokens}</span>
                                                    <span className="ctable__tokens-label">/ 100</span>
                                                </div>
                                            </td>
                                            <td className="ctable__date">{fmtDate(u.renovacion_tokens)}</td>
                                            <td>
                                                <span className={`badge ${u.ia_activa ? 'badge--activa' : 'badge--inactiva'}`}>
                                                    {u.ia_activa ? "Activa" : "Inactiva"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="ctable__actions">
                                                    <button
                                                        className="action-btn action-btn--toggle"
                                                        onClick={() => toggleIa(u.id, u.ia_activa)}
                                                        title={u.ia_activa ? "Desactivar IA" : "Activar IA"}
                                                    >
                                                        {u.ia_activa ? "⏸" : "▶"}
                                                    </button>
                                                    <button
                                                        className="action-btn action-btn--add"
                                                        onClick={() => { setAddTokensModal({ id: u.id, nombre: u.nombre }); setCantidadTokens(10); }}
                                                        title="Agregar tokens"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        className="action-btn action-btn--remove"
                                                        onClick={() => {
                                                            setRemoveTokensModal({ id: u.id, nombre: u.nombre, tokens: u.tokens });
                                                            setCantidadQuitar(1);
                                                        }}
                                                        title="Quitar tokens"
                                                        disabled={u.tokens <= 0}
                                                    >
                                                        −
                                                    </button>
                                                    <button
                                                        className="action-btn action-btn--renew"
                                                        onClick={() => handleRenovar(u.id)}
                                                        title="Renovar tokens a 100"
                                                    >
                                                        ↻
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pagination">
                    <button
                        className="page-btn"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Anterior
                    </button>
                    <span className="page-info">Página {page} de {totalPages}</span>
                    <button
                        className="page-btn"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            </section>
        </div>
    );
};
import { useState } from 'react';
import { useAuth }   from '../../Context/AuthContext';
import { useToast }  from '../../Hooks/useToast';
import {
  User, Mail, Shield, Eye, EyeOff, Loader2, CheckCircle2,
} from 'lucide-react';
import './Perfil.css';
import { perfilService } from '../../Services/perfilService';

export const Perfil = () => {
  const { user } = useAuth();
  const { toast, ToastContainer } = useToast();

  const [actual,    setActual]    = useState('');
  const [nueva,     setNueva]     = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  const [showActual,    setShowActual]    = useState(false);
  const [showNueva,     setShowNueva]     = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actual || !nueva || !confirmar)
      return toast.warning('Completa todos los campos');
    if (nueva.length < 6)
      return toast.warning('La contraseña debe tener al menos 6 caracteres');
    if (nueva !== confirmar)
      return toast.error('Las contraseñas no coinciden');

    setLoading(true);
    setSuccess(false);
    try {
      await perfilService.changePass({ passwordActual: actual, passwordNueva: nueva });
      setSuccess(true);
      setActual(''); setNueva(''); setConfirmar('');
      toast.success('Contraseña actualizada correctamente');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al actualizar contraseña';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const rolLabel = (rol?: string) => {
    if (!rol) return '—';
    return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
  };

  const strengthLevel = (pw: string) =>
    pw.length < 6 ? 'weak' : pw.length < 10 ? 'medium' : 'strong';

  const strengthText = (pw: string) =>
    pw.length < 6 ? 'Muy corta' : pw.length < 10 ? 'Aceptable' : 'Segura';

  return (
    <>
      <ToastContainer />

      <div className="perfil-root">

        <div className="perfil-hero">
          <div className="perfil-avatar">
            <span className="perfil-avatar__letter">
              {typeof user?.nombre === 'string'
                ? user.nombre.charAt(0).toUpperCase()
                : 'G'}
            </span>
          </div>
          <div className="perfil-hero__info">
            <h1 className="perfil-hero__name">{user?.nombre ?? '—'}</h1>
            <p className="perfil-hero__email">{user?.email ?? '—'}</p>
          </div>
          <div className={`perfil-badge ${user?.activo ? 'perfil-badge--active' : 'perfil-badge--inactive'}`}>
            {user?.activo ? 'Activo' : 'Inactivo'}
          </div>
        </div>

        <div className="perfil-layout">

          <section className="perfil-card perfil-info">
            <p className="perfil-section-label">Información de cuenta</p>

            <div className="perfil-detail-row">
              <span className="perfil-detail-icon"><User size={13} /></span>
              <span className="perfil-detail-key">Nombre</span>
              <span className="perfil-detail-val">{user?.nombre ?? '—'}</span>
            </div>

            <div className="perfil-detail-row">
              <span className="perfil-detail-icon"><Mail size={13} /></span>
              <span className="perfil-detail-key">Correo</span>
              <span className="perfil-detail-val">{user?.email ?? '—'}</span>
            </div>

            <div className="perfil-detail-row">
              <span className="perfil-detail-icon"><Shield size={13} /></span>
              <span className="perfil-detail-key">Rol</span>
              <span className="perfil-detail-val">{rolLabel(user?.rol)}</span>
            </div>
          </section>

          <section className="perfil-card perfil-password">
            <p className="perfil-section-label">Seguridad</p>
            <h2 className="perfil-card__title">Cambiar contraseña</h2>

            <form className="perfil-form" onSubmit={handleSubmit} noValidate>

              <div className="perfil-form__field">
                <label className="perfil-form__label" htmlFor="actual">Contraseña actual</label>
                <div className="perfil-form__wrap">
                  <input
                    id="actual"
                    className="perfil-form__input"
                    type={showActual ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                    value={actual}
                    onChange={e => setActual(e.target.value)}
                  />
                  <button type="button" className="perfil-form__eye" onClick={() => setShowActual(p => !p)} aria-label="Mostrar contraseña actual">
                    {showActual ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="perfil-form__field">
                <label className="perfil-form__label" htmlFor="nueva">Nueva contraseña</label>
                <div className="perfil-form__wrap">
                  <input
                    id="nueva"
                    className="perfil-form__input"
                    type={showNueva ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    value={nueva}
                    onChange={e => setNueva(e.target.value)}
                  />
                  <button type="button" className="perfil-form__eye" onClick={() => setShowNueva(p => !p)} aria-label="Mostrar nueva contraseña">
                    {showNueva ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {nueva && (
                  <div className="perfil-strength">
                    <div className="perfil-strength__track">
                      <div className={`perfil-strength__fill perfil-strength__fill--${strengthLevel(nueva)}`} />
                    </div>
                    <span className={`perfil-strength__label perfil-strength__label--${strengthLevel(nueva)}`}>
                      {strengthText(nueva)}
                    </span>
                  </div>
                )}
              </div>

              <div className="perfil-form__field">
                <label className="perfil-form__label" htmlFor="confirmar">Confirmar contraseña</label>
                <div className="perfil-form__wrap">
                  <input
                    id="confirmar"
                    className="perfil-form__input"
                    type={showConfirmar ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    autoComplete="new-password"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                  />
                  <button type="button" className="perfil-form__eye" onClick={() => setShowConfirmar(p => !p)} aria-label="Confirmar nueva contraseña">
                    {showConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button className="perfil-btn" type="submit" disabled={loading}>
                {loading
                  ? <Loader2 size={15} className="perfil-spinner" />
                  : success
                    ? <><CheckCircle2 size={15} /> Contraseña actualizada</>
                    : 'Guardar contraseña'
                }
              </button>

            </form>
          </section>

        </div>
      </div>
    </>
  );
};
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast }      from '../../Hooks/useToast';
import { loginService }  from '../../Services/authService';
import { useAuth }       from '../../Context/AuthContext';
import { useNavigate }   from 'react-router-dom';
import './Auth.css';

export const Auth = () => {
 const { login }                 = useAuth();
  const { toast, ToastContainer } = useToast();
  const navigate                  = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return toast.warning('Completa todos los campos');

    setLoading(true);
    try {
      const { token, user } = await loginService({ email, password });
      login(token, user);
      toast.success(`Bienvenido, ${user.email}`);
      navigate('/', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al iniciar sesión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="auth-root">
        <aside className="auth-panel">
          <div className="auth-panel__inner">
            <div className="auth-panel__logo">
              <span className="auth-panel__dot" />
              <span className="auth-panel__dot" />
              <span className="auth-panel__dot" />
            </div>
            <p className="auth-panel__tagline">
              GAIA
            </p>
            <div className="auth-panel__bar" />
          </div>
        </aside>

        <section className="auth-form-side">
          <div className="auth-card">

            <header className="auth-card__header">
              <h1 className="auth-card__title">Iniciar sesión</h1>
              <p className="auth-card__sub">Accede a tu cuenta para continuar</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="email">Correo electrónico</label>
                <input
                  id="email"
                  className="auth-field__input"
                  type="email"
                  placeholder="nombre@empresa.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="password">Contraseña</label>
                <div className="auth-field__wrap">
                  <input
                    id="password"
                    className="auth-field__input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-field__eye"
                    onClick={() => setShowPass(p => !p)}
                    aria-label="Mostrar contraseña"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? <Loader2 size={18} className="auth-spinner" /> : 'Entrar'}
              </button>

            </form>
          </div>
        </section>
      </main>
    </>
  );
};
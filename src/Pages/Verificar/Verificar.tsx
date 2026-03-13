import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import './Verificar.css';
import { connection_to_backend } from '../../Connection/connection';

type Status = 'loading' | 'success' | 'error';

export const Verificar = () => {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token no encontrado en la URL.');
      return;
    }

    connection_to_backend
      .get(`/auth/verificar?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message ?? 'Cuenta verificada correctamente.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(
          err?.response?.data?.message ?? 'Token inválido o ya utilizado.'
        );
      });
  }, []);

  return (
    <div className="verificar">
      <div className="verificar__bg-grid" aria-hidden="true" />
      <div className="verificar__glow" aria-hidden="true" />

      <div className="verificar__card">

        {status === 'loading' && (
          <>
            <div className="verificar__icon verificar__icon--loading">
              <Loader2 size={32} className="verificar__spinner" />
            </div>
            <h1 className="verificar__title">Verificando tu cuenta…</h1>
            <p className="verificar__desc">Por favor espera un momento.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verificar__icon verificar__icon--success">
              <CheckCircle2 size={32} />
            </div>
            <p className="verificar__eyebrow">¡Todo listo!</p>
            <h1 className="verificar__title">Cuenta verificada</h1>
            <p className="verificar__desc">{message}</p>
            <button
              className="verificar__btn verificar__btn--primary"
              onClick={() => navigate('/login', { replace: true })}
            >
              Iniciar sesión
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verificar__icon verificar__icon--error">
              <XCircle size={32} />
            </div>
            <p className="verificar__eyebrow">Algo salió mal</p>
            <h1 className="verificar__title">Verificación fallida</h1>
            <p className="verificar__desc">{message}</p>
            <button
              className="verificar__btn verificar__btn--ghost"
              onClick={() => navigate('/login', { replace: true })}
            >
              Volver al inicio
            </button>
          </>
        )}

      </div>
    </div>
  );
};
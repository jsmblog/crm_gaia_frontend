import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import '../Styles/PageNotFound.css';

export const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <main className="pnf">

      <div className="pnf__grid" aria-hidden="true" />
      <div className="pnf__glow pnf__glow--1" aria-hidden="true" />
      <div className="pnf__glow pnf__glow--2" aria-hidden="true" />

      <article className="pnf__inner">

        <figure className="pnf__num" aria-hidden="true">
          <span>4</span>
          <div className="pnf__circle">
            <Compass size={52} strokeWidth={1.2} />
          </div>
          <span>4</span>
        </figure>

        <header className="pnf__copy">
          <p className="pnf__eyebrow">Error 404</p>
          <h1 className="pnf__title">Página no encontrada</h1>
          <p className="pnf__desc">
            La ruta que buscas no existe o fue movida.<br />
            Vuelve al inicio y retoma el camino.
          </p>
        </header>

        <nav className="pnf__actions" aria-label="Opciones de navegación">
          <button className="pnf__btn pnf__btn--primary" onClick={() => navigate('/login')}>
            <ArrowLeft size={16} />
            Ir al inicio
          </button>
          <button className="pnf__btn pnf__btn--ghost" onClick={() => navigate(-1)}>
            Volver atrás
          </button>
        </nav>

      </article>
    </main>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import './PageLanding.css';

const PageLanding = () => (
  <div className="landing-container">
    <header>
      <h1 className="brand-assist"><span className="brand-x">Xray</span>Assist</h1>
      <div>
        <Link to="/login" className="button-link"><button>Iniciar Sesión</button></Link>
        <Link to="/register" className="button-link"><button>Registrarse</button></Link>
      </div>
    </header>
    <main>
      <section className="hero-text">
        <h2>Diagnóstico rápido<br /> con inteligencia artificial</h2>
        <p>Sube una radiografía.<br />Obtén resultados preliminares en segundos.</p>
      </section>
      <section className="hero-image">
        {/* Aquí puedes incrustar un componente de canvas o img para el heatmap */}
        <img src="/heatmap-simulada.png" alt="Zonas sospechosas" />
      </section>
    </main>
  </div>
);

export default PageLanding;
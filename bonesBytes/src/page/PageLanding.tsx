import React from 'react';
import { Link } from 'react-router-dom';
import '../css/PageLanding.css';
import radiografiaInicio from '../images/RadiografiaInicio.png';

const PageLanding = () => (
  <div className="landing-container">
    <header>
      <h1 className="brand-assist">XrayAssist</h1>
      <div>
        <Link to="/login" className="button-link"><button>Iniciar Sesión</button></Link>
        <Link to="/register" className="button-link"><button>Registrarse</button></Link>
      </div>
    </header>
    <main>
      <section className="hero-text">
        <h4 className="hero-title">Diagnóstico rápido<br />con inteligencia artificial</h4>
        <p className="hero-subtitle">Sube una radiografía.<br />Obtén resultados preliminares en segundos.</p>
        <div className="landing-warning">
          <span className="landing-warning-icon">⚠️</span>
          <span className="landing-warning-text">
            Esto no es una verificación auténtica. Consulte con su doctor, ya que este resultado no es 100% confiable.
          </span>
        </div>
      </section>
      <section className="hero-image">
        <img src={radiografiaInicio} alt="Radiografía inicial" />
      </section>
    </main>
  </div>
);

export default PageLanding;
import React, { type FC, useState, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, set } from 'firebase/database';
import { db } from '../firebase/firebase';  // Asegúrate de que en firebase.ts exportes `db`
import './PageRegister.css';

interface DatosUsuario {
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono?: string;
  password: string;
}

const PageRegister: FC = () => {
  const [datos, setDatos] = useState<DatosUsuario>({
    nombres: '',
    apellidos: '',
    cedula: '',
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    if (!datos.cedula || !datos.password) return;
    try {
      await set(ref(db, `usuarios/${datos.cedula}`), datos);
      navigate('/login');
    } catch (err) {
      console.error('Error al guardar datos', err);
      alert('Error al guardar datos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-text">
        <h2>Registrarse</h2>
        <p>Para acceder a XrayAssist</p>
      </div>
      <form className="login-form" onSubmit={e => { e.preventDefault(); handleRegister(); }}>
        <input name="nombres" placeholder="Nombres" onChange={handleChange} />
        <input name="apellidos" placeholder="Apellidos" onChange={handleChange} />
        <input name="cedula" placeholder="Cédula" onChange={handleChange} />
        <input name="email" placeholder="Correo electrónico" onChange={handleChange} />
        <input name="telefono" placeholder="Número de teléfono (opcional)" onChange={handleChange} />
        <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} />
        <div className="button-group">
          <Link to="/" className="button-link">
            <button type="button">Volver</button>
          </Link>
          <button type="submit">Continuar</button>
        </div>
      </form>
    </div>
  );
};

export default PageRegister;
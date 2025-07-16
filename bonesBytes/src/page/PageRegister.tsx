import React, { type FC, useState, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, set, get } from 'firebase/database';
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleRegister = async () => {
    if (!datos.cedula || !datos.password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verificar si el usuario ya existe
      const snapshot = await get(ref(db, `usuarios/${datos.cedula}`));
      
      if (snapshot.exists()) {
        setError('Usuario ya registrado. Por favor, inicia sesión o usa una cédula diferente.');
        setLoading(false);
        return;
      }

      // Si no existe, proceder con el registro
      await set(ref(db, `usuarios/${datos.cedula}`), datos);
      localStorage.setItem('userCedula', datos.cedula);
      navigate('/home');
    } catch (err) {
      console.error('Error al guardar datos', err);
      setError('Error al guardar datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
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
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="button-group">
          <Link to="/" className="button-link">
            <button type="button">Volver</button>
          </Link>
          <button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PageRegister;
import React, { type FC, useState, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase/firebase';  // Asegúrate de que en firebase.ts exportes `db`
import '../css/PageRegister.css';

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
    
    // Validación especial para cédula
    if (name === 'cedula') {    // Solo permitir números y máximo 10 dígitos
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setDatos(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setDatos(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const validateCedula = (cedula: string): boolean => {
    return cedula.length === 10 && /^\d{10}$/.test(cedula);
  };

  const handleRegister = async () => {
    if (!datos.cedula || !datos.password) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!validateCedula(datos.cedula)) {
      setError('Cédula inválida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verificar si el usuario ya existe
      const snapshot = await get(ref(db, `usuarios/${datos.cedula}`));
      
      if (snapshot.exists()) {
        setError('Usuario ya registrado. Por favor, inicia sesión o usa una cédula diferente.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRegister();
  };

  return (
    <div className="login-container">
      <div className="login-text">
        <h2>Registrarse</h2>
        <p>Para acceder a XrayAssist</p>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
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
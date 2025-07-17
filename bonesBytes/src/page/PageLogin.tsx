import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, child, get } from 'firebase/database';
import { db } from '../firebase/firebase';
import '../css/PageLogin.css';

const PageLogin = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (field: 'cedula' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (field === 'cedula') {
      setCedula(value);
    } else {
      setPassword(value);
    }
    if (error) setError('');
  };

  const handleLogin = async () => {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, `usuarios/${cedula}`));
      if (snapshot.exists()) {
        const user = snapshot.val();
        if (user.password === password) {
          localStorage.setItem('userCedula', cedula);
          navigate('/home');
        } else {
          setError('Contraseña incorrecta');
        }
      } else {
        setError('Usuario no registrado');
      }
    } catch (err) {
      setError('Error al conectar con la base de datos');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-text">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido, por favor ingresa tus datos<br /> para acceder.</p>
      </div>
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <input 
          type="text" 
          placeholder="Usuario"
          value={cedula} 
          onChange={handleInputChange('cedula')} 
        />
        <input 
          type="password" 
          placeholder="Contraseña"
          value={password} 
          onChange={handleInputChange('password')} 
        />
        <div className="button-group">
          <button type="button" onClick={() => navigate(-1)}>Volver</button>
          <button type="submit">Entrar</button>
        </div>
      </form>
    </div>
  );
};

export default PageLogin;
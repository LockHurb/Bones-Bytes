import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, child, get } from 'firebase/database';
import { db } from '../firebase/firebase';
import './PageLogin.css';

const PageLogin = () => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const dbRef = ref(db);
    try {
      const snapshot = await get(child(dbRef, `usuarios/${cedula}`));
      if (snapshot.exists()) {
        const user = snapshot.val();
        if (user.password === password) {
          navigate('/upload');
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

  return (
    <div className="login-container">
      <div className="login-text">
        <h2>Iniciar Sesión</h2>
        <p>Bienvenido, por favor ingresa tus datos<br /> para acceder.</p>
      </div>
      <form className="login-form" onSubmit = {(e) => {
        e.preventDefault();
        handleLogin();
      }}>
        <input type="text" placeholder="Usuario" value={cedula} onChange={e => setCedula(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
        <div className="button-group">
           <button type="button" onClick={() => navigate(-1)}>Volver</button>
           <button type="submit">Entrar</button>
           
        </div>
      </form>
    </div>
  );
};

export default PageLogin;
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
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <p>Para acceder a XrayAssist</p>
      <input placeholder="Cédula" value={cedula} onChange={e => setCedula(e.target.value)} />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="buttons">
        <Link to="/" className="button-link"><button>Volver</button></Link>
        <button onClick={handleLogin}>Continuar</button>
      </div>
    </div>
  );
};

export default PageLogin;
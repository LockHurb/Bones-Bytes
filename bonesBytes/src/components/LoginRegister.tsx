// src/components/LoginRegister.tsx
import React, { useState } from 'react';
import { ref, set, get, child } from 'firebase/database';
import { db } from '../firebase/firebase';

const LoginRegister: React.FC = () => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const registrar = async () => {
    setMode('register');
    if (!cedula || !nombre) {
      setMensaje('Por favor llena ambos campos.');
      return;
    }
    try {
      await set(ref(db, `usuarios/${cedula}`), { nombre });
      setMensaje('Registro exitoso');
    } catch (error: any) {
      setMensaje('Error al registrar: ' + error.message);
    }
  };

  const iniciarSesion = async () => {
    setMode('login');
    if (!cedula) {
      setMensaje('Por favor ingresa tu cédula.');
      return;
    }
    try {
      const snapshot = await get(child(ref(db), `usuarios/${cedula}`));
      if (snapshot.exists()) {
        const datos = snapshot.val();
        setMensaje(`Inicio exitoso. Bienvenido ${datos.nombre}`);
      } else {
        setMensaje('Cédula no registrada.');
      }
    } catch (error: any) {
      setMensaje('Error al iniciar sesión: ' + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{mode === 'register' ? 'Regístrate' : 'Iniciar Sesión'}</h2>
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        style={styles.input}
      />
      {mode === 'register' && (
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
        />
      )}
      <div>
        <button onClick={registrar} style={styles.actionButton}>Registrarse</button>
        <button onClick={iniciarSesion} style={styles.actionButton}>Iniciar Sesión</button>
      </div>
      {mensaje && <p style={styles.message}>{mensaje}</p>}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: 50,
    right: 50,
    padding: 30,
    width: 320,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: 20,
    color: '#0D47A1',
    fontSize: '1.5rem',
  },
  input: {
    width: '100%',
    padding: 10,
    margin: '10px 0',
    borderRadius: 4,
    border: '1px solid #64B5F6',
  },
  actionButton: {
    margin: '5px',
    padding: '10px 20px',
    border: 'none',
    borderRadius: 4,
    backgroundColor: '#1976D2',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  message: {
    marginTop: 15,
    color: '#0D47A1',
  },
};

export default LoginRegister;

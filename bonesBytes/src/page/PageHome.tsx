import React, { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { db } from '../firebase/firebase';
import '../css/PageHome.css';

interface Usuario {
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono?: string;
  fotoPerfil?: string;
}

const PageHome: FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener datos del usuario desde localStorage o parámetros de URL
    const cedula = localStorage.getItem('userCedula') || new URLSearchParams(window.location.search).get('cedula');
    if (cedula) {
      const obtenerUsuario = async () => {
        try {
          const snapshot = await get(ref(db, `usuarios/${cedula}`));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUsuario(userData);
            
            // Obtener foto de perfil
            const savedPhoto = localStorage.getItem('userFotoPerfil');
            if (userData.fotoPerfil) {
              setUserPhoto(userData.fotoPerfil);
              localStorage.setItem('userFotoPerfil', userData.fotoPerfil);
            } else if (savedPhoto) {
              setUserPhoto(savedPhoto);
            }
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      };
      obtenerUsuario();
    }
  }, []);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleInformacion = () => {
    navigate('/perfil');
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('userCedula');
    navigate('/');
  };

  const handleSubirImagenes = () => {
    navigate('/upload');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
          <h1>XrayAssist</h1>
        </div>
        <div className="user-section">
          <span className="user-name">
            {usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario'}
          </span>
          <div className="user-avatar" onClick={handleMenuToggle}>
            <img 
              src={userPhoto || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM5NzlmZjAiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDExQzE0LjIwOTEgMTEgMTYgOS4yMDkxIDE2IDdDMTYgNC43OTA5IDE0LjIwOTEgMyAxMiAzQzkuNzkwOSAzIDggNC43OTA5IDggN0M4IDkuMjA5MSA5Ljc5MDkgMTEgMTIgMTFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTNDOC4xMyAxMyA1IDE2LjEzIDUgMjBIMTlDMTkgMTYuMTMgMTUuODcgMTMgMTIgMTNaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+"} 
              alt="Avatar del usuario"
            />
          </div>
          {showMenu && (
            <div className="user-menu">
              <div className="menu-item" onClick={handleInformacion}>
                <span>📋 Información</span>
              </div>
              <div className="menu-item" onClick={handleCerrarSesion}>
                <span>🚪 Cerrar Sesión</span>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="home-main">
        <div className="welcome-section">
          <h2>¡Bienvenido a XrayAssist!</h2>
          <p>Tu plataforma de asistencia para análisis de rayos X</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card clickable" onClick={handleSubirImagenes}>
            <h3>📤 Subir Imágenes</h3>
            <p>Sube tus imágenes de rayos X para análisis</p>
          </div>
          {/* Historial eliminado */}
        </div>
      </main>
    </div>
  );
};

export default PageHome; 
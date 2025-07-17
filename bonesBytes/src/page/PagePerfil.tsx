import React, { type FC, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set } from 'firebase/database';
import { db } from '../firebase/firebase';
import '../css/PagePerfil.css';

interface Usuario {
  nombres: string;
  apellidos: string;
  cedula: string;
  email: string;
  telefono?: string;
  fotoPerfil?: string;
}

const PagePerfil: FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [editData, setEditData] = useState<Usuario | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const cedula = localStorage.getItem('userCedula') || new URLSearchParams(window.location.search).get('cedula');
        if (cedula) {
          const snapshot = await get(ref(db, `usuarios/${cedula}`));
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUsuario(userData);
            if (userData.fotoPerfil) {
              setSelectedImage(userData.fotoPerfil);
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerDatosUsuario();
  }, []);

  const handleVolver = () => {
    navigate('/home');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSelectedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage || !usuario) return;

    setUploading(true);
    try {
      const cedula = localStorage.getItem('userCedula');
      if (cedula) {
        // Actualizar la foto en la base de datos
        await set(ref(db, `usuarios/${cedula}/fotoPerfil`), selectedImage);
        
        // Actualizar el estado local
        setUsuario(prev => prev ? { ...prev, fotoPerfil: selectedImage } : null);
        
        // Guardar en localStorage para acceso rápido
        localStorage.setItem('userFotoPerfil', selectedImage);
        
        alert('Foto de perfil actualizada exitosamente');
      }
    } catch (error) {
      console.error('Error al actualizar foto:', error);
      alert('Error al actualizar la foto de perfil');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  // Nueva función para manejar el click en editar
  const handleEditClick = () => {
    setShowPasswordPrompt(true);
    setError('');
  };

  // Validar contraseña antes de permitir edición
  const handlePasswordConfirm = async () => {
    if (!usuario) return;
    setError('');
    try {
      const snapshot = await get(ref(db, `usuarios/${usuario.cedula}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password === passwordInput) {
          setEditMode(true);
          setEditData({ ...usuario });
          setShowPasswordPrompt(false);
          setPasswordInput('');
        } else {
          setError('Contraseña incorrecta');
        }
      }
    } catch (err) {
      setError('Error al validar la contraseña');
    }
  };

  // Guardar cambios en la base de datos
  const handleSave = async () => {
    if (!editData) return;
    setError('');
    try {
      await set(ref(db, `usuarios/${editData.cedula}`), { ...editData, fotoPerfil: usuario?.fotoPerfil });
      setUsuario(editData);
      setEditMode(false);
      alert('Perfil actualizado correctamente');
    } catch (err) {
      setError('Error al actualizar el perfil');
    }
  };

  // Manejar cambios en los campos editables
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
    setError('');
    setPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!usuario) return;
    setError('');
    if (!passwordInput || !newPassword || !confirmPassword) {
      setError('Completa todos los campos');
      return;
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }
    try {
      const snapshot = await get(ref(db, `usuarios/${usuario.cedula}`));
      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.password !== passwordInput) {
          setError('La contraseña actual es incorrecta');
          return;
        }
        await set(ref(db, `usuarios/${usuario.cedula}/password`), newPassword);
        setShowChangePassword(false);
        alert('Contraseña actualizada correctamente');
      }
    } catch (err) {
      setError('Error al cambiar la contraseña');
    }
  };

  if (loading) {
    return (
      <div className="perfil-container">
        <div className="loading">Cargando información...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="perfil-container">
        <div className="error">No se encontró información del usuario</div>
        <button onClick={handleVolver} className="volver-btn">Volver</button>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <header className="perfil-header">
        <button onClick={handleVolver} className="back-button">
          ← Volver
        </button>
        <h1>Información del Usuario</h1>
      </header>

      <main className="perfil-main">
        <div className="perfil-card">
          <div className="avatar-section">
            <div className="avatar-container">
              <div className="avatar">
                <img 
                  src={selectedImage || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiM5NzlmZjAiLz4KPHN2ZyB4PSIyNCIgeT0iMjQiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDExQzE0LjIwOTEgMTEgMTYgOS4yMDkxIDE2IDdDMTYgNC43OTA5IDE0LjIwOTEgMyAxMiAzQzkuNzkwOSAzIDggNC43OTA5IDggN0M4IDkuMjA5MSA5Ljc5MDkgMTEgMTIgMTFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMTNDOC4xMyAxMyA1IDE2LjEzIDUgMjBIMTlDMTkgMTYuMTMgMTUuODcgMTMgMTIgMTNaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+"} 
                  alt="Avatar del usuario"
                />
              </div>
              <button 
                className="change-photo-btn"
                onClick={handleChangePhoto}
                disabled={uploading}
              >
                📷 Cambiar Foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </div>
            {selectedImage && selectedImage !== usuario.fotoPerfil && (
              <button 
                onClick={handleUploadPhoto}
                className="save-photo-btn"
                disabled={uploading}
              >
                {uploading ? 'Guardando...' : '💾 Guardar Foto'}
              </button>
            )}
            <h2>{usuario.nombres} {usuario.apellidos}</h2>
          </div>

          <div className="info-section">
            <div className="info-group">
              <h3>Información Personal</h3>
              <div className="info-item">
                <label>Nombres:</label>
                {editMode ? (
                  <input name="nombres" value={editData?.nombres || ''} onChange={handleEditChange} />
                ) : (
                  <span>{usuario.nombres}</span>
                )}
              </div>
              <div className="info-item">
                <label>Apellidos:</label>
                {editMode ? (
                  <input name="apellidos" value={editData?.apellidos || ''} onChange={handleEditChange} />
                ) : (
                  <span>{usuario.apellidos}</span>
                )}
              </div>
              <div className="info-item">
                <label>Cédula:</label>
                <span>{usuario.cedula}</span>
              </div>
              <div className="info-item">
                <label>Número de Teléfono:</label>
                {editMode ? (
                  <input name="telefono" value={editData?.telefono || ''} onChange={handleEditChange} />
                ) : (
                  <span>{usuario.telefono || 'No especificado'}</span>
                )}
              </div>
              <div className="info-item">
                <label>Correo Electrónico:</label>
                {editMode ? (
                  <input name="email" value={editData?.email || ''} onChange={handleEditChange} />
                ) : (
                  <span>{usuario.email}</span>
                )}
              </div>
            </div>
          </div>

          <div className="actions-section">
            {editMode ? (
              <>
                <button className="edit-btn" onClick={handleSave}>Guardar Cambios</button>
                <button className="change-password-btn" onClick={() => setEditMode(false)}>Cancelar</button>
              </>
            ) : (
              <button className="edit-btn" onClick={handleEditClick}>Editar Información</button>
            )}
            <button className="change-password-btn" onClick={handleChangePasswordClick}>Cambiar Contraseña</button>
          </div>
        </div>
      </main>

      {showPasswordPrompt && (
        <div className="password-prompt">
          <div className="prompt-content">
            <h4>Confirma tu contraseña para editar</h4>
            <input 
              type="password" 
              value={passwordInput} 
              onChange={e => setPasswordInput(e.target.value)} 
              placeholder="Contraseña actual"
            />
            <div className="prompt-buttons">
              <button onClick={handlePasswordConfirm}>Confirmar</button>
              <button onClick={() => setShowPasswordPrompt(false)}>Cancelar</button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}
      {showChangePassword && (
        <div className="password-prompt">
          <div className="prompt-content">
            <h4>Cambiar contraseña</h4>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              placeholder="Contraseña actual"
            />
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nueva contraseña"
            />
            <div className="prompt-buttons">
              <button onClick={handleChangePassword}>Cambiar</button>
              <button onClick={() => setShowChangePassword(false)}>Cancelar</button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PagePerfil; 
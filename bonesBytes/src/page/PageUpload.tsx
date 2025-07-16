import React, { type FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageUpload.css';

const PageUpload: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handleContinue = () => {
    if (selectedFile) {
      // Aquí iría la lógica para procesar la imagen
      console.log('Archivo seleccionado:', selectedFile.name);
      // Por ahora solo mostramos un alert
      alert('Imagen subida exitosamente: ' + selectedFile.name);
    } else {
      alert('Por favor selecciona una imagen primero');
    }
  };

  return (
    <div className="upload-container">
      <header className="upload-header">
        <button onClick={handleCancel} className="back-button">
          ← Volver
        </button>
        <h1>Subir Imagen</h1>
      </header>

      <main className="upload-main">
        <div className="upload-section">
          <h2>Sube tu radiografía</h2>
          <p>Selecciona o arrastra una imagen de rayos X para análisis</p>
          
          <div 
            className={`dropzone ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <div className="dropzone-content">
              <div className="upload-icon">
                📷
              </div>
              {selectedFile ? (
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="upload-text">
                  <p>Arrastra tu imagen aquí o</p>
                  <p className="click-text">haz clic para seleccionar</p>
                </div>
              )}
            </div>
          </div>

          <div className="upload-actions">
            <button onClick={handleCancel} className="cancel-btn">
              Cancelar
            </button>
            <button 
              onClick={handleContinue} 
              className="continue-btn"
              disabled={!selectedFile}
            >
              Continuar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageUpload;
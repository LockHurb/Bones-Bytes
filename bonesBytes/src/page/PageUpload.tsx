import React, { type FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, set, get } from "firebase/database";
import { db } from "../firebase/firebase";
import '../css/PageUpload.css';

const PageUpload: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, message: string, isError?: boolean} | null>(null);

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

  const convertToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleContinue = async () => {
    if (!selectedFile) {
      setModalContent({ title: 'Imagen no seleccionada', message: 'Por favor selecciona una imagen primero.', isError: true });
      setModalOpen(true);
      return;
    }
  
    try {
      // 1) Convierte a base64 y guarda en Realtime DB
      const base64 = await convertToBase64(selectedFile);
      const imageId = Date.now().toString();
      const imageRef = ref(db, `radiografias/${imageId}`);
  
      await set(imageRef, {
        base64,
        estado: "pendiente",
      });
      setModalContent({ title: 'Imagen subida', message: 'Imagen subida a Firebase. Esperando confirmación...' });
      setModalOpen(true);
  
      // 2) Polling para esperar que Firebase lo guarde
      let exists = false;
      for (let i = 0; i < 10; i++) {
        const snapshot = await get(imageRef);
        if (snapshot.exists()) {
          exists = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!exists) {
        setModalContent({ title: 'Error', message: '⚠️ La imagen no se guardó correctamente en Firebase.', isError: true });
        setModalOpen(true);
        return;
      }
  
      // 3) Llama al backend
      const res = await fetch("http://localhost:5000/predict-firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_id: imageId }),
      });
      const data = await res.json();
  
      // 4) Debug: mira qué responde la IA
      console.log("🔍 IA response:", data);
  
      // 5) Si el status no es OK, muestra el error
      if (!res.ok) {
        setModalContent({ title: 'Error', message: `⚠️ Error al obtener el diagnóstico:\n${data.error || res.statusText}`, isError: true });
        setModalOpen(true);
        return;
      }
      // 6) Si el backend envía error en el JSON
      if (data.error) {
        setModalContent({ title: 'Error del servidor', message: `⚠️ Error del servidor:\n${data.error}`, isError: true });
        setModalOpen(true);
        return;
      }
  
      // 7) Todo OK, extrae y muestra resultado
      const { prediction, confidence } = data;
      setModalContent({
        title: 'Resultado del Análisis',
        message: ` Diagnóstico: ${prediction}\n Confianza: ${(confidence * 100).toFixed(2)}%`,
      });
      setModalOpen(true);
  
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setModalContent({ title: 'Error', message: '❌ Error al procesar la imagen', isError: true });
      setModalOpen(true);
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
          <p>Selecciona o arrastra una imagen para análisis</p>
          
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
      {modalOpen && modalContent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={modalContent.isError ? { color: '#ffb4b4' } : {}}>{modalContent.title}</h2>
            <p 
              className={modalContent.title === 'Resultado del Análisis' ? 'diagnosis-result' : undefined}
              style={modalContent.isError ? { color: '#ffd6d6' } : {}}
            >
              {modalContent.message.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
            </p>
            {/* Mensaje de advertencia */}
            {!modalContent.isError && (
              <div className="modal-warning">
                <span className="modal-warning-icon">⚠️</span>
                <span className="modal-warning-text">
                  Esto no es una verificación auténtica. Consulte con su doctor, ya que este resultado no es 100% confiable.
                </span>
              </div>
            )}
            <button className="modal-close-btn" onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageUpload;
import React, { type FC, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import './PageUpload.css';
import { ref, set, get } from "firebase/database";
import { db } from "../firebase/firebase";
=======
import '../css/PageUpload.css';
>>>>>>> f4702828dc72ab2efc0c047cf818aa4e66ff6448

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
      alert("Por favor selecciona una imagen primero");
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
      alert("Imagen subida a Firebase. Esperando confirmación...");
  
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
        alert("⚠️ La imagen no se guardó correctamente en Firebase.");
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
        alert("⚠️ Error al obtener el diagnóstico:\n" + (data.error || res.statusText));
        return;
      }
      // 6) Si el backend envía error en el JSON
      if (data.error) {
        alert("⚠️ Error del servidor:\n" + data.error);
        return;
      }
  
      // 7) Todo OK, extrae y muestra resultado
      const { prediction, confidence } = data;
      alert(
        `✅ Diagnóstico: ${prediction}\n🔬 Confianza: ${(confidence * 100).toFixed(2)}%`
      );
  
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      alert("❌ Error al procesar la imagen");
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
    </div>
  );
};

export default PageUpload;
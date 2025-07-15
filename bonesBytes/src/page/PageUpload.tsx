import React from 'react';
import { Link } from 'react-router-dom';
import './PageUpload.css';

const PageUpload = () => (
  <div className="upload-container">
    <h2>Subir imágenes</h2>
    <div className="dropzone">
      {/* Aquí podrías usar un componente de Dropzone para subir archivos */}
      <p><i className="icon-camera" /> Arrastra o selecciona tu radiografía</p>
    </div>
    <div className="buttons">
      <Link to="/" className="button-link"><button>Cancelar</button></Link>
      <button>Continuar</button>
    </div>
  </div>
);

export default PageUpload;
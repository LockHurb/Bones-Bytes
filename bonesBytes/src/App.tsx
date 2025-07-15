import React, { useEffect } from 'react';
import LoginRegister from './components/LoginRegister';
import { testFirebaseConnection } from './firebase/firebase';

function App() {
  useEffect(() => {
    // Al montar, inicializa y comprueba la conexión a Firebase
    testFirebaseConnection();
  }, []);

  return (
    <div>
      <LoginRegister />
    </div>
  );
}

export default App;


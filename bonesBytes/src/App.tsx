import React, { type FC } from 'react';
import { Routes, Route } from 'react-router-dom';

import PageLanding from './page/PageLanding.tsx';
import PageLogin from './page/PageLogin.tsx';
import PageRegister from './page/PageRegister.tsx';
import PageUpload from './page/PageUpload.tsx';
import PageHome from './page/PageHome.tsx';
import PagePerfil from './page/PagePerfil.tsx';

const App: FC = () => (
  <Routes>
    <Route path="/" element={<PageLanding />} />
    <Route path="/login" element={<PageLogin />} />
    <Route path="/register" element={<PageRegister />} />
    <Route path="/upload" element={<PageUpload />} />
    <Route path="/home" element={<PageHome />} />
    <Route path="/perfil" element={<PagePerfil />} />
  </Routes>
);

export default App;
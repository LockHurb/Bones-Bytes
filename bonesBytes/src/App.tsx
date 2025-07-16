import React, { type FC } from 'react';
import { Routes, Route } from 'react-router-dom';

import PageLanding from './page/PageLanding.tsx';
import PageLogin from './page/PageLogin.tsx';
import PageRegister from './page/PageRegister.tsx';
import PageUpload from './page/PageUpload.tsx';

const App: FC = () => (
  <Routes>
    <Route path="/" element={<PageLanding />} />
    <Route path="/login" element={<PageLogin />} />
    <Route path="/register" element={<PageRegister />} />
    <Route path="/upload" element={<PageUpload />} />
  </Routes>
);

export default App;
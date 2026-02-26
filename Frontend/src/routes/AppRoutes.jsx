import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Pocetna from '../pages/Pocetna';
import Login from '../pages/Login';
import Usluge from '../pages/Usluge';
import MojeRezervacije from '../pages/MojeRezervacije';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Pocetna />} />
      <Route path="/login" element={<Login />} />
      <Route path="/usluge" element={<Usluge />} />
      <Route path="/moje-rezervacije" element={<MojeRezervacije />} />
    </Routes>
  );
};

export default AppRoutes;
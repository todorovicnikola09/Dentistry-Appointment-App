import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Pocetna from '../pages/Pocetna';
import Login from '../pages/Login';
import MojeRezervacije from '../pages/MojeRezervacije';
// import AdminPanel from '../pages/AdminPanel';
import Mentori from '../pages/Mentori';
import Footer from '../components/Footer';
import Usluge from '../pages/Usluge';
import Pacijenti from '../pages/Pacijenti'; 
import Stomatolozi from '../pages/Stomatolozi';
import AdminUsluge from '../pages/AdminUsluge'; 

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Pocetna />} />
        <Route path="/login" element={<Login />} />
        <Route path="/moje-rezervacije" element={<MojeRezervacije />} />
        {/* <Route path="/admin-panel" element={<AdminPanel />} /> */}
        <Route path="/admin/mentori" element={<Mentori />} />
        <Route path="/usluge" element={<Usluge />} />
        <Route path="/admin/pacijenti" element={<Pacijenti />} />
        <Route path="/admin/stomatolozi" element={<Stomatolozi />} />
        <Route path="/admin/usluge" element={<AdminUsluge />} />
      </Routes>
      <Footer />
    </>
  );
};

export default AppRoutes;
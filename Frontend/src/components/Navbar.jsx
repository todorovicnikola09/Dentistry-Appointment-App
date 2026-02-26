import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // DODAT useLocation

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // DODATO: da znamo na kojoj smo stranici
  
  const token = localStorage.getItem('token');
  const imeKorisnika = localStorage.getItem('userName');
  const isUlogovan = !!token;

  const paleta = { zelena: '#4A5D50', bela: '#FFFFFF', tekst: '#1A1A1A', svetloSiva: '#f8f9fa' };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const linkStyle = { textDecoration: 'none', color: paleta.zelena, fontWeight: '600', fontSize: '1.1rem', margin: '0 25px', transition: '0.3s' };

  const buttonStyle = { backgroundColor: paleta.zelena, color: 'white', padding: '12px 25px', border: 'none', borderRadius: '30px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '8px' };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 8%', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* LOGO */}
      <div onClick={() => navigate('/')} style={{ fontSize: '2rem', fontWeight: '900', color: paleta.zelena, letterSpacing: '2px', cursor: 'pointer' }}>
        DENTIFY
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={linkStyle}>Početna</Link>

        {/* LOGIKA ZA SMENU LINKOVA */}
        {location.pathname === '/moje-rezervacije' ? (
          <Link to="/usluge" style={linkStyle}>Usluge</Link>
        ) : (
          <Link to="/moje-rezervacije" style={linkStyle}>Moji termini</Link>
        )}

        <Link to="/o-nama" style={linkStyle}>O nama</Link>
        
        {isUlogovan ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '20px' }}>
            <span style={{ color: paleta.tekst, fontWeight: '500', fontSize: '1rem', borderRight: `1px solid #ddd`, paddingRight: '20px' }}>
              Zdravo, <b style={{color: paleta.zelena}}>{imeKorisnika}</b>
            </span>
            <button onClick={handleLogout} style={buttonStyle}>Odjavi se</button>
          </div>
        ) : (
          <button onClick={() => navigate('/login')} style={buttonStyle}>
             <span style={{ fontSize: '1.1rem' }}>👤</span> Prijavi se
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const token = localStorage.getItem('token');
  
  // Funkcija za bezbedno uzimanje iz storage-a (da izbegnemo "undefined" tekst)
  const getSafeStorage = (key) => {
    const value = localStorage.getItem(key);
    if (value === "undefined" || value === null) return "";
    return value;
  };

  const ime = getSafeStorage('userName');
  const prezime = getSafeStorage('userSurname'); 
  const role = getSafeStorage('role');
  const isUlogovan = !!token;

  const paleta = { 
    zelena: '#4A5D50', 
    bela: '#FFFFFF', 
    tekst: '#1A1A1A', 
    sivaLinija: '#ddd'
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const linkStyle = { 
    textDecoration: 'none', 
    color: paleta.zelena, 
    fontWeight: '600', 
    fontSize: '1.1rem', 
    margin: '0 20px', 
    transition: '0.3s' 
  };

  const buttonStyle = { 
    backgroundColor: paleta.zelena, 
    color: 'white', 
    padding: '10px 22px', 
    border: 'none', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    fontWeight: 'bold', 
    marginLeft: '15px', 
    display: 'flex', 
    alignItems: 'center', 
    transition: '0.3s'
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 8%', 
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000 
    }}>
      {/* LEVO: LOGO */}
      <div onClick={() => navigate('/')} style={{ fontSize: '1.8rem', fontWeight: '900', color: paleta.zelena, letterSpacing: '2px', cursor: 'pointer' }}>
        DENTIFY
      </div>

      {/* DESNO: DINAMIČKI SADRŽAJ */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        
        {isUlogovan ? (
          <>
            <span style={{ 
                color: paleta.tekst, 
                fontWeight: '500', 
                fontSize: '1.05rem', 
                paddingRight: '20px',
                borderRight: `1px solid ${paleta.sivaLinija}`
            }}>
                Zdravo, <b style={{color: paleta.zelena}}>{ime} {prezime}</b>
            </span>

            {/* Ako je stomatolog, sakrij marketing linkove */}
            {role !== 'Stomatolog' && (
              <>
                <Link to="/usluge" style={linkStyle}>Usluge</Link>
                <Link to="/stomatolozi" style={linkStyle}>Stomatolozi</Link>
              </>
            )}

            {/* MOJI TERMINI */}
            {location.pathname !== '/moje-rezervacije' && (
               <Link to="/moje-rezervacije" style={linkStyle}>Moji termini</Link>
            )}

            <button onClick={handleLogout} style={buttonStyle}>Odjavi se</button>
          </>
        ) : (
          <>
            <Link to="/" style={linkStyle}>Početna</Link>
            <button onClick={() => navigate('/login')} style={buttonStyle}>
               <span style={{ marginRight: '8px' }}>👤</span> Prijavi se
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
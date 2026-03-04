import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const ime = localStorage.getItem('userName');
  const prezime = localStorage.getItem('userSurname');

  const isUlogovan = token && token !== "undefined" && token !== "null";
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (!isUlogovan) {
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      localStorage.removeItem('userSurname');
      localStorage.removeItem('token');
    }
  }, [isUlogovan]);

  const paleta = { 
    zelena: '#4A5D50', 
    bela: '#FFFFFF', 
    tekst: '#1A1A1A', 
    sivaLinija: '#ddd',
    adminZlatna: '#D4AF37'
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleKontaktClick = () => {
    const element = document.getElementById('kontakt-sekcija');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const linkStyle = { 
    textDecoration: 'none', 
    color: isHome ? paleta.bela : paleta.zelena, 
    fontWeight: '600', 
    fontSize: '1.1rem', 
    margin: '0 20px', 
    transition: '0.3s',
    cursor: 'pointer'
  };

  const adminLinkStyle = {
    ...linkStyle,
    color: isHome ? paleta.bela : paleta.tekst 
  };

  const buttonStyle = { 
    backgroundColor: isHome ? 'rgba(255,255,255,0.2)' : paleta.zelena, 
    color: paleta.bela, 
    padding: '10px 22px', 
    border: isHome ? `1px solid ${paleta.bela}` : 'none', 
    borderRadius: '30px', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    fontWeight: 'bold', 
    marginLeft: '15px', 
    display: 'flex', 
    alignItems: 'center',
    backdropFilter: isHome ? 'blur(5px)' : 'none'
  };

  if (location.pathname === '/login') return null;

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: isHome ? '30px 8%' : '15px 8%', 
      backgroundColor: isHome ? 'transparent' : paleta.bela, 
      boxShadow: isHome ? 'none' : '0 2px 10px rgba(0,0,0,0.1)',
      position: isHome ? 'fixed' : 'sticky',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div onClick={() => navigate('/')} style={{ 
        fontSize: '1.8rem', 
        fontWeight: '900', 
        color: isHome ? paleta.bela : paleta.zelena, 
        letterSpacing: '3px', 
        cursor: 'pointer' 
      }}>
        DENTIFY
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isUlogovan ? (
          <>
            <span style={{ 
                color: isHome ? paleta.bela : paleta.tekst, 
                fontWeight: '500', 
                fontSize: '1.05rem', 
                paddingRight: '20px',
                borderRight: `1px solid ${isHome ? 'rgba(255,255,255,0.3)' : paleta.sivaLinija}`
            }}>
                Zdravo, <b style={{color: (role === 'Admin' || role === 'admin') ? paleta.adminZlatna : (isHome ? paleta.bela : paleta.zelena)}}>
                  {(role === 'Admin' || role === 'admin') ? 'Admin ' : ''}{ime} {prezime !== "undefined" ? prezime : ""}
                </b>
            </span>

            <Link to="/" style={(role === 'Admin' || role === 'admin') ? adminLinkStyle : linkStyle}>Početna</Link>

            {(role === 'Admin' || role === 'admin') ? (
              <>
                <Link to="/admin/pacijenti" style={adminLinkStyle}>Pacijenti</Link>
                <Link to="/admin/stomatolozi" style={adminLinkStyle}>Stomatolozi</Link>
                <Link to="/admin/usluge" style={adminLinkStyle}>Usluge</Link>
                <Link to="/admin/mentori" style={{...adminLinkStyle, color: paleta.adminZlatna}}>Mentori</Link>
              </>
            ) : (
              <>
                {(role !== 'Stomatolog' && role !== 'stomatolog') && (
                  <Link to="/usluge" style={linkStyle}>Usluge</Link>
                )}
                <Link to="/moje-rezervacije" style={linkStyle}>Moji termini</Link>
              </>
            )}
            <button onClick={handleLogout} style={buttonStyle}>Odjavi se</button>
          </>
        ) : (
          <>
            <Link to="/" style={linkStyle}>Početna</Link>
            <Link to="/usluge" style={linkStyle}>Usluge</Link>
            <span onClick={handleKontaktClick} style={linkStyle}>Kontakt</span>
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
import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Stanje za modal
  const [statusModal, setStatusModal] = useState({
    show: false,
    naslov: '',
    poruka: '',
    tip: 'info' // 'success' ili 'error'
  });

  const paleta = {
    white: '#F4F2F3',
    purple: '#C0A9BD',
    blueGray: '#94A7AE',
    olive: '#64766A',
    text: '#1a2a3a',
    crvena: '#C0392B',
    zelena: '#4A5D50'
  };

  const prikaziPoruku = (naslov, poruka, tip) => {
    setStatusModal({ show: true, naslov, poruka, tip });
  };

  const zatvoriModal = () => {
    setStatusModal({ ...statusModal, show: false });
    // Ako je bio uspeh, navigiraj na početnu tek nakon zatvaranja modala
    if (statusModal.tip === 'success') {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (email === 'admin@gmail.com' && password === 'admin123') {
      const adminUser = {
        Id: 0,
        Uloga: "Admin",
        Ime: "Glavni",
        Prezime: "Administrator"
      };

      localStorage.setItem('token', 'fake-admin-token-123');
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('role', 'Admin');
      localStorage.setItem('userId', '0');

      prikaziPoruku("Uspešna prijava", "Dobrodošli nazad, gospodine administratore.", "success");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5169/api/login', {
        Email: email,
        Password: password
      });

      const user = {
        Id: response.data.Id,
        Uloga: response.data.Role,
        Ime: response.data.Ime,
        Prezime: response.data.Prezime
      };

      localStorage.setItem('token', response.data.Token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', response.data.Role);
      localStorage.setItem('userId', response.data.Id);
      localStorage.setItem('userName', response.data.Ime);
      localStorage.setItem('userSurname', response.data.Prezime);

      prikaziPoruku("Uspešna prijava", `Dobro došli, ${user.Ime}!`, "success");

    } catch (err) {
      console.error(err);
      // Umesto alert-a, zovemo našu funkciju
      prikaziPoruku(
        "Greška pri prijavi", 
        err.response?.data || "Pogrešan email ili lozinka. Molimo pokušajte ponovo.", 
        "error"
      );
    }
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: paleta.white,
      fontFamily: "'Playfair Display', serif"
    }}>
      
      {/* --- MODAL ZA STATUSE (GRESKA / USPEH) --- */}
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '380px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: statusModal.tip === 'error' ? paleta.crvena : paleta.olive, marginBottom: '15px' }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666', marginBottom: '25px', fontFamily: "'Montserrat', sans-serif" }}>{statusModal.poruka}</p>
                <button 
                  onClick={zatvoriModal} 
                  style={{ 
                    background: statusModal.tip === 'error' ? paleta.crvena : paleta.olive, 
                    color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
                  }}
                >
                  U REDU
                </button>
            </div>
        </div>
      )}

      <a href="/" style={{ 
        position: 'absolute', top: '40px', left: '40px', 
        display: 'flex', alignItems: 'center', gap: '8px', 
        color: paleta.olive, textDecoration: 'none', 
        fontWeight: '600', fontSize: '1.3rem' 
      }}>
        <ArrowLeft size={24} /> Početna
      </a>

      <div style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '50px', 
        backgroundColor: '#fff', 
        borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ fontSize: '2.5rem', color: paleta.text, marginBottom: '10px' }}>Dobro došli</h2>
        <p style={{ color: paleta.blueGray, marginBottom: '40px', fontFamily: "'Montserrat', sans-serif" }}>
          Unesite podatke za pristup vašem profilu
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <Mail size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: paleta.blueGray }} />
            <input 
              type="email" 
              placeholder="Email adresa"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 15px 18px 50px',
                borderRadius: '10px',
                border: `1px solid ${paleta.blueGray}44`,
                outline: 'none',
                fontSize: '1.2rem',
                fontFamily: "'Montserrat', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ position: 'relative', width: '100%' }}>
            <Lock size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: paleta.blueGray }} />
            <input 
              type="password" 
              placeholder="Lozinka"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 15px 18px 50px',
                borderRadius: '10px',
                border: `1px solid ${paleta.blueGray}44`,
                outline: 'none',
                fontSize: '1.2rem',
                fontFamily: "'Montserrat', sans-serif",
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button type="submit" style={{
            marginTop: '10px',
            padding: '18px',
            backgroundColor: paleta.olive,
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Prijavi se
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
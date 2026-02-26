import React, { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import axios from 'axios'; // DODATO
import { useNavigate } from 'react-router-dom'; // DODATO

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // DODATO

  const paleta = {
    white: '#F4F2F3',
    purple: '#C0A9BD',
    blueGray: '#94A7AE',
    olive: '#64766A',
    text: '#1a2a3a'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Pozivamo tvoj C# API (proveri port, verovatno je 5169)
      const response = await axios.post('http://localhost:5169/api/login', {
        Email: email,
        Password: password
      });

      console.log("Uspešan login:", response.data);

      // Čuvamo podatke o korisniku u localStorage
      localStorage.setItem('token', response.data.Token);
      localStorage.setItem('role', response.data.Role);
      localStorage.setItem('userId', response.data.Id);
      localStorage.setItem('userName', response.data.Ime);

      // LOGIKA PREUSMERAVANJA
      if (response.data.Role === 'Pacijent') {
        navigate('/moje-rezervacije'); // Pacijenta vodimo na njegove rezervacije
      } else {
        navigate('/'); // Admina ili Stomatologa vodimo na pocetnu za sada
      }

    } catch (err) {
      console.error(err);
      alert("Greška pri prijavi: " + (err.response?.data || "Proverite podatke"));
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
      {/* Dugme za povratak na početnu */}
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
          
          {/* Email polje */}
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

          {/* Lozinka polje */}
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
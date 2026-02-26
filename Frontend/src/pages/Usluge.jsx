import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Usluge = () => {
  const [usluge, setUsluge] = useState([]);
  const [loading, setLoading] = useState(true);

  // LOGIKA: Proveravamo da li postoji token. Ako nema tokena, isUlogovan je false.
  const isUlogovan = !!localStorage.getItem('token');

  const paleta = {
    pozadina: '#F4F2F3',
    roze: '#D4A5BC',    
    zelena: '#4A5D50',   
    tekst: '#1A1A1A',
    bela: '#FFFFFF'
  };

  useEffect(() => {
    const fetchUsluge = async () => {
      try {
        const response = await axios.get('http://localhost:5169/api/usluga');
        if (Array.isArray(response.data)) {
          setUsluge(response.data);
        }
      } catch (error) {
        console.error("Greška pri učitavanju:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsluge();
  }, []);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh' }}>
      {/* NAVBAR - Izbačen onaj dark-green div da bi Navbar bio lepši i čistiji */}
      <Navbar />
      
      <div style={{ padding: '80px 10%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', color: paleta.zelena, marginBottom: '50px', fontWeight: 'bold' }}>
          Naše Usluge
        </h1>

        {loading ? (
          <h2 style={{ color: paleta.zelena }}>Učitavanje usluga...</h2>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px' 
          }}>
            {usluge.length > 0 ? usluge.map((u) => (
              <div key={u.Id || u.id} style={{
                backgroundColor: paleta.bela,
                padding: '30px',
                borderRadius: '20px',
                border: `3px solid ${paleta.roze}`,
                textAlign: 'left',
                boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ color: paleta.zelena, fontSize: '1.8rem' }}>{u.Naziv || u.naziv}</h3>
                <p style={{ margin: '15px 0', color: '#555' }}>{u.Opis || u.opis}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{u.Cena || u.cena} RSD</span>
                  
                  {/* DUGME ZAKAŽI - Prikazuje se samo ako je isUlogovan === true */}
                  {isUlogovan && (
                    <button style={{ 
                      backgroundColor: paleta.zelena, 
                      color: 'white', 
                      padding: '10px 20px', 
                      border: 'none', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}>Zakaži</button>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1/-1' }}>
                <h3 style={{ color: 'orange' }}>Lista je trenutno prazna.</h3>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Usluge;
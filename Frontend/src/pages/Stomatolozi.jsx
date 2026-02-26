import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Stomatolozi = () => {
  const [stomatolozi, setStomatolozi] = useState([]);
  const [loading, setLoading] = useState(true);

  const paleta = {
    pozadina: '#F4F2F3',
    roze: '#D4A5BC',    
    zelena: '#4A5D50',   
    tekst: '#1A1A1A',
    bela: '#FFFFFF',
    svetloSiva: '#f8f9fa'
  };

  useEffect(() => {
    const fetchStomatolozi = async () => {
      try {
        const response = await axios.get('http://localhost:5169/api/korisnik/stomatolozi');
        if (Array.isArray(response.data)) {
          setStomatolozi(response.data);
        }
      } catch (error) {
        console.error("Greška pri učitavanju stomatologa:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStomatolozi();
  }, []);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      
      <div style={{ padding: '60px 8%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.8rem', color: paleta.zelena, marginBottom: '10px', fontWeight: 'bold' }}>
          Naš Tim Eksperata
        </h1>
        <p style={{ color: paleta.roze, fontSize: '1.1rem', marginBottom: '50px', fontWeight: '500' }}>
          Upoznajte stomatologe koji brinu o vašem osmehu
        </p>

        {loading ? (
          <h2 style={{ color: paleta.zelena }}>Učitavanje...</h2>
        ) : (
          /* GRID koji omogućava da idu jedan pored drugog */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '25px',
            justifyContent: 'center'
          }}>
            {stomatolozi.length > 0 ? stomatolozi.map((s) => (
              <div key={s.id || s.Id} style={{
                backgroundColor: paleta.bela,
                padding: '20px 25px', // Smanjen padding da kartica bude niža
                borderRadius: '15px',
                borderLeft: `8px solid ${paleta.roze}`, 
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: '150px' // Ograničena visina
              }}>
                
                <h3 style={{ 
                  color: paleta.zelena, 
                  fontSize: '1.8rem', // Blago smanjeno da stane pored drugog
                  marginBottom: '2px',
                  fontWeight: '800' 
                }}>
                   dr {s.ime} {s.prezime}
                </h3>
                
                <p style={{ 
                  color: '#555', 
                  marginBottom: '15px', 
                  fontSize: '0.95rem',
                  fontStyle: 'italic'
                }}>
                  {s.email}
                </p>

                <div>
                  <div style={{ 
                    backgroundColor: paleta.svetloSiva, 
                    padding: '5px 15px', 
                    borderRadius: '20px',
                    display: 'inline-block',
                    border: `1px solid ${paleta.roze}33`
                  }}>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      color: paleta.zelena, 
                      fontWeight: '700', 
                      textTransform: 'uppercase'
                    }}>
                      Licenca: <span style={{color: paleta.roze}}>{s.brojLicence}</span>
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <h3 style={{ color: paleta.roze, gridColumn: '1/-1' }}>Trenutno nema dostupnih stomatologa.</h3>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Stomatolozi;
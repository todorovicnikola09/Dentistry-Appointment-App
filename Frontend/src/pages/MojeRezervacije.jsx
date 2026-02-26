import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MojeRezervacije = () => {
  const [termini, setTermini] = useState([]);
  const [loading, setLoading] = useState(true);

  // Čistimo ID
  const rawId = localStorage.getItem('userId');
  const pacijentId = rawId ? rawId.toString().split(':')[0] : null;
  const token = localStorage.getItem('token'); // Uzimamo token

  const paleta = {
    pozadina: '#F4F2F3',
    zelena: '#4A5D50',
    bela: '#FFFFFF',
    roze: '#D4A5BC',
    siva: '#94A7AE'
  };

  useEffect(() => {
    const fetchTermini = async () => {
      if (!pacijentId) {
        setLoading(false);
        return;
      }

      try {
        // ŠALJEMO TOKEN U HEADERU - Često je ovo razlog za 400 Bad Request
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const res = await axios.get(
          `http://localhost:5169/api/termin/pacijent/${pacijentId}`, 
          config
        );
        
        console.log("Stigli podaci:", res.data);
        setTermini(res.data);
      } catch (err) {
        console.error("Greška:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTermini();
  }, [pacijentId, token]);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '60px 10%', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelena, textAlign: 'center' }}>Moji Termini</h1>

        {loading ? (
          <h3 style={{ textAlign: 'center' }}>Učitavanje...</h3>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {termini && termini.length > 0 ? (
              termini.map((t, index) => (
                <div key={index} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', borderLeft: `10px solid ${paleta.zelena}` }}>
                  <h3 style={{ color: paleta.zelena }}>{t.usluga || t.Usluga || "Termin"}</h3>
                  <p>{t.opis || t.Opis}</p>
                  <p>Datum: <b>{t.datum || t.Datum}</b> u <b>{t.vreme || t.Vreme}h</b></p>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white' }}>
                <p>Trenutno nemate zakazanih termina (Provereni ID: {pacijentId})</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MojeRezervacije;
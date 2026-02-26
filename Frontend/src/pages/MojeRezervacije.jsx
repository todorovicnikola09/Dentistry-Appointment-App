import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MojeRezervacije = () => {
  const [termini, setTermini] = useState([]);
  const [loading, setLoading] = useState(true);

  const rawId = localStorage.getItem('userId');
  const userId = rawId ? rawId.toString().split(':')[0] : null;
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role')?.toLowerCase();

  const paleta = {
    pozadina: '#F4F2F3',
    zelena: '#4A5D50',
    bela: '#FFFFFF',
    roze: '#D4A5BC',
    siva: '#94A7AE',
    // Boje za statuse
    prosao: '#2D5A27', // Tamno zelena
    uToku: '#F4D03F',  // Žuta
    buduci: '#C0392B'  // Crvena
  };

  // FUNKCIJA ZA ODREĐIVANJE STATUSA
  const getStatus = (datumStr, vremeStr) => {
    try {
      // Pretpostavljamo format datuma dd.MM.yyyy i vremena HH:mm
      const [dan, mesec, godina] = datumStr.split('.');
      const [sati, minuti] = vremeStr.split(':');
      
      const datumTermina = new Date(godina, mesec - 1, dan, sati, minuti);
      const sada = new Date();

      // Razlika u milisekundama
      const razlika = sada - datumTermina;
      const satVremenaUMilisec = 60 * 60 * 1000;

      if (razlika > satVremenaUMilisec) {
        return { tekst: 'PROŠAO', boja: paleta.prosao };
      } else if (razlika >= 0 && razlika <= satVremenaUMilisec) {
        return { tekst: 'U TOKU', boja: paleta.uToku };
      } else {
        return { tekst: 'ZAKAZAN', boja: paleta.buduci };
      }
    } catch (e) {
      return { tekst: 'NEPOZNATO', boja: paleta.siva };
    }
  };

  useEffect(() => {
    const fetchTermini = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const endpoint = role === 'stomatolog' 
          ? `http://localhost:5169/api/termin/stomatolog/${userId}`
          : `http://localhost:5169/api/termin/pacijent/${userId}`;

        const res = await axios.get(endpoint, config);
        setTermini(res.data);
      } catch (err) {
        console.error("Greška:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTermini();
  }, [userId, token, role]);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '60px 10%', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelena, textAlign: 'center', marginBottom: '40px' }}>
          {role === 'stomatolog' ? 'Svi moji zakazani termini' : 'Moji Termini'}
        </h1>

        {loading ? (
          <h3 style={{ textAlign: 'center' }}>Učitavanje...</h3>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {termini && termini.length > 0 ? (
              termini.map((t, index) => {
                const status = getStatus(t.datum || t.Datum, t.vreme || t.Vreme);
                
                return (
                  <div key={index} style={{ 
                    backgroundColor: 'white', 
                    padding: '25px', 
                    borderRadius: '15px', 
                    position: 'relative', // VAŽNO zbog badge-a u uglu
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    borderLeft: `10px solid ${role === 'stomatolog' ? paleta.roze : paleta.zelena}`
                  }}>
                    {/* STATUS BADGE U DESNOM UGLU */}
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      backgroundColor: status.boja,
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '1px'
                    }}>
                      {status.tekst}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div>
                        <h3 style={{ color: paleta.zelena, marginBottom: '10px' }}>{t.usluga || t.Usluga}</h3>
                        {role === 'stomatolog' && (
                          <p style={{ margin: '5px 0' }}>Pacijent: <b style={{ color: '#333' }}>{t.pacijent || t.Pacijent}</b></p>
                        )}
                        <p style={{ color: '#666', fontSize: '0.95rem' }}>{t.opis || t.Opis}</p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <b style={{ fontSize: '1.2rem', color: paleta.zelena }}>{t.vreme || t.Vreme}h</b>
                        <p style={{ color: paleta.siva, margin: 0 }}>{t.datum || t.Datum}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '15px' }}>
                <p>Nema zakazanih termina za prikaz.</p>
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
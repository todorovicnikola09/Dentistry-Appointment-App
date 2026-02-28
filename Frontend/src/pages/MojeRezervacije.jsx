import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
    zelenaGlavna: '#4A5D50',
    statusZavrseno: '#27AE60',
    bela: '#FFFFFF',
    roze: '#D4A5BC',
    siva: '#94A7AE',
    zlato: '#F4D03F',
    crvena: '#C0392B'
  };

  const getStatusStil = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('cekanj') || s.includes('čekanj')) {
      return { tekst: 'NA ČEKANJU', boja: paleta.crvena };
    }
    if (s.includes('toku')) {
      return { tekst: 'U TOKU', boja: paleta.zlato };
    }
    if (s.includes('zavrsen') || s.includes('završen')) {
      return { tekst: 'ZAVRŠENO', boja: paleta.statusZavrseno };
    }
    if (s.includes('odbijen')) {
      return { tekst: 'ODBIJENO', boja: paleta.crvena };
    }
    return { tekst: status?.toUpperCase() || 'NEPOZNATO', boja: paleta.siva };
  };

  const fetchTermini = async () => {
    if (!userId || userId === "undefined" || userId === "null") {
      setLoading(false);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = role === 'stomatolog' 
        ? `http://localhost:5169/api/termin/stomatolog/${userId}`
        : `http://localhost:5169/api/termin/pacijent/${userId}`;

      const res = await axios.get(endpoint, config);
      setTermini(res.data || []);
    } catch (err) {
      console.error("Greška API-ja:", err);
    } finally {
      setLoading(false);
    }
  };

  const azurirajStatusUBazi = async (terminId, noviStatus) => {
    try {
      const config = { 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        } 
      };
      await axios.put(`http://localhost:5169/api/termin/promeni-status/${terminId}`, 
        `"${noviStatus}"`, 
        config
      );
      alert(`Status termina uspešno promenjen u: ${noviStatus}`);
      fetchTermini(); 
    } catch (err) {
      console.error("Greška pri ažuriranju:", err);
      alert("Došlo je do greške u komunikaciji sa bazom.");
    }
  };

  useEffect(() => {
    fetchTermini();
  }, [userId, token, role]);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh' }}>
      <div style={{ padding: '60px 10%', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelenaGlavna, textAlign: 'center', marginBottom: '40px' }}>
          {role === 'stomatolog' ? 'Upravljanje Terminima' : 'Moji Termini'}
        </h1>

        {loading ? (
          <h3 style={{ textAlign: 'center' }}>Učitavanje podataka iz baze...</h3>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {termini.length > 0 ? (
              termini.map((t, index) => {
                const statusIzBaze = t.status || t.Status;
                const statusInfo = getStatusStil(statusIzBaze);

                return (
                  <div key={index} style={{ 
                    backgroundColor: 'white', 
                    padding: '25px', 
                    borderRadius: '15px', 
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    borderLeft: `10px solid ${role === 'stomatolog' ? paleta.roze : paleta.zelenaGlavna}`
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      backgroundColor: statusInfo.boja,
                      color: statusInfo.boja === paleta.zlato ? '#000' : 'white',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {statusInfo.tekst}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div>
                        <h3 style={{ color: paleta.zelenaGlavna, marginBottom: '5px' }}>{t.usluga || t.Usluga}</h3>
                        <p style={{ margin: '5px 0' }}>
                          {role === 'stomatolog' ? <b>Pacijent: {t.pacijent || t.Pacijent}</b> : <b>Stomatolog: {t.stomatolog || t.Stomatolog}</b>}
                        </p>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>{t.opis || t.Opis}</p>
                        
                        {role === 'stomatolog' && (
                          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            {(statusInfo.tekst === 'NA ČEKANJU') && (
                              <>
                                <button 
                                  onClick={() => azurirajStatusUBazi(t.id || t.Id, 'U toku')}
                                  style={{ backgroundColor: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                                > Započni </button>
                                <button 
                                  onClick={() => azurirajStatusUBazi(t.id || t.Id, 'Odbijeno')}
                                  style={{ backgroundColor: paleta.crvena, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                                > Odbij </button>
                              </>
                            )}
                            {statusInfo.tekst === 'U TOKU' && (
                              <button 
                                onClick={() => azurirajStatusUBazi(t.id || t.Id, 'Završeno')}
                                style={{ backgroundColor: '#3498DB', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                              > Završi </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <b style={{ fontSize: '1.3rem', color: paleta.zelenaGlavna }}>{t.vreme || t.Vreme}h</b>
                        <p style={{ color: paleta.siva, fontWeight: 'bold', margin: 0 }}>{t.datum || t.Datum}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'white', borderRadius: '15px' }}>
                <p>Nema rezervisanih termina u bazi.</p>
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
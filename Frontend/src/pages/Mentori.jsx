import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Mentori = () => {
  const [stomatolozi, setStomatolozi] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const [statusModal, setStatusModal] = useState({ 
    show: false, 
    naslov: '', 
    poruka: '', 
    tip: 'info', 
    akcija: null 
  });

  const paleta = {
    zelenaGlavna: '#4A5D50',
    pozadina: '#F4F2F3',
    bela: '#FFFFFF',
    adminZlatna: '#D4AF37',
    siva: '#94A7AE',
    roze: '#D4A5BC'
  };

  const prikaziPoruku = (naslov, poruka, tip = 'info', akcija = null) => {
    setStatusModal({ show: true, naslov, poruka, tip, akcija });
  };

  const fetchStomatolozi = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5169/api/korisnik/stomatolozi', config);
      setStomatolozi(res.data);
    } catch (err) {
      console.error("Greška pri učitavanju stomatologa:", err);
    } finally {
      setLoading(false);
    }
  };

  const azurirajMentora = async (stomatologId, noviMentorId) => {
    try {
      const config = { 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        } 
      };
      
      const payload = noviMentorId ? parseInt(noviMentorId) : null;
      
      await axios.put(`http://localhost:5169/api/korisnik/stomatolozi/${stomatologId}/dodeli-mentora`, payload, config);
      
      prikaziPoruku("Uspeh", "Mentor je uspešno ažuriran u bazi.", "info");
      fetchStomatolozi(); 
    } catch (err) {
      prikaziPoruku("Greška", "Došlo je do greške pri ažuriranju mentora na serveru.", "error");
    }
  };

  useEffect(() => {
    fetchStomatolozi();
  }, []);

  const nadjiImeMentora = (mentorId) => {
    if (!mentorId) return null;
    const mentor = stomatolozi.find(s => s.id === mentorId);
    return mentor ? `${mentor.ime} ${mentor.prezime}` : "Učitavanje...";
  };

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', padding: '120px 5% 60px' }}>
      
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '25px', width: '400px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                <h3 style={{ color: paleta.zelenaGlavna, fontSize: '1.8rem', marginBottom: '15px' }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.4' }}>{statusModal.poruka}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '12px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>U REDU</button>
                </div>
            </div>
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: paleta.bela, padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        
        <h1 style={{ color: paleta.zelenaGlavna, textAlign: 'center', marginBottom: '10px', fontSize: '2.5rem', fontWeight: 'bold' }}>Upravljanje Mentorima</h1>
        <p style={{ textAlign: 'center', color: paleta.siva, marginBottom: '40px' }}>
          Povežite stomatologe
        </p>

        {loading ? <h3 style={{ textAlign: 'center', color: paleta.zelenaGlavna }}>Učitavanje tima...</h3> : (
          <div style={{ borderRadius: '15px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ backgroundColor: paleta.zelenaGlavna, color: 'white' }}>
                    <th style={{ textAlign: 'left', padding: '20px' }}>Stomatolog</th>
                    <th style={{ textAlign: 'left', padding: '20px' }}>Trenutni Mentor</th>
                    <th style={{ textAlign: 'left', padding: '20px' }}>Akcija: Dodeli Mentora</th>
                </tr>
                </thead>
                <tbody>
                {stomatolozi.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '18px' }}>
                        <b style={{ color: '#1A1A1A' }}>{s.ime} {s.prezime}</b> <br/>
                        <small style={{ color: paleta.siva }}>Licenca: {s.brojLicence}</small>
                    </td>
                    <td style={{ padding: '18px' }}>
                        {s.mentorId ? (
                        <span style={{ color: paleta.adminZlatna, fontWeight: '600' }}>
                            ⭐ {nadjiImeMentora(s.mentorId)}
                        </span>
                        ) : (
                        <span style={{ color: '#ccc' }}>Nema mentora</span>
                        )}
                    </td>
                    <td style={{ padding: '18px' }}>
                        <select 
                        value={s.mentorId || ""} 
                        onChange={(e) => azurirajMentora(s.id, e.target.value)}
                        style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${paleta.siva}`, outline: 'none', width: '220px', cursor: 'pointer', backgroundColor: '#fff' }}
                        >
                        <option value="">Izaberi mentora...</option>
                        {stomatolozi
                            .filter(m => {
                                const nijeIstaOsoba = m.id !== s.id;
                                
                                const nijeKruznaZavisnost = m.mentorId !== s.id;

                                return nijeIstaOsoba && nijeKruznaZavisnost;
                            })
                            .map(m => (
                            <option key={m.id} value={m.id}>{m.ime} {m.prezime}</option>
                            ))
                        }
                        </select>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentori;
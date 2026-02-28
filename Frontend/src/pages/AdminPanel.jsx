import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [klijenti, setKlijenti] = useState([]);
  const [loading, setLoading] = useState(true);

  const paleta = { 
    zelena: '#4A5D50', 
    pozadina: '#F4F2F3', 
    bela: '#FFFFFF'
  };

  const fetchPodatke = async () => {
    try {
      setLoading(true);
      
      const stomatoloziRes = await axios.get('http://localhost:5169/api/korisnik/stomatolozi');
      const pacijentiRes = await axios.get('http://localhost:5169/api/Pacijent');

      const stomatoloziRaw = stomatoloziRes.data || [];
      const pacijentiRaw = pacijentiRes.data || [];

      const stomatolozi = stomatoloziRaw.map(s => ({
        id: s.id,
        ime: s.ime,
        prezime: s.prezime,
        email: s.email,
        uloga: 'Stomatolog',
        identifikator: s.brojLicence || 'N/A'
      }));

      const pacijenti = pacijentiRaw.map(p => ({
        id: p.id,
        ime: p.ime,
        prezime: p.prezime,
        email: p.email,
        uloga: 'Pacijent',
        identifikator: p.jmbg || 'N/A'
      }));

      setKlijenti([...stomatolozi, ...pacijenti]);
    } catch (err) {
      console.error("Greška pri dohvatanju:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodatke();
  }, []);

  const obrisiKlijenta = async (id, uloga) => {
    if(window.confirm(`Da li ste sigurni da želite da obrišete korisnika?`)) {
      try {
        await axios.delete(`http://localhost:5169/api/korisnik/${id}`);
        alert("Korisnik uspešno obrisan!");
        fetchPodatke(); 
      } catch (err) {
        alert("Greška pri brisanju! Proverite da li korisnik ima povezane termine.");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: paleta.pozadina }}>
        <h3 style={{ color: paleta.zelena }}>Učitavanje podataka...</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', paddingTop: '120px', backgroundColor: paleta.pozadina, minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelena, marginBottom: '30px', fontSize: '2rem' }}>
          Admin Panel - Upravljanje Korisnicima
        </h1>

        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: paleta.zelena, color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '20px' }}>Ime i Prezime</th>
                <th style={{ padding: '20px' }}>Email</th>
                <th style={{ padding: '20px' }}>Uloga</th>
                <th style={{ padding: '20px' }}>JMBG / Licenca</th>
                <th style={{ padding: '20px' }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {klijenti.length > 0 ? (
                klijenti.map((k) => (
                  <tr key={`${k.uloga}-${k.id}`} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '18px' }}>{k.ime} {k.prezime}</td>
                    <td style={{ padding: '18px' }}>{k.email}</td>
                    <td style={{ padding: '18px' }}>
                      <span style={{ 
                        backgroundColor: k.uloga === 'Stomatolog' ? '#E3F2FD' : '#F1F8E9',
                        color: k.uloga === 'Stomatolog' ? '#1976D2' : '#388E3C',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
                      }}>
                        {k.uloga}
                      </span>
                    </td>
                    <td style={{ padding: '18px', color: '#666' }}>{k.identifikator}</td>
                    <td style={{ padding: '18px' }}>
                      <button 
                        onClick={() => alert('Izmena za ID: ' + k.id)} 
                        style={{ marginRight: '15px', color: paleta.zelena, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Izmeni
                      </button>
                      <button 
                        onClick={() => obrisiKlijenta(k.id, k.uloga)} 
                        style={{ color: '#D32F2F', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                    Nema pronađenih korisnika u bazi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
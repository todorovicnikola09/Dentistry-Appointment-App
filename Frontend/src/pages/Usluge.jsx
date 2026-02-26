import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Usluge = () => {
  const [usluge, setUsluge] = useState([]);
  const [stomatolozi, setStomatolozi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUsluga, setSelectedUsluga] = useState(null);
  const [slobodnaVremena, setSlobodnaVremena] = useState([]);
  const [formData, setFormData] = useState({ datum: '', stomatologId: '', vreme: '' });

  // DOBIJAMO DANAŠNJI DATUM U FORMATU YYYY-MM-DD
  const danasnjiDatum = new Date().toISOString().split('T')[0];

  const userRaw = localStorage.getItem('user');
  const ulogovaniKorisnik = userRaw ? JSON.parse(userRaw) : { id: 1, ime: 'Marko', prezime: 'Marković' };
  
  const imePacijenta = ulogovaniKorisnik.ime || ulogovaniKorisnik.Ime || "Marko";
  const prezimePacijenta = ulogovaniKorisnik.prezime || ulogovaniKorisnik.Prezime || "Marković";

  const trajanja = {
    "Hollywood Smile": "120 min",
    "Nevidljive proteze": "45 min",
    "Lasersko beljenje": "60 min",
    "Zubni implanti": "90 min",
    "Cirkonijum krunice": "60 min",
    "Digitalni dizajn osmeha": "30 min",
    "Uklanjanje kamenca": "20 min",
    "Estetske plombe": "40 min"
  };

  useEffect(() => {
    const ucitajPodatke = async () => {
      try {
        const resU = await axios.get('http://localhost:5169/api/Usluga');
        const resS = await axios.get('http://localhost:5169/api/Korisnik/stomatolozi');
        setUsluge(resU.data);
        setStomatolozi(resS.data);
      } catch (err) {
        console.error("Greška pri učitavanju:", err);
      } finally {
        setLoading(false);
      }
    };
    ucitajPodatke();
  }, []);

  const handleVidiVremena = async () => {
    try {
      const url = `http://localhost:5169/api/Termin/slob_vremena?stomatologId=${formData.stomatologId}&datum=${formData.datum}`;
      const res = await axios.get(url);
      setSlobodnaVremena(res.data);
      if (res.data.length === 0) alert("Nema slobodnih termina za ovaj datum.");
    } catch (e) {
      alert("Greška pri učitavanju slobodnih termina.");
    }
  };

  const potvrdiRezervaciju = async () => {
    try {
      let cistoVreme = formData.vreme.replace(' h', '').trim();
      if (cistoVreme.length === 5) cistoVreme += ":00";

      const model = {
        Datum: formData.datum,
        Vreme: cistoVreme,
        PacijentId: parseInt(ulogovaniKorisnik.id || ulogovaniKorisnik.Id),
        StomatologId: parseInt(formData.stomatologId),
        UslugaIds: [parseInt(selectedUsluga.id || selectedUsluga.Id)]
      };

      console.log("Šaljem uprošćen model:", model);
      
      const response = await axios.post('http://localhost:5169/api/Termin', model);
      
      alert("Uspešno zakazano!");
      setShowModal(false);
      setFormData({ datum: '', stomatologId: '', vreme: '' });
    } catch (e) {
      console.error("Greška detalji:", e.response?.data);
      const errorMsg = typeof e.response?.data === 'object' 
                       ? JSON.stringify(e.response.data) 
                       : e.response?.data;
      alert("Baza odbila: " + (errorMsg || "Proverite konzolu"));
    }
  };

  if (loading) return <Navbar />;

  return (
    <div style={{ backgroundColor: '#F4F2F3', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ padding: '60px 10%', textAlign: 'center' }}>
        <h1 style={{ color: '#4A5D50', fontSize: '3rem', marginBottom: '10px' }}>Naše Usluge</h1>
        <p style={{ color: '#D4A5BC', fontSize: '1.2rem', marginBottom: '50px' }}>Izaberite najbolje za vaš osmeh</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {usluge.map((u) => (
            <div key={u.id || u.Id} style={{ backgroundColor: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: '#4A5D50', fontSize: '1.6rem', marginBottom: '15px' }}>{u.naziv || u.Naziv}</h3>
                <p style={{ color: '#777', fontSize: '1rem', lineHeight: '1.5' }}>{u.opis || u.Opis}</p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: '#D4A5BC', fontWeight: 'bold', fontSize: '1.4rem' }}>{u.cena || u.Cena} RSD</p>
                <button 
                  onClick={() => { setSelectedUsluga(u); setShowModal(true); setSlobodnaVremena([]); }}
                  style={{ background: '#4A5D50', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Zakaži
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#4A5D50', marginBottom: '10px' }}>Rezervacija termina</h2>
            <p style={{ color: '#D4A5BC', marginBottom: '30px', fontWeight: 'bold' }}>
              {selectedUsluga?.naziv || selectedUsluga?.Naziv} ({trajanja[selectedUsluga?.naziv || selectedUsluga?.Naziv] || "45 min"})
            </p>
            
            <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Pacijent:</label>
            <input type="text" disabled value={`${imePacijenta} ${prezimePacijenta}`} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #eee', backgroundColor: '#f9f9f9' }} />

            <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Izaberite stomatologa:</label>
            <select 
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd' }} 
              onChange={e => setFormData({...formData, stomatologId: e.target.value})}
              value={formData.stomatologId}
            >
              <option value="">-- Kliknite da izaberete --</option>
              {stomatolozi.map(s => <option key={s.id || s.Id} value={s.id || s.Id}>dr {s.ime || s.Ime} {s.prezime || s.Prezime}</option>)}
            </select>

            <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Datum pregleda:</label>
            <input 
              type="date" 
              min={danasnjiDatum} // ONEMOGUĆAVA PROŠLOST
              style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '10px', border: '1px solid #ddd' }} 
              onChange={e => setFormData({...formData, datum: e.target.value})} 
              value={formData.datum}
            />

            <button 
              disabled={!formData.datum || !formData.stomatologId}
              onClick={handleVidiVremena} 
              style={{ width: '100%', padding: '15px', background: (!formData.datum || !formData.stomatologId) ? '#ccc' : '#D4A5BC', color: 'white', border: 'none', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              VIDI SLOBODNA VREMENA
            </button>

            {slobodnaVremena.length > 0 && (
              <div style={{ animation: 'fadeIn 0.5s' }}>
                <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Dostupni termini:</label>
                <select 
                  style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '2px solid #4A5D50' }} 
                  onChange={e => setFormData({...formData, vreme: e.target.value})}
                >
                  <option value="">-- Izaberi vreme --</option>
                  {slobodnaVremena.map(v => <option key={v} value={v}>{v.substring(0, 5)} h</option>)}
                </select>
                
                <button onClick={potvrdiRezervaciju} disabled={!formData.vreme} style={{ width: '100%', padding: '15px', background: '#4A5D50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  POTVRDI REZERVACIJU
                </button>
              </div>
            )}

            <button onClick={() => setShowModal(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', width: '100%' }}>Zatvori</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Usluge;
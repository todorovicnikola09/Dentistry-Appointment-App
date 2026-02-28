  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import Footer from '../components/Footer';

  const Usluge = () => {
    const [usluge, setUsluge] = useState([]);
    const [stomatolozi, setStomatolozi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUsluga, setSelectedUsluga] = useState(null);
    const [slobodnaVremena, setSlobodnaVremena] = useState([]);
    const [formData, setFormData] = useState({ datum: '', stomatologId: '', vreme: '' });

    const [adminFormData, setAdminFormData] = useState({ naziv: '', cena: '', opis: '' });
    const [editId, setEditId] = useState(null);

    const danasnjiDatum = new Date().toISOString().split('T')[0];

    const userRaw = localStorage.getItem('user');
    const ulogovaniKorisnik = userRaw ? JSON.parse(userRaw) : { id: 1, ime: 'Marko', prezime: 'Marković', uloga: 'Pacijent' };
    
    const isAdmin = ulogovaniKorisnik.uloga === "Admin" || ulogovaniKorisnik.Uloga === "Admin";

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

    const popuniTestnuUslugu = () => {
      const randomUsluge = [
        { n: "Izbeljivanje Zuba 4K", c: 15000, o: "Najsavremenija metoda hladnim laserom." },
        { n: "Dečija Stomatologija", c: 3000, o: "Bezbolna popravka zuba za najmlađe." },
        { n: "Ortodoncija Fixna", c: 85000, o: "Metalna fiksna proteza vrhunskog kvaliteta." },
        { n: "Cirkonijum krunice", c: 22000, o: "Vrhunska estetika i prirodan izgled zuba." }
      ];
      const r = randomUsluge[Math.floor(Math.random() * randomUsluge.length)];
      setAdminFormData({ naziv: r.n, cena: r.c, opis: r.o });
    };

    const popuniTestniTermin = async () => {
      if (stomatolozi.length === 0) {
        alert("Nema učitanih stomatologa!");
        return;
      }

      const randomStomatolog = stomatolozi[Math.floor(Math.random() * stomatolozi.length)];
      const sId = randomStomatolog.id || randomStomatolog.Id;
      
      setFormData(prev => ({ ...prev, stomatologId: sId, datum: danasnjiDatum }));

      try {
        const url = `http://localhost:5169/api/Termin/slob_vremena?stomatologId=${sId}&datum=${danasnjiDatum}`;
        const res = await axios.get(url);
        let vremena = res.data;

        const sad = new Date();
        const sati = sad.getHours();
        const minuti = sad.getMinutes();
        
        // Primenjujemo filtriranje radnog vremena i za testnu funkciju
        const danUNedelji = sad.getDay(); 
        vremena = vremena.filter(v => {
          const [h, m] = v.split(':').map(Number);
          const uBuducnosti = h > sati || (h === sati && m > minuti);
          
          if (danUNedelji === 0) return false; // Nedelja
          if (danUNedelji === 6) return uBuducnosti && h >= 10 && h < 15; // Subota
          return uBuducnosti && h >= 9 && h < 20; // Radni dani
        });

        if (vremena.length > 0) {
          const nasumicnoVreme = vremena[Math.floor(Math.random() * vremena.length)];
          setSlobodnaVremena(vremena);
          setFormData(prev => ({ ...prev, stomatologId: sId, datum: danasnjiDatum, vreme: nasumicnoVreme }));
        } else {
          alert("Nema više slobodnih termina za danas u okviru radnog vremena.");
        }
      } catch (e) {
        console.error("Greška pri automatskom popunjavanju vremena:", e);
      }
    };

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

    useEffect(() => {
      ucitajPodatke();
    }, []);

    const handleAdminSubmit = async (e) => {
      e.preventDefault();
      try {
        const model = {
          Naziv: adminFormData.naziv,
          Cena: parseFloat(adminFormData.cena),
          Opis: adminFormData.opis || "Standardna usluga"
        };

        if (editId) {
          await axios.put(`http://localhost:5169/api/Usluga/${editId}`, model);
          alert("Usluga izmenjena!");
        } else {
          await axios.post('http://localhost:5169/api/Usluga', model);
          alert("Usluga dodata!");
        }
        setAdminFormData({ naziv: '', cena: '', opis: '' });
        setEditId(null);
        ucitajPodatke();
      } catch (err) {
        alert("Greška pri čuvanju usluge.");
      }
    };

    const obrisiUslugu = async (id) => {
      if (window.confirm("Da li ste sigurni da želite da obrišete ovu uslugu?")) {
        try {
          await axios.delete(`http://localhost:5169/api/Usluga/${id}`);
          alert("Obrisano!");
          ucitajPodatke();
        } catch (err) {
          alert("Greška pri brisanju.");
        }
      }
    };

    const pokreniIzmenu = (u) => {
      setEditId(u.id || u.Id);
      setAdminFormData({
        naziv: u.naziv || u.Naziv,
        cena: u.cena || u.Cena,
        opis: u.opis || u.Opis
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVidiVremena = async () => {
      try {
        const izabraniDatum = new Date(formData.datum);
        const danUNedelji = izabraniDatum.getDay(); // 0 = Nedelja, 6 = Subota

        if (danUNedelji === 0) {
          alert("Klinika ne radi nedeljom. Molimo izaberite drugi datum.");
          setSlobodnaVremena([]);
          return;
        }

        const url = `http://localhost:5169/api/Termin/slob_vremena?stomatologId=${formData.stomatologId}&datum=${formData.datum}`;
        const res = await axios.get(url);
        let vremena = res.data;

        // Logika za filtriranje radnog vremena
        vremena = vremena.filter(v => {
          const [h, m] = v.split(':').map(Number);
          
          // Provera za danas (da ne prikazuje prošla vremena)
          if (formData.datum === danasnjiDatum) {
            const sad = new Date();
            if (h < sad.getHours() || (h === sad.getHours() && m <= sad.getMinutes())) {
              return false;
            }
          }

          // Subota: 10:00 - 15:00
          if (danUNedelji === 6) {
            return h >= 10 && h < 15;
          }
          
          // Radni dani (Ponedeljak - Petak): 09:00 - 20:00
          return h >= 9 && h < 20;
        });

        setSlobodnaVremena(vremena);
        if (vremena.length === 0) alert("Nema slobodnih termina u okviru radnog vremena za ovaj datum.");
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

        await axios.post('http://localhost:5169/api/Termin', model);
        alert("Uspešno zakazano!");
        setShowModal(false);
        setFormData({ datum: '', stomatologId: '', vreme: '' });
      } catch (e) {
        alert("Baza odbila zakazivanje.");
      }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5rem' }}>Učitavanje...</div>;

    return (
      <div style={{ backgroundColor: '#F4F2F3', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        
        <div style={{ padding: '60px 10%', textAlign: 'center' }}>
          <h1 style={{ color: '#4A5D50', fontSize: '3rem', marginBottom: '10px' }}>Naše Usluge</h1>
          
          {isAdmin && (
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '40px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', border: '2px solid #D4A5BC' }}>
              <h3 style={{color: '#4A5D50'}}>{editId ? "Izmena Usluge" : "Dodaj Novu Uslugu"}</h3>
              <form onSubmit={handleAdminSubmit} style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Naziv" value={adminFormData.naziv} onChange={e => setAdminFormData({...adminFormData, naziv: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} required />
                <input type="number" placeholder="Cena" value={adminFormData.cena} onChange={e => setAdminFormData({...adminFormData, cena: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd' }} required />
                <input type="text" placeholder="Opis" value={adminFormData.opis} onChange={e => setAdminFormData({...adminFormData, opis: e.target.value})} style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd', width: '250px' }} />
                
                <div style={{display: 'flex', gap: '5px'}}>
                  <button type="submit" style={{ background: '#4A5D50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                      {editId ? "Sačuvaj" : "Dodaj"}
                  </button>
                  {!editId && (
                      <button type="button" onClick={popuniTestnuUslugu} style={{ background: '#D4A5BC', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Test Podaci
                      </button>
                  )}
                  {editId && <button type="button" onClick={() => {setEditId(null); setAdminFormData({naziv:'', cena:'', opis:''})}} style={{ background: '#ccc', border: 'none', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>Odustani</button>}
                </div>
              </form>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {usluge.map((u) => (
              <div key={u.id || u.Id} style={{ backgroundColor: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                
                {isAdmin && (
                  <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => pokreniIzmenu(u)} style={{ background: '#4A5D50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}>Izmeni</button>
                    <button onClick={() => obrisiUslugu(u.id || u.Id)} style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}>Obriši</button>
                  </div>
                )}

                <div>
                  <h3 style={{ color: '#4A5D50', fontSize: '1.6rem', marginBottom: '15px', paddingRight: isAdmin ? '80px' : '0' }}>{u.naziv || u.Naziv}</h3>
                  <p style={{ color: '#777', fontSize: '1rem', lineHeight: '1.5' }}>{u.opis || u.Opis}</p>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <p style={{ color: '#D4A5BC', fontWeight: 'bold', fontSize: '1.4rem' }}>{u.cena || u.Cena} RSD</p>
                  <button 
                    onClick={() => { setSelectedUsluga(u); setShowModal(true); setSlobodnaVremena([]); setFormData({ datum: '', stomatologId: '', vreme: '' }); }}
                    style={{ background: '#4A5D50', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
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
            <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
              <h2 style={{ color: '#4A5D50', marginBottom: '10px' }}>Rezervacija</h2>
              
              <button onClick={popuniTestniTermin} style={{ background: '#D4A5BC', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>
                Popuni podatke 
              </button>

              <p style={{ color: '#4A5D50', marginBottom: '20px', fontWeight: 'bold' }}>
                Usluga: {selectedUsluga?.naziv || selectedUsluga?.Naziv}
              </p>
              
              <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Stomatolog:</label>
              <select style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #ddd' }} onChange={e => setFormData({...formData, stomatologId: e.target.value})} value={formData.stomatologId}>
                <option value="">-- Izaberi --</option>
                {stomatolozi.map(s => <option key={s.id || s.Id} value={s.id || s.Id}>dr {s.ime || s.Ime} {s.prezime || s.Prezime}</option>)}
              </select>

              <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Datum:</label>
              <input 
                type="date" 
                min={danasnjiDatum} 
                style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                onChange={e => { 
                  const selectedDate = new Date(e.target.value);
                  if(selectedDate.getDay() === 0) {
                    alert("Nedelja je neradan dan!");
                    setFormData({...formData, datum: ''});
                  } else {
                    setFormData({...formData, datum: e.target.value}); 
                    setSlobodnaVremena([]); 
                  }
                }} 
                value={formData.datum} 
              />

              <button disabled={!formData.datum || !formData.stomatologId} onClick={handleVidiVremena} style={{ width: '100%', padding: '15px', background: (!formData.datum || !formData.stomatologId) ? '#ccc' : '#D4A5BC', color: 'white', border: 'none', borderRadius: '12px', marginBottom: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                PROVERI DOSTUPNOST
              </button>

              {(slobodnaVremena.length > 0 || formData.vreme) && (
                <div style={{ background: '#f0f4f1', padding: '15px', borderRadius: '15px', border: '2px solid #4A5D50' }}>
                  <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Izaberi/Proveri vreme:</label>
                  <select 
                    style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #ddd' }} 
                    value={formData.vreme} 
                    onChange={e => setFormData({...formData, vreme: e.target.value})}
                  >
                    <option value="">-- Vreme --</option>
                    {slobodnaVremena.map(v => <option key={v} value={v}>{v.substring(0, 5)} h</option>)}
                  </select>
                  <button onClick={potvrdiRezervaciju} disabled={!formData.vreme} style={{ width: '100%', padding: '15px', background: '#4A5D50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    POTVRDI REZERVACIJU
                  </button>
                </div>
              )}

              <button onClick={() => setShowModal(false)} style={{ marginTop: '15px', background: 'none', border: 'none', color: '#999', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>ZATVORI</button>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );
  };

  export default Usluge;
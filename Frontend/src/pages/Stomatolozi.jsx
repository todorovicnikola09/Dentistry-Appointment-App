import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Stomatolozi = () => {
  const [stomatolozi, setStomatolozi] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    ime: '', 
    prezime: '', 
    email: '', 
    brojLicence: '', 
    lozinka: '',
    jmbg: '',
    brojTelefona: ''
  });

  // --- MODAL STATE ---
  const [statusModal, setStatusModal] = useState({ 
    show: false, 
    naslov: '', 
    poruka: '', 
    tip: 'info', 
    akcija: null 
  });

  const prikaziPoruku = (naslov, poruka, tip = 'info', akcija = null) => {
    setStatusModal({ show: true, naslov, poruka, tip, akcija });
  };

  const role = localStorage.getItem('role');
  const isAdmin = role === 'Admin';

  const paleta = {
    pozadina: '#F4F2F3',
    roze: '#D4A5BC',    
    zelena: '#4A5D50',   
    tekst: '#1A1A1A',
    bela: '#FFFFFF',
    svetloSiva: '#f8f9fa'
  };

  const popuniTestnePodatke = () => {
    const muskaImena = ['Dragan', 'Zoran', 'Goran', 'Marko', 'Nikola'];
    const zenskaImena = ['Milica', 'Ana', 'Jelena', 'Marija', 'Ivana'];
    const prezimena = ['Simić', 'Lukić', 'Marić', 'Popović', 'Kostić', 'Tadić'];
    
    const isMale = Math.random() > 0.5;
    const rIme = isMale ? muskaImena[Math.floor(Math.random() * muskaImena.length)] : zenskaImena[Math.floor(Math.random() * zenskaImena.length)];
    const rPrezime = prezimena[Math.floor(Math.random() * prezimena.length)];
    const rBroj = Math.floor(100 + Math.random() * 899);
    
    let rJmbg = "";
    for(let i=0; i<13; i++) rJmbg += Math.floor(Math.random() * 10).toString();

    let rLicenca = "LIC-";
    for(let i=0; i<5; i++) rLicenca += Math.floor(Math.random() * 10).toString();

    setFormData({
      ime: rIme,
      prezime: rPrezime,
      email: `dr.${rIme.toLowerCase()}.${rPrezime.toLowerCase()}${rBroj}@gmail.com`,
      brojLicence: rLicenca,
      lozinka: 'stom123',
      jmbg: rJmbg,
      brojTelefona: `06${Math.floor(4 + Math.random() * 2)}${Math.floor(1000000 + Math.random() * 8999999)}`
    });
  };

  const fetchStomatolozi = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchStomatolozi();
  }, []);

  const handleLicenceChange = (e) => {
    let value = e.target.value.toUpperCase();
    if (!value.startsWith("LIC-")) {
      value = "LIC-" + value.replace("LIC-", "");
    }
    const prefix = "LIC-";
    const suffix = value.slice(4).replace(/\D/g, '').substring(0, 5);
    setFormData({ ...formData, brojLicence: prefix + suffix });
  };

  const validirajPodatke = (isEdit = false) => {
    const { ime, prezime, email, brojLicence, jmbg, brojTelefona } = formData;

    if(!ime || !prezime || !email || !brojLicence || !jmbg || !brojTelefona) {
      prikaziPoruku("Pažnja", "Sva polja su obavezna!");
      return false;
    }

    const proveraEmail = stomatolozi.find(s => 
      (s.email || s.Email).toLowerCase() === email.toLowerCase() && (isEdit ? (s.id || s.Id) !== editId : true)
    );
    if(proveraEmail) {
      prikaziPoruku("Greška", "Ovaj email je već zauzet!");
      return false;
    }

    if (!/^\d{13}$/.test(jmbg)) {
      prikaziPoruku("Greška", "JMBG mora imati tačno 13 cifara!");
      return false;
    }
    
    const proveraJmbg = stomatolozi.find(s => 
      (s.jmbg || s.Jmbg) === jmbg && (isEdit ? (s.id || s.Id) !== editId : true)
    );
    if(proveraJmbg) {
      prikaziPoruku("Greška", "Korisnik sa ovim JMBG-om već postoji!");
      return false;
    }

    if (!/^06\d{7,8}$/.test(brojTelefona)) {
      prikaziPoruku("Greška", "Broj telefona mora početi sa '06' i imati 9 ili 10 cifara!");
      return false;
    }

    if (!/^LIC-\d{5}$/.test(brojLicence)) {
      prikaziPoruku("Greška", "Licenca mora biti u formatu LIC- i 5 cifara!");
      return false;
    }

    return true;
  };

  const obrisi = (id) => {
    if(!id) return;
    prikaziPoruku(
      "Brisanje", 
      "Da li ste sigurni? Brisanje stomatologa uklanja i sve njegove termine!", 
      "confirm", 
      async () => {
        try {
          await axios.delete(`http://localhost:5169/api/korisnik/stomatolozi/${id}`);
          prikaziPoruku("Uspeh", "Stomatolog je uspešno obrisan.");
          fetchStomatolozi();
        } catch (err) {
          prikaziPoruku("Greška", "Greška pri brisanju! Stomatolog ima zakazane termine!");
        }
      }
    );
  };

  const handleDodaj = async () => {
    if(!validirajPodatke(false)) return;

    try {
      const payload = {
          ...formData,
          lozinka: formData.lozinka || "stom123"
      };
      await axios.post('http://localhost:5169/api/korisnik/stomatolozi', payload);
      prikaziPoruku("Uspeh", "Novi stomatolog dodat u sistem!");
      setShowAddForm(false);
      resetForm();
      fetchStomatolozi();
    } catch (err) {
      prikaziPoruku("Greška", err.response?.data || "Greška pri dodavanju!");
    }
  };

  const pokreniIzmenu = (s) => {
    const idZaIzmenu = s.id || s.Id;
    setEditId(idZaIzmenu);
    setShowAddForm(false);
    setFormData({
      ime: s.ime || s.Ime,
      prezime: s.prezime || s.Prezime,
      email: s.email || s.Email,
      brojLicence: s.brojLicence || s.BrojLicence || 'LIC-',
      jmbg: s.jmbg || s.Jmbg || '',
      brojTelefona: s.brojTelefona || s.BrojTelefona || '',
      lozinka: '' 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sacuvajIzmene = async () => {
    if(!validirajPodatke(true)) return;

    try {
      await axios.put(`http://localhost:5169/api/korisnik/stomatolozi/${editId}`, formData);
      prikaziPoruku("Uspeh", "Podaci o stomatologu su izmenjeni.");
      setEditId(null);
      resetForm();
      fetchStomatolozi();
    } catch (err) {
      prikaziPoruku("Greška", err.response?.data || "Greška pri čuvanju!");
    }
  };

  const resetForm = () => {
    setFormData({ ime: '', prezime: '', email: '', brojLicence: '', lozinka: '', jmbg: '', brojTelefona: '' });
  };

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* --- CUSTOM MODAL --- */}
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '25px', width: '400px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                <h3 style={{ color: paleta.zelena, fontSize: '1.8rem', marginBottom: '15px' }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.4' }}>{statusModal.poruka}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {statusModal.tip === 'confirm' ? (
                        <>
                            <button onClick={() => { statusModal.akcija(); setStatusModal({...statusModal, show: false}); }} style={{ background: paleta.zelena, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Potvrdi</button>
                            <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: paleta.roze, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Odustani</button>
                        </>
                    ) : (
                        <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: paleta.zelena, color: 'white', border: 'none', padding: '12px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>U REDU</button>
                    )}
                </div>
            </div>
        </div>
      )}

      <div style={{ padding: '120px 8% 60px 8%', boxSizing: 'border-box' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '2.8rem', color: paleta.zelena, marginBottom: '10px', fontWeight: 'bold' }}>
            {isAdmin ? "Upravljanje Stomatolozima" : "Naš Tim Eksperata"}
          </h1>
          {isAdmin && (
            <button 
              onClick={() => { 
                  if(editId) { setEditId(null); resetForm(); }
                  setShowAddForm(!showAddForm); 
              }}
              style={{ backgroundColor: paleta.roze, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              {showAddForm || editId ? "Zatvori formu" : "+ Dodaj Novog Stomatologa"}
            </button>
          )}
        </div>

        {isAdmin && (showAddForm || editId) && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', border: `2px solid ${paleta.roze}` }}>
            <h3 style={{ color: paleta.zelena, marginTop: 0 }}>
              {editId ? `Izmena: dr ${formData.ime} ${formData.prezime}` : "Novi Stomatolog"}
            </h3>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <input 
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.ime} 
                onChange={e => setFormData({...formData, ime: e.target.value})} 
                placeholder="Ime" 
                autoComplete="off"
              />
              <input 
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.prezime} 
                onChange={e => setFormData({...formData, prezime: e.target.value})} 
                placeholder="Prezime" 
                autoComplete="off"
              />
              <input 
                type="email"
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
                placeholder="Email" 
                autoComplete="off"
              />
              <input 
                type="text"
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: editId ? '#f9f9f9' : 'white' }} 
                value={formData.brojLicence} 
                onChange={handleLicenceChange} 
                onFocus={(e) => { if(!formData.brojLicence) setFormData({...formData, brojLicence: 'LIC-'}) }}
                placeholder="Broj licence (LIC-12345)" 
                disabled={editId}
                autoComplete="off"
              />
              <input 
                type="text"
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd', backgroundColor: editId ? '#f9f9f9' : 'white' }} 
                value={formData.jmbg} 
                onChange={e => setFormData({...formData, jmbg: e.target.value.replace(/\D/g, '').substring(0, 13)})} 
                placeholder="JMBG (13 cifara)" 
                disabled={editId}
                autoComplete="off"
              />
              <input 
                type="text"
                style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.brojTelefona} 
                onChange={e => setFormData({...formData, brojTelefona: e.target.value})} 
                placeholder="Telefon (npr. 064123456)" 
                autoComplete="off"
              />
              {!editId && (
                <input 
                  type="password" 
                  style={{ padding: '10px', flex: '1 1 200px', borderRadius: '5px', border: '1px solid #ddd' }} 
                  value={formData.lozinka} 
                  onChange={e => setFormData({...formData, lozinka: e.target.value})} 
                  placeholder="Lozinka (default: stom123)" 
                  autoComplete="new-password"
                />
              )}
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button onClick={editId ? sacuvajIzmene : handleDodaj} style={{ backgroundColor: paleta.zelena, color: 'white', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                {editId ? "Sačuvaj izmene" : "Dodaj u bazu"}
              </button>

              {!editId && (
                <button 
                    onClick={popuniTestnePodatke}
                    type="button"
                    style={{ backgroundColor: paleta.roze, color: 'white', padding: '10px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Popuni testne podatke
                </button>
              )}

              <button onClick={() => { setEditId(null); setShowAddForm(false); resetForm(); }} style={{ backgroundColor: '#ccc', color: 'black', border: 'none', padding: '10px 25px', borderRadius: '5px', cursor: 'pointer' }}>Odustani</button>
            </div>
          </div>
        )}

        {loading ? (
          <h2 style={{ color: paleta.zelena, textAlign: 'center' }}>Učitavanje...</h2>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: paleta.zelena, color: 'white', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Ime i Prezime</th>
                  <th style={{ padding: '20px' }}>Kontakt (Email/Tel)</th>
                  <th style={{ padding: '20px' }}>JMBG</th>
                  <th style={{ padding: '20px' }}>Licenca</th>
                  {isAdmin && <th style={{ padding: '20px' }}>Akcije</th>}
                </tr>
              </thead>
              <tbody>
                {stomatolozi.map(s => {
                  const currentId = s.id || s.Id;
                  return (
                    <tr key={currentId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '18px' }}>dr {s.ime || s.Ime} {s.prezime || s.Prezime}</td>
                      <td style={{ padding: '18px' }}>
                        <div>{s.email || s.Email}</div>
                        <div style={{fontSize: '0.85rem', color: '#666'}}>{s.brojTelefona || s.BrojTelefona || '/'}</div>
                      </td>
                      <td style={{ padding: '18px' }}>{s.jmbg || s.Jmbg || 'N/A'}</td>
                      <td style={{ padding: '18px' }}>{s.brojLicence || s.BrojLicence || 'N/A'}</td>
                      {isAdmin && (
                        <td style={{ padding: '18px' }}>
                          <button onClick={() => pokreniIzmenu(s)} style={{ color: paleta.zelena, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>Izmeni</button>
                          <button onClick={() => obrisi(currentId)} style={{ color: '#D32F2F', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Obriši</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {stomatolozi.length === 0 && <p style={{textAlign:'center', padding:'20px'}}>Nema stomatologa u sistemu.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stomatolozi;
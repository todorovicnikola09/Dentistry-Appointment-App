import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Pacijenti = () => {
  const [pacijenti, setPacijenti] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editId, setEditId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    ime: '', 
    prezime: '', 
    email: '', 
    lozinka: '',
    jmbg: '',
    brojTelefona: ''
  });

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
    siva: '#CCCCCC'
  };

  const popuniTestnePodatke = () => {
    const imena = ['Marko', 'Nikola', 'Jelena', 'Milica', 'Stefan', 'Ana', 'Luka', 'Sara'];
    const prezimena = ['Marković', 'Petrović', 'Jovanović', 'Nikolić', 'Kostić', 'Lukić', 'Ivić'];
    
    const rIme = imena[Math.floor(Math.random() * imena.length)];
    const rPrezime = prezimena[Math.floor(Math.random() * prezimena.length)];
    const rBroj = Math.floor(100 + Math.random() * 900);
    
    let rJmbg = "";
    for(let i=0; i<13; i++) {
        rJmbg += Math.floor(Math.random() * 10).toString();
    }

    setFormData({
      ime: rIme,
      prezime: rPrezime,
      email: `${rIme.toLowerCase()}.${rPrezime.toLowerCase()}${rBroj}@gmail.com`,
      lozinka: 'pac123',
      jmbg: rJmbg,
      brojTelefona: `06${Math.floor(10000000 + Math.random() * 80000000)}`
    });
  };

  const fetchPacijente = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5169/api/pacijent');
      setPacijenti(res.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchPacijente(); }, []);

  const validirajPodatke = () => {
    const { ime, prezime, email, jmbg, brojTelefona } = formData;
    if(!ime || !prezime || !email || !jmbg || !brojTelefona) {
      prikaziPoruku("Pažnja", "Sva polja su obavezna!");
      return false;
    }
    if (!/^\d{13}$/.test(jmbg)) {
      prikaziPoruku("Greška", "JMBG mora imati tačno 13 cifara!");
      return false;
    }
    return true;
  };

  const handleDodaj = async () => {
    if(!validirajPodatke()) return;
    try {
      const payload = { ...formData, lozinka: formData.lozinka || "pac123" };
      await axios.post('http://localhost:5169/api/pacijent', payload);
      prikaziPoruku("Uspeh", "Pacijent je uspešno dodat u bazu.");
      setShowAddForm(false);
      resetForm();
      fetchPacijente();
    } catch (err) { 
        prikaziPoruku("Greška", err.response?.data || "Došlo je do greške pri dodavanju.");
    }
  };

  const sacuvajIzmene = async () => {
    if(!validirajPodatke()) return;
    try {
      // Čistimo ID za svaki slučaj
      const cistEditId = editId.toString().split(':')[0];
      await axios.put(`http://localhost:5169/api/pacijent/${cistEditId}`, formData);
      prikaziPoruku("Uspeh", "Podaci o pacijentu su uspešno ažurirani.");
      setEditId(null);
      resetForm();
      fetchPacijente();
    } catch (err) { 
        prikaziPoruku("Greška", "Nije moguće sačuvati izmene.");
    }
  };

  const pokreniIzmenu = (p) => {
    const rawId = p.id || p.Id;
    setEditId(rawId);
    setShowAddForm(false);
    setFormData({
      ime: p.ime || p.Ime,
      prezime: p.prezime || p.Prezime,
      email: p.email || p.Email,
      jmbg: p.jmbg || p.Jmbg,
      brojTelefona: p.brojTelefona || p.BrojTelefona || '',
      lozinka: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const obrisi = (rawId) => {
    if(!rawId) return;

    // KLJUČNA IZMENA: Čistimo ID od sufiksa tipa ":1"
    const idZaSlanje = rawId.toString().split(':')[0];

    prikaziPoruku(
        "Brisanje", 
        "Da li ste sigurni da želite da obrišete ovog pacijenta?", 
        "confirm", 
        async () => {
            try {
                await axios.delete(`http://localhost:5169/api/pacijent/${idZaSlanje}`);
                fetchPacijente();
            } catch (err) { 
                console.error("Greška pri brisanju:", err);
                
                // Ako je greška 400, verovatno su termini, ako je nešto drugo, ispiši šta je
                const status = err.response?.status;
                const porukaServera = err.response?.data;

                if (status === 400) {
                    prikaziPoruku(
                        "Nije moguće obrisati", 
                        "Ovaj pacijent verovatno ima povezane podatke (termine) u bazi koji nisu obrisani.", 
                        "info"
                    );
                } else {
                    prikaziPoruku("Greška", porukaServera || "Došlo je do serverske greške.");
                }
            }
        }
    );
  };

  const resetForm = () => setFormData({ ime: '', prezime: '', email: '', lozinka: '', jmbg: '', brojTelefona: '' });

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
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

      <div style={{ padding: '120px 8% 60px 8%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: paleta.zelena, fontWeight: 'bold' }}>Upravljanje Pacijentima</h1>
          {isAdmin && (
            <button 
              onClick={() => { if(editId) setEditId(null); setShowAddForm(!showAddForm); resetForm(); }}
              style={{ backgroundColor: paleta.roze, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            >
              {showAddForm || editId ? "Zatvori formu" : "+ Dodaj Novog Pacijenta"}
            </button>
          )}
        </div>

        {isAdmin && (showAddForm || editId) && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: `2px solid ${paleta.roze}`, boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: paleta.zelena, marginBottom: '20px' }}>
                {editId ? `Izmena: ${formData.ime} ${formData.prezime}` : "Novi Pacijent"}
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.ime} onChange={e => setFormData({...formData, ime: e.target.value})} placeholder="Ime" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.prezime} onChange={e => setFormData({...formData, prezime: e.target.value})} placeholder="Prezime" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email adresa" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd', backgroundColor: editId ? '#f9f9f9' : 'white'}} value={formData.jmbg} disabled={!!editId} onChange={e => setFormData({...formData, jmbg: e.target.value.replace(/\D/g, '').substring(0, 13)})} placeholder="JMBG (13 cifara)" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.brojTelefona} onChange={e => setFormData({...formData, brojTelefona: e.target.value})} placeholder="Telefon (npr. 064...)" />
              {!editId && <input type="password" style={{padding:'10px', flex:'1 1 100%', borderRadius:'5px', border: '1px solid #ddd', marginTop: '10px'}} value={formData.lozinka} onChange={e => setFormData({...formData, lozinka: e.target.value})} placeholder="Lozinka (default: pac123)" />}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={editId ? sacuvajIzmene : handleDodaj} 
                style={{ backgroundColor: paleta.zelena, color: 'white', padding: '10px 25px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
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

              <button 
                onClick={() => { setEditId(null); setShowAddForm(false); resetForm(); }} 
                style={{ padding: '10px 25px', borderRadius: '5px', border: 'none', backgroundColor: paleta.siva, cursor: 'pointer' }}
              >
                Odustani
              </button>
            </div>
          </div>
        )}

        {loading ? <h2 style={{textAlign:'center', color: paleta.zelena}}>Učitavanje...</h2> : (
          <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: paleta.zelena, color: 'white', textAlign: 'left' }}>
                  <th style={{ padding: '20px' }}>Ime i Prezime</th>
                  <th style={{ padding: '20px' }}>Kontakt (Email/Tel)</th>
                  <th style={{ padding: '20px' }}>JMBG</th>
                  {isAdmin && <th style={{ padding: '20px' }}>Akcije</th>}
                </tr>
              </thead>
              <tbody>
                {pacijenti.map(p => {
                  const aktuelniId = p.id || p.Id;
                  return (
                    <tr key={aktuelniId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '18px', fontWeight: '500' }}>{p.ime || p.Ime} {p.prezime || p.Prezime}</td>
                      <td style={{ padding: '18px' }}>
                          <div style={{color: paleta.tekst}}>{p.email || p.Email}</div>
                          <small style={{color: '#666'}}>{p.brojTelefona || p.BrojTelefona || '/'}</small>
                      </td>
                      <td style={{ padding: '18px', color: '#666' }}>{p.jmbg || p.Jmbg}</td>
                      {isAdmin && (
                        <td style={{ padding: '18px' }}>
                          <button onClick={() => pokreniIzmenu(p)} style={{ color: paleta.zelena, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>Izmeni</button>
                          <button onClick={() => obrisi(aktuelniId)} style={{ color: '#D32F2F', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Obriši</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {pacijenti.length === 0 && <p style={{textAlign:'center', padding:'30px'}}>Trenutno nema registrovanih pacijenata.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pacijenti;
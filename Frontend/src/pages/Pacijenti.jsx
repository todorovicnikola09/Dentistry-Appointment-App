import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';

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
      brojTelefona: `06${Math.floor(Math.random() * 90000000)}`
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
      alert("Sva polja su obavezna!");
      return false;
    }
    if (!/^\d{13}$/.test(jmbg)) {
      alert("JMBG mora imati 13 cifara!");
      return false;
    }
    return true;
  };

  const handleDodaj = async () => {
    if(!validirajPodatke()) return;
    try {
      const payload = { ...formData, lozinka: formData.lozinka || "pac123" };
      await axios.post('http://localhost:5169/api/pacijent', payload);
      alert("Pacijent dodat!");
      setShowAddForm(false);
      resetForm();
      fetchPacijente();
    } catch (err) { alert(err.response?.data || "Greška!"); }
  };

  const sacuvajIzmene = async () => {
    if(!validirajPodatke()) return;
    try {
      await axios.put(`http://localhost:5169/api/pacijent/${editId}`, formData);
      alert("Izmenjeno!");
      setEditId(null);
      resetForm();
      fetchPacijente();
    } catch (err) { alert(err.response?.data || "Greška!"); }
  };

  const pokreniIzmenu = (p) => {
    setEditId(p.id || p.Id);
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

  const obrisi = async (id) => {
    if(window.confirm("Da li ste sigurni?")) {
      try {
        await axios.delete(`http://localhost:5169/api/pacijent/${id}`);
        alert("Obrisano!");
        fetchPacijente();
      } catch (err) { alert("Greška pri brisanju!"); }
    }
  };

  const resetForm = () => setFormData({ ime: '', prezime: '', email: '', lozinka: '', jmbg: '', brojTelefona: '' });

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh' }}>
      <div style={{ padding: '120px 8% 60px 8%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: paleta.zelena, fontWeight: 'bold' }}>Upravljanje Pacijentima</h1>
          {isAdmin && (
            <button 
              onClick={() => { if(editId) setEditId(null); setShowAddForm(!showAddForm); resetForm(); }}
              style={{ backgroundColor: paleta.roze, color: 'white', border: 'none', padding: '12px 25px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' }}
            >
              {showAddForm || editId ? "Zatvori formu" : "+ Dodaj Novog Pacijenta"}
            </button>
          )}
        </div>

        {isAdmin && (showAddForm || editId) && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px', border: `2px solid ${paleta.roze}` }}>
            <h3 style={{ color: paleta.zelena, marginBottom: '20px' }}>
                {editId ? `Izmena: ${formData.ime}` : "Novi Pacijent"}
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.ime} onChange={e => setFormData({...formData, ime: e.target.value})} placeholder="Ime" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.prezime} onChange={e => setFormData({...formData, prezime: e.target.value})} placeholder="Prezime" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email adresa" />
              <input style={{padding:'10px', flex:'1 1 200px', borderRadius:'5px', border: '1px solid #ddd'}} value={formData.jmbg} disabled={!!editId} onChange={e => setFormData({...formData, jmbg: e.target.value.replace(/\D/g, '').substring(0, 13)})} placeholder="JMBG (13 cifara)" />
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

        {loading ? <h2 style={{textAlign:'center'}}>Učitavanje...</h2> : (
          <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
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
                {pacijenti.map(p => (
                  <tr key={p.id || p.Id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '18px' }}>{p.ime} {p.prezime}</td>
                    <td style={{ padding: '18px' }}>{p.email}<br/><small style={{color: '#666'}}>{p.brojTelefona}</small></td>
                    <td style={{ padding: '18px' }}>{p.jmbg}</td>
                    {isAdmin && (
                      <td style={{ padding: '18px' }}>
                        <button onClick={() => pokreniIzmenu(p)} style={{ color: paleta.zelena, border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '15px' }}>Izmeni</button>
                        <button onClick={() => obrisi(p.id || p.Id)} style={{ color: '#D32F2F', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Obriši</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Pacijenti;
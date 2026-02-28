import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUsluge = () => {
  const [usluge, setUsluge] = useState([]);
  const [formData, setFormData] = useState({ naziv: '', opis: '', cena: '' });
  const [editId, setEditId] = useState(null);


  const popuniTestnuUslugu = () => {
    const randomUsluge = [
      { n: "Izbeljivanje Zuba 4K", c: 15000, o: "Najsavremenija metoda hladnim laserom." },
      { n: "Dečija Stomatologija", c: 3000, o: "Bezbolna popravka zuba za najmlađe." },
      { n: "Ortodoncija Fixna", c: 85000, o: "Metalna fiksna proteza vrhunskog kvaliteta." },
      { n: "Cirkonijum krunice", c: 22000, o: "Vrhunska estetika i prirodan izgled zuba." }
    ];
    const r = randomUsluge[Math.floor(Math.random() * randomUsluge.length)];
    setFormData({ naziv: r.n, cena: r.c, opis: r.o });
  };

  const fetchUsluge = async () => {
    try {
      const res = await axios.get('http://localhost:5169/api/Usluga');
      setUsluge(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Greška pri učitavanju usluga:", err);
    }
  };

  useEffect(() => { fetchUsluge(); }, []);

  const handleSacuvaj = async () => {
    if (!formData.naziv || !formData.cena) {
        alert("Molimo popunite naziv i cenu.");
        return;
    }

    try {
      const model = {
        naziv: formData.naziv,
        cena: parseFloat(formData.cena),
        opis: formData.opis || "Standardna usluga"
      };

      if (editId) {
        const cistId = String(editId).includes(':') ? editId.split(':')[0] : editId;
        await axios.put(`http://localhost:5169/api/Usluga/${cistId}`, model);
        alert("Usluga uspešno izmenjena!");
      } else {
        await axios.post('http://localhost:5169/api/Usluga', model);
        alert("Usluga uspešno dodata!");
      }

      setFormData({ naziv: '', opis: '', cena: '' });
      setEditId(null);
      fetchUsluge();
    } catch (err) {
      console.error(err);
      alert("Greška pri čuvanju: " + (err.response?.data || "Server nije odgovorio"));
    }
  };

  const obrisi = async (id) => {
    if(!id) {
        alert("Greška: ID nije validan.");
        return;
    }
    const cistId = String(id).includes(':') ? id.split(':')[0] : id;
    if(window.confirm(`Da li ste sigurni da želite da obrišete uslugu ID: ${cistId}?`)) {
      try {
        await axios.delete(`http://localhost:5169/api/Usluga/${cistId}`);
        fetchUsluge();
      } catch (err) {
        console.error(err);
        alert("Greška pri brisanju!");
      }
    }
  };

  const pripremiIzmenu = (u) => {
    const id = u.id || u.Id || u.ID;
    setEditId(id);
    setFormData({
      naziv: u.naziv || u.Naziv || '',
      cena: u.cena || u.Cena || '',
      opis: u.opis || u.Opis || ''
    });
  };

  return (
    <div style={{ padding: '120px 40px 40px 40px', backgroundColor: '#F4F2F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#4A5D50', marginBottom: '30px' }}>Upravljanje Uslugama</h1>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: editId ? '#D4A5BC' : '#4A5D50' }}>
              {editId ? `Izmena usluge (ID: ${editId})` : 'Dodaj Novu Uslugu'}
            </h3>
            
            
            <button 
              type="button" 
              onClick={popuniTestnuUslugu} 
              style={{ background: '#D4A5BC', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Popuni Test Podatke
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input 
                placeholder="Naziv" 
                value={formData.naziv} 
                onChange={e => setFormData({...formData, naziv: e.target.value})} 
                style={{padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1}} 
            />
            <input 
                placeholder="Cena" 
                type="number" 
                value={formData.cena} 
                onChange={e => setFormData({...formData, cena: e.target.value})} 
                style={{padding: '10px', borderRadius: '5px', border: '1px solid #ddd', width: '150px'}} 
            />
            <button 
                onClick={handleSacuvaj} 
                style={{ background: editId ? '#D4A5BC' : '#4A5D50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                {editId ? 'Sačuvaj Izmene' : 'Dodaj Uslugu'}
            </button>
            {editId && (
                <button 
                    onClick={() => {setEditId(null); setFormData({naziv:'', opis:'', cena:''})}} 
                    style={{background: '#eee', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px'}}
                >
                    Odustani
                </button>
            )}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#4A5D50', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '20px' }}>ID</th>
                <th style={{ padding: '20px' }}>Naziv</th>
                <th style={{ padding: '20px' }}>Cena</th>
                <th style={{ padding: '20px' }}>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {usluge.map(u => {
                const currentId = u.id || u.Id || u.ID;
                return (
                  <tr key={currentId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '18px', color: '#888' }}>{currentId}</td>
                    <td style={{ padding: '18px' }}>{u.naziv || u.Naziv}</td>
                    <td style={{ padding: '18px' }}>{u.cena || u.Cena} RSD</td>
                    <td style={{ padding: '18px' }}>
                      <button 
                        onClick={() => pripremiIzmenu(u)} 
                        style={{ color: '#4A5D50', border: 'none', background: 'none', fontWeight: 'bold', marginRight: '10px', cursor: 'pointer' }}
                      >
                        Izmeni
                      </button>
                      <button 
                        onClick={() => obrisi(currentId)} 
                        style={{ color: '#D32F2F', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {usluge.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>Nema unetih usluga u bazi.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminUsluge;
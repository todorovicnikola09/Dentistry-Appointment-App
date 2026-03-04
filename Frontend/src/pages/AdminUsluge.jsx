import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUsluge = () => {
  const [usluge, setUsluge] = useState([]);
  const [formData, setFormData] = useState({ naziv: '', opis: '', cena: '' });
  const [editId, setEditId] = useState(null);

  
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

  const popuniTestnuUslugu = () => {
    const randomUsluge = [
      { n: "Izbeljivanje Zuba 4K", c: 15000, o: "Najsavremenija metoda hladnim laserom." },
            { n: "Dečija Stomatologija", c: 3000, o: "Bezbolna popravka zuba za najmlađe." },
            { n: "Ortodoncija Fixna", c: 85000, o: "Metalna fiksna proteza vrhunskog kvaliteta." },
            { n: "Kompozitni Faset", c: 12000, o: "Estetsko korigovanje oblika i boje zuba." },
            { n: "Bezmetalna Keramika", c: 28000, o: "Najkvalitetnija protetika za savršen osmeh." },
            { n: "Ugradnja Implantata", c: 65000, o: "Premium titanijumski implantat sa garancijom." },
            { n: "Hirurško Vađenje Uma", c: 15000, o: "Bezbolna hirurška intervencija uz lokalnu anesteziju." },
            { n: "Mašinsko Lečenje Kanala", c: 75000, o: "Endodontski tretman najnovijom tehnologijom." }
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
        prikaziPoruku("Pažnja", "Molimo popunite naziv i cenu.");
        return;
    }

   
    if (parseFloat(formData.cena) < 0) {
        prikaziPoruku("Greška", "Cena ne može biti negativan broj.");
        return;
    }

    const nazivPostoji = usluge.some(u => 
        (u.naziv || u.Naziv || "").toLowerCase().trim() === formData.naziv.toLowerCase().trim() && 
        (u.id || u.Id || u.ID) !== editId
    );

    if (nazivPostoji) {
        prikaziPoruku("Greška", "Usluga sa ovim nazivom već postoji.");
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
        prikaziPoruku("Uspeh", "Usluga uspešno izmenjena!");
      } else {
        await axios.post('http://localhost:5169/api/Usluga', model);
        prikaziPoruku("Uspeh", "Usluga uspešno dodata!");
      }

      setFormData({ naziv: '', opis: '', cena: '' });
      setEditId(null);
      fetchUsluge();
    } catch (err) {
      prikaziPoruku("Greška", "Greška pri čuvanju: " + (err.response?.data || "Server nije odgovorio"));
    }
  };

  const obrisi = (id) => {
    if(!id) return;
    const cistId = String(id).includes(':') ? id.split(':')[0] : id;

    prikaziPoruku(
        "Brisanje", 
        "Da li ste sigurni da želite da obrišete ovu uslugu?", 
        "confirm", 
        async () => {
            try {
                await axios.delete(`http://localhost:5169/api/Usluga/${cistId}`);
                fetchUsluge();
            } catch (err) {
                prikaziPoruku("Greška", "Greška pri brisanju!");
            }
        }
    );
  };

  const pripremiIzmenu = (u) => {
    const id = u.id || u.Id || u.ID;
    setEditId(id);
    setFormData({
      naziv: u.naziv || u.Naziv || '',
      cena: u.cena || u.Cena || '',
      opis: u.opis || u.Opis || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '120px 40px 40px 40px', backgroundColor: '#F4F2F3', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '35px', borderRadius: '25px', width: '400px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>
                <h3 style={{ color: '#4A5D50', fontSize: '1.8rem', marginBottom: '15px' }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '25px', lineHeight: '1.4' }}>{statusModal.poruka}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {statusModal.tip === 'confirm' ? (
                        <>
                            <button onClick={() => { statusModal.akcija(); setStatusModal({...statusModal, show: false}); }} style={{ background: '#4A5D50', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Potvrdi</button>
                            <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: '#D4A5BC', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Odustani</button>
                        </>
                    ) : (
                        <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: '#4A5D50', color: 'white', border: 'none', padding: '12px 40px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>U REDU</button>
                    )}
                </div>
            </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#4A5D50', marginBottom: '30px' }}>Upravljanje Uslugama</h1>
        
        <div style={{ background: 'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: editId ? '#D4A5BC' : '#4A5D50' }}>
              {editId ? `Izmena usluge: ${formData.naziv}` : 'Dodaj Novu Uslugu'}
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
                    <td style={{ padding: '18px', fontWeight: '500' }}>{u.naziv || u.Naziv}</td>
                    <td style={{ padding: '18px' }}>{u.cena || u.Cena} RSD</td>
                    <td style={{ padding: '18px' }}>
                      <button 
                        onClick={() => pripremiIzmenu(u)} 
                        style={{ color: '#4A5D50', border: 'none', background: 'none', fontWeight: 'bold', marginRight: '15px', cursor: 'pointer' }}
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
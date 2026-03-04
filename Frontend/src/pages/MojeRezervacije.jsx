import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MojeRezervacije = () => {
  const [termini, setTermini] = useState([]);
  const [usluge, setUsluge] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [izvestajModal, setIzvestajModal] = useState({ show: false, termin: null });
  const [izvestajData, setIzvestajData] = useState({ opis: '', cena: 0 });
  const [pogledajIzvestajModal, setPogledajIzvestajModal] = useState({ show: false, data: null });

  const [statusModal, setStatusModal] = useState({ 
    show: false, 
    naslov: '', 
    poruka: '', 
    tip: 'info', 
    akcija: null 
  });

  const rawId = localStorage.getItem('userId');
  const userId = rawId ? rawId.toString().replace(/"/g, '').split(':')[0] : null;
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

  const prikaziPoruku = (naslov, poruka, tip = 'info', akcija = null) => {
    setStatusModal({ show: true, naslov, poruka, tip, akcija });
  };

  const getStatusStil = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('cekanj') || s.includes('čekanj')) return { tekst: 'NA ČEKANJU', boja: paleta.crvena };
    if (s.includes('toku')) return { tekst: 'U TOKU', boja: paleta.zlato };
    if (s.includes('zavrsen') || s.includes('završen')) return { tekst: 'ZAVRŠENO', boja: paleta.statusZavrseno };
    if (s.includes('odbijen')) return { tekst: 'ODBIJENO', boja: paleta.crvena };
    return { tekst: status?.toUpperCase() || 'NEPOZNATO', boja: paleta.siva };
  };


  const fetchSve = async () => {
    if (!userId || userId === "undefined" || userId === "null") {
      setLoading(false);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      
      const resUsluge = await axios.get('http://localhost:5169/api/usluga', config);
      setUsluge(resUsluge.data);

      const endpoint = role === 'stomatolog' 
        ? `http://localhost:5169/api/termin/stomatolog/${userId}`
        : `http://localhost:5169/api/termin/pacijent/${userId}`;

      const resTermini = await axios.get(endpoint, config);
      const sviTermini = resTermini.data || [];

      
      const resIzvestaji = await axios.get('http://localhost:5169/api/izvestaj', config);
      const sviIzvestaji = resIzvestaji.data || [];

      
      const mapiraniTermini = sviTermini.map(t => {
        const tId = t.id || t.Id;
        const pronadjenIzvestaj = sviIzvestaji.find(izv => (izv.terminId || izv.TerminId) === tId);
        return { ...t, izvestaj: pronadjenIzvestaj };
      });

      setTermini(mapiraniTermini);
    } catch (err) {
      console.error("Greška pri učitavanju:", err);
    } finally {
      setLoading(false);
    }
  };

 
  const pripremiIzvestaj = (t) => {
   
    const nazivUsluge = t.usluga || t.Usluga;
    const pronadjenaUsluga = usluge.find(u => u.naziv === nazivUsluge || u.Naziv === nazivUsluge);
    
    setIzvestajModal({ show: true, termin: t });
    setIzvestajData({ 
      opis: '', 
      cena: pronadjenaUsluga ? (pronadjenaUsluga.cena || pronadjenaUsluga.Cena) : 0 
    });
  };

  const sacuvajIzvestaj = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = {
        opis: izvestajData.opis,
        terminId: izvestajModal.termin.id || izvestajModal.termin.Id,
        ukupnaCena: parseFloat(izvestajData.cena)
      };

      await axios.post(`http://localhost:5169/api/izvestaj`, payload, config);
      
     
      await azurirajStatusUBazi(payload.terminId, 'Završeno');
      
      setIzvestajModal({ show: false, termin: null });
      setIzvestajData({ opis: '', cena: 0 });
      prikaziPoruku("Uspeh", "Izveštaj je sačuvan i termin je uspešno završen.");
      fetchSve();
    } catch (err) {
      prikaziPoruku("Greška", "Proverite da li je ID izveštaja u bazi postavljen na Auto-Increment (Identity).");
    }
  };

  
  const obrisiTermin = (id, tipAkcije) => {
    const naslov = tipAkcije === 'otkazi' ? "Otkazivanje" : "Brisanje";
    const poruka = tipAkcije === 'otkazi' 
      ? "Da li ste sigurni da želite da otkažete ovaj termin?" 
      : "Da li želite da obrišete ovaj termin iz istorije? (Biće obrisan i izveštaj)";

    prikaziPoruku(naslov, poruka, "confirm", async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        
        const termin = termini.find(t => (t.id || t.Id) === id);

       
        if (termin && termin.izvestaj) {
          const izvestajId = termin.izvestaj.id || termin.izvestaj.Id;
          await axios.delete(`http://localhost:5169/api/izvestaj/${izvestajId}`, config);
        }

        
        await axios.delete(`http://localhost:5169/api/termin/${id}`, config);
        
        fetchSve();
      } catch (err) {
        prikaziPoruku("Greška", "Nije moguće izvršiti brisanje svih povezanih podataka.");
      }
    });
  };
 

  const azurirajStatusUBazi = async (terminId, noviStatus) => {
    try {
      const config = { 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } 
      };
      await axios.put(`http://localhost:5169/api/termin/promeni-status/${terminId}`, `"${noviStatus}"`, config);
      fetchSve(); 
    } catch (err) {
      console.error("Greška status:", err);
    }
  };

  useEffect(() => {
    fetchSve();
  }, [userId]);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', padding: '120px 5% 60px' }}>
      
    
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '380px', textAlign: 'center' }}>
                <h3 style={{ color: paleta.zelenaGlavna }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666' }}>{statusModal.poruka}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                    {statusModal.tip === 'confirm' ? (
                        <>
                            <button onClick={() => { statusModal.akcija(); setStatusModal({...statusModal, show: false}); }} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer' }}>Da</button>
                            <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: '#eee', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>Ne</button>
                        </>
                    ) : (
                        <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer' }}>OK</button>
                    )}
                </div>
            </div>
        </div>
      )}

  
      {izvestajModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9998 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '500px' }}>
                <h2 style={{ color: paleta.zelenaGlavna }}>Kreiranje Izveštaja</h2>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Usluga: <b>{izvestajModal.termin?.usluga || izvestajModal.termin?.Usluga}</b></p>
                
                <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>Opis rada:</label>
                <textarea 
                    value={izvestajData.opis}
                    onChange={(e) => setIzvestajData({...izvestajData, opis: e.target.value})}
                    style={{ width: '100%', height: '100px', marginTop: '5px', padding: '10px', borderRadius: '8px', border: `1px solid ${paleta.siva}` }}
                />
                
                <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>Cena (RSD):</label>
                <input 
                    type="number"
                    value={izvestajData.cena}
                    onChange={(e) => setIzvestajData({...izvestajData, cena: e.target.value})}
                    style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '8px', border: `1px solid ${paleta.siva}` }}
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button onClick={sacuvajIzvestaj} style={{ flex: 1, background: paleta.statusZavrseno, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sačuvaj i Završi</button>
                    <button onClick={() => setIzvestajModal({show: false, termin: null})} style={{ flex: 1, background: '#eee', padding: '12px', borderRadius: '8px', cursor: 'pointer', border: 'none' }}>Odustani</button>
                </div>
            </div>
        </div>
      )}

  
      {pogledajIzvestajModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9998 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '450px' }}>
                <h2 style={{ color: paleta.zelenaGlavna }}>Detalji Izveštaja</h2>
                <div style={{ marginTop: '20px' }}>
                    <p><b>Opis zahvata:</b></p>
                    <p style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>{pogledajIzvestajModal.data?.opis || pogledajIzvestajModal.data?.Opis}</p>
                    <p style={{ marginTop: '15px' }}><b>Ukupna cena:</b> <span style={{ color: paleta.statusZavrseno, fontWeight: 'bold' }}>{pogledajIzvestajModal.data?.ukupnaCena || pogledajIzvestajModal.data?.UkupnaCena} RSD</span></p>
                </div>
                <button onClick={() => setPogledajIzvestajModal({show: false, data: null})} style={{ width: '100%', marginTop: '20px', background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>Zatvori</button>
            </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelenaGlavna, textAlign: 'center', marginBottom: '40px' }}>
          {role === 'stomatolog' ? 'Upravljanje Rezervacijama' : 'Moji Termini'}
        </h1>

        {loading ? <h3 style={{ textAlign: 'center' }}>Učitavanje...</h3> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {termini.map((t, index) => {
              const statusInfo = getStatusStil(t.status || t.Status);
              const tId = t.id || t.Id;
              const isUToku = statusInfo.tekst === 'U TOKU';
              const isCekanje = statusInfo.tekst === 'NA ČEKANJU';
              const isFinalan = statusInfo.tekst === 'ZAVRŠENO' || statusInfo.tekst === 'ODBIJENO';

              return (
                <div key={index} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: `10px solid ${statusInfo.boja}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ backgroundColor: statusInfo.boja, color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>{statusInfo.tekst}</div>
                    <h3 style={{ color: paleta.zelenaGlavna }}>{t.usluga || t.Usluga}</h3>
                    <p>{role === 'stomatolog' ? <b>Pacijent: {t.pacijent || t.Pacijent}</b> : <b>Stomatolog: {t.stomatolog || t.Stomatolog}</b>}</p>
                    
                    {role === 'stomatolog' && isCekanje && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                          <button onClick={() => azurirajStatusUBazi(tId, 'U toku')} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>Prihvati</button>
                          <button onClick={() => azurirajStatusUBazi(tId, 'Odbijeno')} style={{ background: 'white', color: paleta.crvena, border: `1px solid ${paleta.crvena}`, padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}>Odbij</button>
                        </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: paleta.zelenaGlavna }}>{t.vreme || t.Vreme}</div>
                        <div style={{ color: paleta.siva }}>{t.datum || t.Datum}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      {role === 'stomatolog' && isUToku && (
                        <button onClick={() => pripremiIzvestaj(t)} style={{ background: paleta.statusZavrseno, color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Završi</button>
                      )}

                   
                      {t.izvestaj && (
                        <button onClick={() => setPogledajIzvestajModal({ show: true, data: t.izvestaj })} style={{ background: paleta.zlato, border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Pregled izveštaja</button>
                      )}

                      {isCekanje && <button onClick={() => obrisiTermin(tId, 'otkazi')} style={{ background: 'none', color: paleta.crvena, border: `1px solid ${paleta.crvena}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Otkaži</button>}
                      {isFinalan && <button onClick={() => obrisiTermin(tId, 'obrisi')} style={{ background: paleta.crvena, color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer' }}>Obriši</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MojeRezervacije;
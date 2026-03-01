import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MojeRezervacije = () => {
  const [termini, setTermini] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const fetchTermini = async () => {
    if (!userId || userId === "undefined" || userId === "null") {
      setLoading(false);
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = role === 'stomatolog' 
        ? `http://localhost:5169/api/termin/stomatolog/${userId}`
        : `http://localhost:5169/api/termin/pacijent/${userId}`;

      const res = await axios.get(endpoint, config);
      setTermini(res.data || []);
    } catch (err) {
      console.error("Greška API-ja:", err);
    } finally {
      setLoading(false);
    }
  };

  const obrisiTermin = (id, tipAkcije) => {
    const naslov = tipAkcije === 'otkazi' ? "Otkazivanje" : "Brisanje";
    const poruka = tipAkcije === 'otkazi' 
      ? "Da li ste sigurni da želite da otkažete ovaj termin?" 
      : "Da li želite da obrišete ovaj termin iz istorije?";

    prikaziPoruku(naslov, poruka, "confirm", async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5169/api/termin/${id}`, config);
        fetchTermini();
      } catch (err) {
        prikaziPoruku("Greška", "Nije moguće izvršiti brisanje.");
      }
    });
  };

  const azurirajStatusUBazi = async (terminId, noviStatus) => {
    try {
      const config = { 
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } 
      };
      // Šaljemo status kao string u body-ju jer API verovatno očekuje plain string sa navodnicima
      await axios.put(`http://localhost:5169/api/termin/promeni-status/${terminId}`, `"${noviStatus}"`, config);
      fetchTermini(); 
    } catch (err) {
      prikaziPoruku("Greška", "Greška pri ažuriranju statusa.");
    }
  };

  useEffect(() => {
    fetchTermini();
  }, [userId]);

  return (
    <div style={{ backgroundColor: paleta.pozadina, minHeight: '100vh', padding: '120px 5% 60px' }}>
      
      {statusModal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '380px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: paleta.zelenaGlavna, marginBottom: '15px' }}>{statusModal.naslov}</h3>
                <p style={{ color: '#666', marginBottom: '25px' }}>{statusModal.poruka}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {statusModal.tip === 'confirm' ? (
                        <>
                            <button onClick={() => { statusModal.akcija(); setStatusModal({...statusModal, show: false}); }} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Da</button>
                            <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: '#eee', color: '#333', border: 'none', padding: '10px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Ne</button>
                        </>
                    ) : (
                        <button onClick={() => setStatusModal({...statusModal, show: false})} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '10px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>OK</button>
                    )}
                </div>
            </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ color: paleta.zelenaGlavna, textAlign: 'center', marginBottom: '40px' }}>
          {role === 'stomatolog' ? 'Upravljanje Rezervacijama' : 'Moji Termini'}
        </h1>

        {loading ? (
          <h3 style={{ textAlign: 'center' }}>Učitavanje...</h3>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {termini.length > 0 ? (
              termini.map((t, index) => {
                const statusInfo = getStatusStil(t.status || t.Status);
                const tId = t.id || t.Id;
                const isCekanje = statusInfo.tekst === 'NA ČEKANJU';
                const isUToku = statusInfo.tekst === 'U TOKU';
                const isFinalan = statusInfo.tekst === 'ZAVRŠENO' || statusInfo.tekst === 'ODBIJENO';

                return (
                  <div key={index} style={{ 
                    backgroundColor: 'white', padding: '25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: `10px solid ${statusInfo.boja}`, position: 'relative'
                  }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <div style={{ backgroundColor: statusInfo.boja, color: 'white', display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>
                        {statusInfo.tekst}
                      </div>
                      <h3 style={{ color: paleta.zelenaGlavna, marginBottom: '5px' }}>{t.usluga || t.Usluga}</h3>
                      <p style={{ margin: '5px 0', fontSize: '1rem' }}>
                        {role === 'stomatolog' ? <span><b>Pacijent:</b> {t.pacijent || t.Pacijent}</span> : <span><b>Stomatolog:</b> {t.stomatolog || t.Stomatolog}</span>}
                      </p>
                      <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>{t.opis || t.Opis}</p>

                      {role === 'stomatolog' && isCekanje && (
                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                          <button onClick={() => azurirajStatusUBazi(tId, 'U toku')} style={{ background: paleta.zelenaGlavna, color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Prihvati</button>
                          <button onClick={() => azurirajStatusUBazi(tId, 'Odbijeno')} style={{ background: 'white', color: paleta.crvena, border: `1px solid ${paleta.crvena}`, padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Odbij</button>
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: '140px' }}>
                      <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: paleta.zelenaGlavna }}>{t.vreme || t.Vreme}</div>
                        <div style={{ color: paleta.siva, fontWeight: '600' }}>{t.datum || t.Datum}</div>
                      </div>

                      <div style={{ marginTop: '15px' }}>
                        {/* NOVO DUGME ZA ZAVRŠETAK TERMINA - Samo za stomatologa kad je status U TOKU */}
                        {role === 'stomatolog' && isUToku && (
                          <button 
                            onClick={() => azurirajStatusUBazi(tId, 'Završeno')} 
                            style={{ background: paleta.statusZavrseno, color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                          >
                            Završi
                          </button>
                        )}

                        {isCekanje && (
                          <button onClick={() => obrisiTermin(tId, 'otkazi')} style={{ background: 'none', color: paleta.crvena, border: `1px solid ${paleta.crvena}`, padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Otkaži</button>
                        )}
                        {isFinalan && (
                          <button onClick={() => obrisiTermin(tId, 'obrisi')} style={{ background: paleta.crvena, color: 'white', border: 'none', padding: '7px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Obriši</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px' }}>
                <p style={{ fontSize: '1.1rem', color: '#888' }}>Trenutno nemate zakazanih termina.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MojeRezervacije;
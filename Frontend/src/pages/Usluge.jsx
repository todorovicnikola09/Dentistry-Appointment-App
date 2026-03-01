import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Usluge = () => {
    const [usluge, setUsluge] = useState([]);
    const [stomatolozi, setStomatolozi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUsluga, setSelectedUsluga] = useState(null);
    const [slobodnaVremena, setSlobodnaVremena] = useState([]);

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

    const dobijDanasnjiDatumBG = () => {
        const opcije = { timeZone: 'Europe/Belgrade', year: 'numeric', month: '2-digit', day: '2-digit' };
        const delovi = new Intl.DateTimeFormat('en-CA', opcije).formatToParts(new Date());
        const godina = delovi.find(d => d.type === 'year').value;
        const mesec = delovi.find(d => d.type === 'month').value;
        const dan = delovi.find(d => d.type === 'day').value;
        return `${godina}-${mesec}-${dan}`;
    };

    const danasnjiDatum = dobijDanasnjiDatumBG();
    const [formData, setFormData] = useState({ datum: danasnjiDatum, stomatologId: '', vreme: '' });
    const [adminFormData, setAdminFormData] = useState({ naziv: '', cena: '', opis: '' });
    const [editId, setEditId] = useState(null);

    const userRaw = localStorage.getItem('user');
    const ulogovaniKorisnik = userRaw ? JSON.parse(userRaw) : null; 
    
    const isAdmin = ulogovaniKorisnik?.Uloga === "Admin" || localStorage.getItem('role') === "Admin";
    const jeUlogovan = !!ulogovaniKorisnik || !!localStorage.getItem('userId');

    // --- TESTNE FUNKCIJE ---
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
            prikaziPoruku("Informacija", "Nema učitanih stomatologa!");
            return;
        }

        const randomStomatolog = stomatolozi[Math.floor(Math.random() * stomatolozi.length)];
        const sId = randomStomatolog.Id || randomStomatolog.id;
        
        let randomDan = new Date();
        randomDan.setDate(randomDan.getDate() + Math.floor(Math.random() * 10));
        if (randomDan.getDay() === 0) randomDan.setDate(randomDan.getDate() + 1);
        
        const izabraniDatumStr = randomDan.toLocaleDateString('en-CA');

        try {
            const url = `http://localhost:5169/api/Termin/slob_vremena?stomatologId=${sId}&datum=${izabraniDatumStr}`;
            const res = await axios.get(url);
            let vremena = res.data;

            const danUNedelji = randomDan.getDay();
            const sad = new Date();

            vremena = vremena.filter(v => {
                const [h, m] = v.split(':').map(Number);
                const uBuducnosti = izabraniDatumStr > danasnjiDatum || (h > sad.getHours() || (h === sad.getHours() && m > sad.getMinutes()));
                
                if (danUNedelji === 6) {
                    return uBuducnosti && h >= 10 && h < 15;
                }
                return uBuducnosti && h >= 9 && h < 20;
            });

            if (vremena.length > 0) {
                const nasumicnoVreme = vremena[Math.floor(Math.random() * vremena.length)];
                setSlobodnaVremena(vremena);
                setFormData({ stomatologId: sId, datum: izabraniDatumStr, vreme: nasumicnoVreme });
            } else {
                prikaziPoruku("Obaveštenje", "Nema slobodnih termina za ovaj nasumični datum, pokušajte ponovo.");
            }
        } catch (e) {
            console.error("Greška pri automatskom popunjavanju vremena:", e);
        }
    };
    // -----------------------

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
                prikaziPoruku("Uspeh", "Usluga je uspešno izmenjena!");
            } else {
                await axios.post('http://localhost:5169/api/Usluga', model);
                prikaziPoruku("Uspeh", "Nova usluga je uspešno dodata!");
            }
            setAdminFormData({ naziv: '', cena: '', opis: '' });
            setEditId(null);
            ucitajPodatke();
        } catch (err) {
            prikaziPoruku("Greška", "Došlo je do greške pri čuvanju usluge.");
        }
    };

    const obrisiUslugu = (id) => {
        prikaziPoruku(
            "Brisanje", 
            "Da li ste sigurni da želite da obrišete ovu uslugu?", 
            "confirm", 
            async () => {
                try {
                    await axios.delete(`http://localhost:5169/api/Usluga/${id}`);
                    prikaziPoruku("Obrisano", "Usluga je uspešno uklonjena.");
                    ucitajPodatke();
                } catch (err) {
                    prikaziPoruku("Greška", "Greška pri brisanju.");
                }
            }
        );
    };

    const pokreniIzmenu = (u) => {
        setEditId(u.id || u.Id);
        setAdminFormData({
            naziv: u.Naziv || u.naziv,
            cena: u.Cena || u.cena,
            opis: u.Opis || u.opis
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleVidiVremena = async () => {
        try {
            const izabraniDatum = new Date(formData.datum);
            const danUNedelji = izabraniDatum.getDay();

            if (danUNedelji === 0) {
                prikaziPoruku("Zatvoreno", "Klinika ne radi nedeljom.");
                setSlobodnaVremena([]);
                return;
            }

            const url = `http://localhost:5169/api/Termin/slob_vremena?stomatologId=${formData.stomatologId}&datum=${formData.datum}`;
            const res = await axios.get(url);
            let vremena = res.data;
            const sad = new Date();

            vremena = vremena.filter(v => {
                const [h, m] = v.split(':').map(Number);
                if (formData.datum === danasnjiDatum) {
                    if (h < sad.getHours() || (h === sad.getHours() && m <= sad.getMinutes())) return false;
                }
                return danUNedelji === 6 ? (h >= 10 && h < 15) : (h >= 9 && h < 20);
            });

            vremena.sort();
            setSlobodnaVremena(vremena);
            if (vremena.length === 0) prikaziPoruku("Status", "Nema slobodnih termina.");
        } catch (e) {
            prikaziPoruku("Greška", "Greška pri učitavanju termina.");
        }
    };

    const potvrdiRezervaciju = async () => {
        if (!jeUlogovan) {
            prikaziPoruku("Greška", "Morate biti prijavljeni da biste rezervisali termin.");
            return;
        }

        try {
            let cistoVreme = formData.vreme.replace(' h', '').trim();
            const deloviVremena = cistoVreme.split(':');
            if (deloviVremena.length === 2) cistoVreme += ":00";
            if (deloviVremena[0].length === 1) cistoVreme = "0" + cistoVreme;

            const pId = ulogovaniKorisnik?.Id || ulogovaniKorisnik?.id || localStorage.getItem('userId');

            const model = {
                Datum: formData.datum, 
                Vreme: cistoVreme,
                PacijentId: parseInt(pId),
                StomatologId: parseInt(formData.stomatologId),
                UslugaIds: [parseInt(selectedUsluga.Id || selectedUsluga.id)]
            };

            await axios.post('http://localhost:5169/api/Termin', model);
            
            setShowModal(false);
            prikaziPoruku("Rezervacija", "Uspešno ste zakazali termin!");
            setFormData({ datum: danasnjiDatum, stomatologId: '', vreme: '' });
            setSlobodnaVremena([]);
        } catch (e) {
            console.error("Greška pri slanju:", e.response?.data);
            const porukaSaServera = e.response?.data?.Poruka || "Došlo je do greške. Proverite da li ste ispravno ulogovani.";
            prikaziPoruku("Greška", porukaSaServera);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.5rem' }}>Učitavanje...</div>;

    return (
        <div style={{ backgroundColor: '#F4F2F3', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
            
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
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {usluge.map((u) => (
                        <div key={u.Id || u.id} style={{ backgroundColor: 'white', padding: '35px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                            {isAdmin && (
                                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => pokreniIzmenu(u)} style={{ background: '#4A5D50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}>Izmeni</button>
                                    <button onClick={() => obrisiUslugu(u.Id || u.id)} style={{ background: '#ff4d4d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}>Obriši</button>
                                </div>
                            )}
                            <div>
                                <h3 style={{ color: '#4A5D50', fontSize: '1.6rem', marginBottom: '15px' }}>{u.Naziv || u.naziv}</h3>
                                <p style={{ color: '#777', fontSize: '1rem', lineHeight: '1.5' }}>{u.Opis || u.opis}</p>
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <p style={{ color: '#D4A5BC', fontWeight: 'bold', fontSize: '1.4rem' }}>{u.Cena || u.cena} RSD</p>
                                <button 
                                    onClick={() => { 
                                        if(!jeUlogovan) {
                                            prikaziPoruku("Prijava", "Morate biti ulogovani da biste zakazali termin.");
                                            return;
                                        }
                                        setSelectedUsluga(u); 
                                        setShowModal(true); 
                                        setSlobodnaVremena([]); 
                                        setFormData({ datum: danasnjiDatum, stomatologId: '', vreme: '' }); 
                                    }}
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
                    <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
                        <h2 style={{ color: '#4A5D50', marginBottom: '10px' }}>Rezervacija</h2>
                        <button onClick={popuniTestniTermin} style={{ background: '#D4A5BC', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '15px', fontWeight: 'bold' }}>
                            Popuni test podatke
                        </button>
                        <p style={{ color: '#4A5D50', marginBottom: '20px', fontWeight: 'bold' }}>
                            Usluga: {selectedUsluga?.Naziv || selectedUsluga?.naziv}
                        </p>
                        
                        <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Stomatolog:</label>
                        <select style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #ddd' }} onChange={e => setFormData({...formData, stomatologId: e.target.value})} value={formData.stomatologId}>
                            <option value="">-- Izaberi --</option>
                            {stomatolozi.map(s => <option key={s.Id || s.id} value={s.Id || s.id}>dr {s.Ime || s.ime} {s.Prezime || s.prezime}</option>)}
                        </select>

                        <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Datum:</label>
                        <input 
                            type="date" 
                            min={danasnjiDatum} 
                            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box' }} 
                            onChange={e => { 
                                const selectedDate = new Date(e.target.value);
                                if(selectedDate.getDay() === 0) {
                                    prikaziPoruku("Neradan dan", "Nedelja je neradan dan!");
                                    setFormData({...formData, datum: danasnjiDatum});
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
                                <label style={{ display: 'block', textAlign: 'left', fontWeight: 'bold' }}>Izaberi vreme:</label>
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
        </div>
    );
};

export default Usluge;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { Globe, Shield, Users, Calendar } from 'lucide-react';

import mainHero from '../assets/homepage.png'; 
import hollywoodImg from '../assets/hollywood-smile.png';
import retainersImg from '../assets/retainers.png';

const Pocetna = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isUlogovan = token && token !== "undefined" && token !== "null";

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scale = Math.max(1, 1.1 - scrollY / 5000); 

  const paleta = {
    white: '#F4F2F3',
    purple: '#C0A9BD',
    blueGray: '#94A7AE',
    olive: '#64766A',
    text: '#1a2a3a'
  };

  const trebaPrikazatiDugme = !isUlogovan || role === 'Pacijent';

  return (
    <div style={{ 
      fontFamily: "'Playfair Display', serif", 
      color: paleta.text, 
      backgroundColor: '#fff', 
      overflowX: 'hidden', 
      width: '100vw',
      position: 'relative',
      boxSizing: 'border-box'
    }}>
      
      {/* HERO SEKCIJA */}
      <header style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '80px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${mainHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.1s ease-out',
          zIndex: 1
        }} />

        <div style={{ 
          position: 'relative',
          zIndex: 2,
          textAlign: 'center', 
          color: paleta.white, 
          padding: '0 20px',
          maxWidth: '1000px'
        }}>
          <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 4.8rem)', fontWeight: '700', marginBottom: '30px', lineHeight: '1.1' }}>
            Savršen osmeh je tvoj potpis.
          </h1>
          <p style={{ fontSize: '1.5rem', fontWeight: '300', margin: '0 auto', opacity: 0.95, lineHeight: '1.6' }}>
            Otkrijte moć digitalne stomatologije u službi vašeg zdravlja. Dizajniramo osmehe koji zrače samopouzdanjem.
          </p>
          
          {/* USLOVNI RENDER ZA DUGME */}
          {trebaPrikazatiDugme && (
            <button 
              onClick={() => navigate('/usluge')}
              style={{ 
                marginTop: '50px', padding: '20px 60px', backgroundColor: paleta.purple, 
                color: '#fff', border: 'none', borderRadius: '50px', fontWeight: '600', fontSize: '1.3rem', cursor: 'pointer',
                boxShadow: '0 15px 30px rgba(0,0,0,0.2)'
              }}
            >
              Naše usluge
            </button>
          )}
        </div>
      </header>

      {/* SADRŽAJ */}
      <div style={{ position: 'relative', zIndex: 10, backgroundColor: '#fff', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Hollywood Smile */}
        <section style={{ padding: '140px 10%', display: 'flex', alignItems: 'center', gap: '100px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span style={{ color: paleta.blueGray, fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1.1rem' }}>Estetika</span>
            <h2 style={{ fontSize: '4rem', margin: '25px 0', color: paleta.olive, lineHeight: '1' }}>Hollywood Smile</h2>
            <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.3rem', marginBottom: '40px' }}>
              Umetnost kreiranja harmonije lica. Uz najfinije keramičke vinire, postižemo idealan oblik, 
              boju i simetriju o kojoj ste oduvek sanjali. Svaki pacijent dobija personalizovan plan.
            </p>
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <img src={hollywoodImg} alt="Hollywood Smile" style={{ width: '100%', borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.18)' }} />
          </div>
        </section>

        {/* Nevidljive proteze */}
        <section style={{ padding: '140px 10%', display: 'flex', alignItems: 'center', gap: '100px', flexWrap: 'wrap', flexDirection: 'row-reverse', backgroundColor: paleta.white, boxSizing: 'border-box' }}>
          <div style={{ flex: '1 1 500px' }}>
            <span style={{ color: paleta.olive, fontWeight: '700', letterSpacing: '3px', textTransform: 'uppercase', fontSize: '1.1rem' }}>Ortodoncija</span>
            <h2 style={{ fontSize: '4rem', margin: '25px 0', color: paleta.text, lineHeight: '1' }}>Nevidljive proteze</h2>
            <p style={{ lineHeight: '1.8', color: '#444', fontSize: '1.3rem', marginBottom: '40px' }}>
              Ispravite zube diskretno. Naše providne folije (aligneri) su gotovo neprimetne, 
              udobne za nošenje i omogućavaju vam da se nesmetano smejete tokom celog procesa transformacije.
            </p>
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <img src={retainersImg} alt="Nevidljive proteze" style={{ width: '100%', borderRadius: '30px', boxShadow: '0 30px 60px rgba(0,0,0,0.18)' }} />
          </div>
        </section>

        <section style={{ padding: '150px 8%', textAlign: 'center', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '100px', color: paleta.text }}>Zašto odabrati Dentify?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px' }}>
            {[
              { icon: <Globe size={50} />, title: "Moderna oprema", desc: "Digitalni skeneri i najsavremeniji materijali." },
              { icon: <Users size={50} />, title: "Ekspertski tim", desc: "Specijalisti sa dugogodišnjim evropskim iskustvom." },
              { icon: <Shield size={50} />, title: "Bezbolan tretman", desc: "Vaš komfor nam je na prvom mestu, bez straha i bola." },
              { icon: <Calendar size={50} />, title: "Brzi termini", desc: "Efikasno zakazivanje bez dugog čekanja." }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ color: paleta.blueGray, marginBottom: '30px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h4 style={{ marginBottom: '20px', color: paleta.olive, fontSize: '1.6rem' }}>{item.title}</h4>
                <p style={{ color: '#666', fontSize: '1.2rem', lineHeight: '1.7' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div id="kontakt-sekcija">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Pocetna;
import React from 'react';
import { Instagram, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => (
  <footer style={{ backgroundColor: '#64766A', color: '#F4F2F3', padding: '80px 8% 40px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '60px' }}>
      <div>
        <h3 style={{ marginBottom: '20px', letterSpacing: '1px' }}>DENTIFY</h3>
        <p style={{ opacity: 0.9, lineHeight: '1.6' }}>Vaš osmeh je naša umetnost. Spoj vrhunske tehnologije i prirodne estetike u srcu Beograda.</p>
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
          <Instagram size={22} style={{ cursor: 'pointer' }} /> 
          <Facebook size={22} style={{ cursor: 'pointer' }} /> 
          <Youtube size={22} style={{ cursor: 'pointer' }} />
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: '20px', color: '#C0A9BD' }}>Kontakt</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><MapPin size={18} /> Beogradska 12, Beograd</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} /> +381 11 123 456</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={18} /> office@dentify.rs</span>
        </div>
      </div>
      <div>
        <h4 style={{ marginBottom: '20px', color: '#C0A9BD' }}>Radno vreme</h4>
        <p style={{ opacity: 0.9, lineHeight: '1.8' }}>Ponedeljak - Petak: 09:00 - 20:00<br/>Subota: 10:00 - 15:00<br/>Nedelja: Zatvoreno</p>
      </div>
    </div>
    <div style={{ borderTop: '1px solid rgba(244,242,243,0.1)', paddingTop: '20px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
      © 2026 Dentify. Sva prava zadržana.
    </div>
  </footer>
);

export default Footer;
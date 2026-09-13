import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { getSettings } from '../../services/api';
import './Contact.css';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  useEffect(() => { getSettings().then(res => setSettings(res.data.data)).catch(() => {}); }, []);

  return (
    <>
      <Helmet>
        <title>Contact — Luxurybyire</title>
        <meta name="description" content="Get in touch with Luxurybyire. Reach us on WhatsApp for the fastest response." />
      </Helmet>

      <div className="contact-page">
        <section className="contact-hero">
          <div className="container">
            <span className="section-eyebrow">Get in Touch</span>
            <h1 className="contact-hero__title">Contact Us</h1>
            <p className="contact-hero__subtitle">We'd love to hear from you. WhatsApp is the fastest way to reach us.</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="contact-grid">
              {/* WhatsApp CTA */}
              <div className="contact-primary">
                <div className="contact-wa-card">
                  <MessageCircle size={32} />
                  <h2>Chat on WhatsApp</h2>
                  <p>The quickest way to reach us. Get personalised recommendations, ask about products, or place an order.</p>
                  {settings?.whatsappNumber && (
                    <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg btn--full contact-wa-btn">
                      <MessageCircle size={18} /> Message Us on WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="contact-details">
                <h3>Other Ways to Reach Us</h3>
                <div className="contact-list">
                  {settings?.phone && (
                    <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="contact-item">
                      <Phone size={20} />
                      <div><strong>Phone</strong><span>{settings.phone}</span></div>
                    </a>
                  )}
                  {settings?.email && (
                    <a href={`mailto:${settings.email}`} className="contact-item">
                      <Mail size={20} />
                      <div><strong>Email</strong><span>{settings.email}</span></div>
                    </a>
                  )}
                  {settings?.address && (
                    <div className="contact-item">
                      <MapPin size={20} />
                      <div><strong>Address</strong><span>{settings.address}</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

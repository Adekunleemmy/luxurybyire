import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSettings } from '../../services/api';
import './Footer.css';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings()
      .then((res) => setSettings(res.data.data))
      .catch(() => {});
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner container">
        {/* Brand Column */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">Luxurybyire</Link>
          <p className="footer__tagline">
            Premium footwear for the modern individual. Quality, style, and confidence — delivered to your doorstep.
          </p>
          <div className="footer__social">
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer__links-group">
          <h4 className="footer__heading">Shop</h4>
          <nav aria-label="Shop links">
            <Link to="/shop" className="footer__link">All Products</Link>
            <Link to="/shop?category=sneakers" className="footer__link">Sneakers</Link>
            <Link to="/shop?category=casual" className="footer__link">Casual</Link>
            <Link to="/shop?category=formal" className="footer__link">Formal</Link>
            <Link to="/shop?category=sandals" className="footer__link">Sandals</Link>
            <Link to="/shop?category=boots" className="footer__link">Boots</Link>
          </nav>
        </div>

        {/* Company */}
        <div className="footer__links-group">
          <h4 className="footer__heading">Company</h4>
          <nav aria-label="Company links">
            <Link to="/contact" className="footer__link">Contact</Link>
            <Link to="/shop?isNewArrival=true" className="footer__link">New Arrivals</Link>
            <Link to="/shop?isSale=true" className="footer__link">Sale</Link>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="footer__links-group">
          <h4 className="footer__heading">Contact</h4>
          <div className="footer__contact-list">
            {settings?.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="footer__contact-item">
                <Phone size={14} />
                <span>{settings.phone}</span>
              </a>
            )}
            {settings?.email && (
              <a href={`mailto:${settings.email}`} className="footer__contact-item">
                <Mail size={14} />
                <span>{settings.email}</span>
              </a>
            )}
            {settings?.address && (
              <span className="footer__contact-item">
                <MapPin size={14} />
                <span>{settings.address}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {currentYear} Luxurybyire. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#privacy" className="footer__legal-link">Privacy Policy</a>
            <a href="#terms" className="footer__legal-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

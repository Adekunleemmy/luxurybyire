import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './NotFound.css';

export default function NotFound() {
  return (
    <>
      <Helmet><title>Page Not Found — Luxurybyire</title></Helmet>
      <div className="not-found page">
        <span className="not-found__code">404</span>
        <h1 className="not-found__title">Page Not Found</h1>
        <p className="not-found__message">The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary btn--lg">Go Home</Link>
          <Link to="/shop" className="btn btn--secondary btn--lg">Browse Shop</Link>
        </div>
      </div>
    </>
  );
}

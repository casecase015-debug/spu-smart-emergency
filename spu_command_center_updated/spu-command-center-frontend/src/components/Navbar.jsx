import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, LayoutDashboard, Menu, Settings, X } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => location.pathname === path;
  const isAdminActive = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><Activity size={22} /></span>
          <span className="logo-text">SPU Command Center</span>
        </Link>

        <button className="menu-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/transcripts"
              className={`nav-link ${isActive('/transcripts') ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <FileText size={18} />
              Transcripts
            </Link>
          </li>

          <li className="nav-item dropdown">
            <Link
              to="/admin"
              className={`nav-link dropdown-toggle ${isAdminActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} /> Admin
            </Link>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="/admin"
                  className={`dropdown-item ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/callsigns"
                  className={`dropdown-item ${isActive('/admin/callsigns') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Callsigns
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/events"
                  className={`dropdown-item ${isActive('/admin/events') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/incidents"
                  className={`dropdown-item ${isActive('/admin/incidents') ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Incidents
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

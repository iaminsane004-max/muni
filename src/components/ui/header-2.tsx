'use client';
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScroll } from '@/components/ui/use-scroll';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const scrolled = useScroll(10);

  const links = [
    { label: 'Overview', href: '/' },
    { label: 'Report Defect', href: '/register-complaint' },
    { label: 'Track Status', href: '/track-complaint' },
  ];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className={`site-header-root ${scrolled && !open ? 'site-header-scrolled' : ''}`}>
      <nav className="site-header-nav">
        {/* Left: CivicPulse Brand */}
        <Link to="/" className="site-brand-logo">
          <span className="site-brand-dot" />
          <span className="site-brand-text">CivicPulse</span>
        </Link>

        {/* Center: Desktop Nav Links */}
        <div className="site-desktop-links">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`site-nav-pill-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Desktop Action Buttons */}
        <div className="site-desktop-actions">
          <Link to="/admin" className="site-btn-signin">
            Sign In
          </Link>
          <Link to="/register-complaint" className="site-btn-cta">
            Report Defect
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="site-mobile-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <MenuToggleIcon open={open} className="size-5 text-zinc-900" duration={250} />
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="site-mobile-drawer">
          <div className="site-mobile-drawer-content">
            <div className="site-mobile-links-list">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`site-mobile-link-item ${location.pathname === link.href ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="site-mobile-actions-group">
              <Link to="/admin" className="site-btn-signin w-full text-center" onClick={() => setOpen(false)}>
                Admin Sign In
              </Link>
              <Link to="/register-complaint" className="site-btn-cta w-full text-center" onClick={() => setOpen(false)}>
                Report Defect
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

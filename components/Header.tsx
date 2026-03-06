import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import AuthButtons from './AuthButtons';
import GlobalSearch from './GlobalSearch';

const Header: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <>
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <a href="#/" onClick={(e) => handleNav(e, '#/')} aria-label="Go to homepage">
          <Logo className="h-12 w-12 text-pistachio-dark" />
        </a>
        <AuthButtons onSearchClick={() => setIsSearchOpen(true)} />
      </header>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
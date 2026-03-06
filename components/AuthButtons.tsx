


import React from 'react';
import { SearchIcon } from './icons/SearchIcon';

interface AuthButtonsProps {
  onSearchClick: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ onSearchClick }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(localStorage.getItem('isAuthenticated') === 'true');
  const [userRole, setUserRole] = React.useState(localStorage.getItem('userRole'));

  React.useEffect(() => {
    const handleStorageChange = () => {
        setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
        setUserRole(localStorage.getItem('userRole'));
    };
    
    window.addEventListener('storage_change', handleStorageChange);
    window.addEventListener('hashchange', handleStorageChange); // Also check on navigation
    
    return () => {
      window.removeEventListener('storage_change', handleStorageChange)
      window.removeEventListener('hashchange', handleStorageChange)
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserRole(null);
    window.dispatchEvent(new Event('storage_change'));
    window.location.hash = '#/login';
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };
  
  const searchButton = (
    <button onClick={onSearchClick} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors" aria-label="Search (Ctrl+K)">
      <SearchIcon className="w-5 h-5" />
    </button>
  );

  if (isAuthenticated) {
     if (userRole === 'admin') {
      return (
        <div className="hidden md:flex items-center gap-4">
          {searchButton}
           <div className="h-6 w-px bg-slate-200"></div>
          <a href="#/admin/dashboard" onClick={(e) => handleNav(e, '#/admin/dashboard')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Dashboard
          </a>
          <a href="#/schedule" onClick={(e) => handleNav(e, '#/schedule')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Schedule
          </a>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 text-sm font-semibold text-pistachio-dark bg-pistachio-DEFAULT rounded-full hover:bg-lime-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Log Out
          </button>
        </div>
      );
    }
     if (userRole === 'employee') {
      return (
        <div className="hidden md:flex items-center gap-4">
          {searchButton}
           <div className="h-6 w-px bg-slate-200"></div>
          <a href="#/employee/dashboard" onClick={(e) => handleNav(e, '#/employee/dashboard')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Dashboard
          </a>
          <a href="#/schedule" onClick={(e) => handleNav(e, '#/schedule')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Schedule
          </a>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 text-sm font-semibold text-pistachio-dark bg-pistachio-DEFAULT rounded-full hover:bg-lime-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Log Out
          </button>
        </div>
      );
    }
    if (userRole === 'prof') {
      return (
        <div className="hidden md:flex items-center gap-4">
          {searchButton}
           <div className="h-6 w-px bg-slate-200"></div>
          <a href="#/prof/dashboard" onClick={(e) => handleNav(e, '#/prof/dashboard')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Dashboard
          </a>
           <a href="#/schedule" onClick={(e) => handleNav(e, '#/schedule')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
            Schedule
          </a>
          <button 
            onClick={handleLogout}
            className="px-5 py-2 text-sm font-semibold text-pistachio-dark bg-pistachio-DEFAULT rounded-full hover:bg-lime-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Log Out
          </button>
        </div>
      );
    }
    return (
      <div className="hidden md:flex items-center gap-4">
        {searchButton}
         <div className="h-6 w-px bg-slate-200"></div>
        <a href="#/dashboard" onClick={(e) => handleNav(e, '#/dashboard')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
          Dashboard
        </a>
        <a href="#/my-courses" onClick={(e) => handleNav(e, '#/my-courses')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
          My Enrollments
        </a>
        <a href="#/monthly-payments" onClick={(e) => handleNav(e, '#/monthly-payments')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
          Monthly Payments
        </a>
         <a href="#/schedule" onClick={(e) => handleNav(e, '#/schedule')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
          Schedule
        </a>
        <a href="#/profile" onClick={(e) => handleNav(e, '#/profile')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
          Profile
        </a>
        <button 
          onClick={handleLogout}
          className="px-5 py-2 text-sm font-semibold text-pistachio-dark bg-pistachio-DEFAULT rounded-full hover:bg-lime-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-4">
      {searchButton}
       <div className="h-6 w-px bg-slate-200"></div>
      <a href="#/login" onClick={(e) => handleNav(e, '#/login')} className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-300">
        Log In
      </a>
      <a href="#/signup" onClick={(e) => handleNav(e, '#/signup')} className="px-5 py-2 text-sm font-semibold text-pistachio-dark bg-pistachio-DEFAULT rounded-full hover:bg-lime-500 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
        Sign Up
      </a>
    </div>
  );
};

export default AuthButtons;
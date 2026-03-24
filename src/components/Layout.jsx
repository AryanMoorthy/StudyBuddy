import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  MdDashboard, 
  MdMenuBook, 
  MdAssignment, 
  MdHistory, 
  MdAutoAwesome,
  MdSchool,
  MdMenu,
  MdClose
} from 'react-icons/md';

const links = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/subjects', icon: <MdMenuBook />, label: 'Subjects' },
  { to: '/tasks', icon: <MdAssignment />, label: 'Tasks' },
  { to: '/revision', icon: <MdHistory />, label: 'Revision' },
  { to: '/ai-tools', icon: <MdAutoAwesome />, label: 'AI Assistant' },
];

const Sidebar = ({ isOpen, onClose }) => (
  <div className={`sidebar ${isOpen ? 'open' : ''}`}>
    <div className="sidebar-header">
      <div className="logo">
        <MdSchool size={28} />
        <span>StudyBuddy</span>
      </div>
      <button className="mobile-close" onClick={onClose}><MdClose /></button>
    </div>
    <nav className="nav-links">
      {links.map((link) => (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => window.innerWidth < 1024 && onClose()}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('Toggling sidebar:', !isSidebarOpen);
    setIsSidebarOpen(prev => !prev);
  }

  return (
    <div className="app-container">
      <header className="mobile-header">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MdMenu />
        </button>
        <div className="logo">
          <MdSchool size={24} />
          <span>StudyBuddy</span>
        </div>
      </header>

      <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

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
  { to: '/ai-tools', icon: <MdAutoAwesome />, label: 'AI' },
];

const Sidebar = () => (
  <div className="sidebar">
    <div className="logo">
      <MdSchool size={28} />
      <span>StudyBuddy</span>
    </div>
    <nav className="nav-links">
      {links.map((link) => (
        <NavLink 
          key={link.to} 
          to={link.to} 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  </div>
);

const BottomNav = () => (
  <nav className="bottom-nav">
    {links.map((link) => (
      <NavLink 
        key={link.to} 
        to={link.to} 
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">{link.icon}</span>
        <span className="bottom-nav-label">{link.label}</span>
      </NavLink>
    ))}
  </nav>
);

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;

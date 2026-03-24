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

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

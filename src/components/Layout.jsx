import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFocus, PLAYLISTS } from '../context/FocusContext';
import ThemeToggle from './ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calendar,
  Sparkles,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Timer,
  Play,
  Pause,
  Music2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/subjects', label: 'Subjects', icon: BookOpen },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/revision', label: 'Revision', icon: Calendar },
    { path: '/ai-tools', label: 'AI Tools', icon: Sparkles },
    { path: '/focus', label: 'Focus Mode', icon: Timer },
  ];

  const {
    isMusicPlaying,
    toggleMusic,
    isRunning,
    timeLeft,
    mode,
    currentPlaylist,
    MODES,
  } = useFocus();

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const showMiniPlayer = isMusicPlaying || isRunning;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-primary w-8 h-8" />
          <span className="font-bold text-xl tracking-tight">StudyBuddy</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-border bg-card">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10 group cursor-default">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-premium transition-transform group-hover:scale-105">
                <GraduationCap className="text-primary-foreground w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tight uppercase text-foreground">StudyBuddy</span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-premium' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-8 space-y-4">
            {/* ── Persistent Mini-Player ──────────────────────────────── */}
            <AnimatePresence>
              {showMiniPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mb-2"
                >
                  <NavLink
                    to="/focus"
                    className="block p-4 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Music2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                          {PLAYLISTS[currentPlaylist]?.name || 'Study Music'}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); toggleMusic(); }}
                        className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 transition-all"
                      >
                        {isMusicPlaying
                          ? <Pause className="w-2.5 h-2.5" />
                          : <Play  className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                    {isRunning && MODES && (
                      <div className="flex items-center gap-1.5">
                        <Timer className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[9px] font-bold text-muted-foreground">
                          🍅 {formatTime(timeLeft)} remaining
                        </span>
                      </div>
                    )}
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 w-full px-1 py-1">
              <ThemeToggle floating={false} />
              <span className="text-muted-foreground font-bold text-sm">Theme Settings</span>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-xs font-black text-primary border border-primary/20">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-foreground truncate">{user?.email?.split('@')[0]}</span>
                  <span className="text-[10px] text-muted-foreground font-bold truncate uppercase tracking-wider">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-destructive border border-destructive/20 bg-destructive/5 hover:bg-destructive hover:text-destructive-foreground rounded-xl transition-all font-black text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              />
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-80 bg-background z-[70] lg:hidden p-6 flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-primary w-8 h-8" />
                    <span className="font-black text-xl tracking-tight uppercase text-foreground">StudyBuddy</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-muted rounded-xl">
                    <X className="w-6 h-6 text-foreground" />
                  </button>
                </div>

                <nav className="space-y-1.5 flex-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-4 py-4 rounded-2xl transition-all
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-premium' 
                          : 'text-muted-foreground hover:bg-muted'}
                      `}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="font-bold text-lg">{item.label}</span>
                    </NavLink>
                  ))}
                  <div className="flex items-center gap-4 w-full px-4 py-4">
                    <ThemeToggle floating={false} />
                    <span className="text-muted-foreground font-bold text-lg">Appearance</span>
                  </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-border">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full px-4 py-4 text-destructive font-black uppercase tracking-widest text-sm"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 w-full relative min-h-screen">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

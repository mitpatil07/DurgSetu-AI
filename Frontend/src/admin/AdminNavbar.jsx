import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, Home, FileText, BarChart2, Users, User,
    RefreshCw, ChevronDown,
    Settings, LogOut, Menu, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
    { icon: BarChart2, label: 'Analytics', path: '/stage1' },
    { icon: Users, label: 'Users', path: '/users' },
];

const AdminNavbar = ({ onRefresh, pendingCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout } = useAuth();

    const adminName = localStorage.getItem('username') || 'Admin';
    const activePath = location.pathname;

    return (
        <div className="sticky top-0 z-40">
            {/* Primary Bar */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-3">

                        {/* Brand */}
                        <div className="flex items-center gap-2.5 flex-shrink-0 mr-4 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                            <div className="relative w-9 h-9">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-md shadow-orange-200" />
                                <Shield className="absolute inset-0 m-auto w-[18px] h-[18px] text-white" />
                            </div>
                            <div className="hidden sm:block leading-tight">
                                <p className="text-[13px] font-extrabold text-slate-900 tracking-tight">DurgSetu</p>
                                <p className="text-[10px] text-slate-400 font-semibold tracking-wide">Admin Portal</p>
                            </div>
                        </div>

                        <span className="hidden md:block h-6 w-px bg-slate-200 flex-shrink-0" />

                        {/* Nav links — desktop */}
                        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
                            {NAV_LINKS.map(({ icon: Icon, label, path }) => {
                                const active = activePath === path ||
                                    (path === '/admin/dashboard' && (activePath === '/admin' || activePath === '/admin/dashboard')) ||
                                    (path === '/admin/reports' && (activePath === '/admin/reports' || activePath === '/reports')) ||
                                    (path === '/stage1' && (activePath === '/stage1' || activePath === '/analytics'));
                                return (
                                    <button
                                        key={label}
                                        onClick={() => navigate(path)}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer
                                            ${active
                                                ? 'text-orange-600 bg-orange-50'
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                        {active && (
                                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-orange-500 rounded-full" />
                                        )}
                                        {label === 'Reports' && pendingCount > 0 && (
                                            <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
                                                {pendingCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Mobile Spacer */}
                        <div className="flex-1 md:hidden" />

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {onRefresh && (
                                <button
                                    onClick={onRefresh}
                                    className="p-2 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all cursor-pointer"
                                    title="Refresh Data"
                                >
                                    <RefreshCw className="w-4.5 h-4.5" />
                                </button>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border transition-all cursor-pointer
                                        ${profileOpen
                                            ? 'bg-orange-50 border-orange-200'
                                            : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300'}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
                                        <span className="text-white font-extrabold text-xs">{adminName[0].toUpperCase()}</span>
                                    </div>
                                    <div className="hidden sm:block text-left leading-tight">
                                        <p className="text-[11px] font-bold text-slate-800">{adminName}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">Administrator</p>
                                    </div>
                                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-300/50 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                                            {/* Dropdown Header */}
                                            <div className="px-6 py-5 bg-gradient-to-br from-orange-50 to-amber-50 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -mr-12 -mt-12 blur-2xl" />
                                                <div className="flex items-center gap-4 relative z-10">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                                        <span className="text-white font-black text-sm">{adminName[0].toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1 uppercase tracking-tight">{adminName}</p>
                                                        <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest bg-orange-100/50 px-2 py-0.5 rounded-full inline-block">Administrator</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dropdown Actions */}
                                            <div className="p-3 space-y-1 bg-white">
                                                <button
                                                    onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                                                    className="w-full flex items-center justify-between px-4 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer group"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <User className="w-4 h-4 text-slate-400 group-hover:text-orange-500" /> Profile View
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                                                    className="w-full flex items-center justify-between px-4 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer group"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Settings className="w-4 h-4 text-slate-400 group-hover:text-orange-500" /> Settings
                                                    </span>
                                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                                </button>
                                                <div className="h-px bg-slate-50 my-2 mx-4" />
                                                <button
                                                    onClick={() => { logout(); navigate('/login'); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                                >
                                                    <LogOut className="w-4 h-4" /> Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                        {NAV_LINKS.map(({ icon: Icon, label, path }) => {
                            const active = activePath === path;
                            return (
                                <button
                                    key={label}
                                    onClick={() => { navigate(path); setMobileOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer
                                        ${active ? 'bg-orange-50 text-orange-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </header>
        </div>
    );
};

export default AdminNavbar;

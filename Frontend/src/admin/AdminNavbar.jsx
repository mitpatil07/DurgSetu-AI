import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, Home, FileText, BarChart2, Users,
    Search, RefreshCw, Bell, ChevronDown,
    Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const NAV_LINKS = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Users, label: 'Users', path: '/users' },
];

const AdminNavbar = ({ onRefresh, pendingCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const adminName = localStorage.getItem('username') || 'Admin';
    const activePath = location.pathname;

    return (
        <div className="sticky top-0 z-40">
            {/* Primary Bar */}
            <header className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center h-16 gap-3">

                        {/* Brand */}
                        <div className="flex items-center gap-2.5 flex-shrink-0 mr-4 cursor-pointer" onClick={() => navigate('/admin')}>
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
                                const active = path === activePath || (path === '/admin' && activePath === '/stage1') || (path === '/analytics' && activePath === '/stage2');
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
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/60 z-50 overflow-hidden">
                                            <div className="px-4 py-3 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100/80">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                                                        <span className="text-white font-extrabold text-xs">{adminName[0].toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-extrabold text-slate-900 leading-none">{adminName}</p>
                                                        <p className="text-[10px] text-orange-600 font-semibold mt-1">Administrator</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-2 space-y-0.5">
                                                <button
                                                    onClick={() => { navigate('/profile'); setProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                                                >
                                                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" /> Profile View
                                                </button>
                                                <button
                                                    onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                                                >
                                                    <Settings className="w-4 h-4 text-slate-400" /> Settings
                                                </button>
                                                <div className="h-px bg-slate-100 my-1 mx-2" />
                                                <button
                                                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer"
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
                            const active = path === activePath;
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

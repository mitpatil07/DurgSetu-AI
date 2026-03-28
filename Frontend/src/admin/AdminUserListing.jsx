import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, User, Search, Filter,
    MoreVertical, Mail, Phone, Calendar,
    CheckCircle, XCircle, ChevronRight, Home,
    FileText, BarChart2, Bell, Settings, LogOut, Menu
} from 'lucide-react';

/* ─── Design Tokens ───────────────────────────────── */
const FONT = "'DM Sans', 'Inter', system-ui, sans-serif";

const ROLE_BADGE = {
    'ADMIN': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: Shield },
    'CITIZEN': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: User },
};

const NAV_LINKS = [
    { icon: Home, label: 'Dashboard', path: '/admin' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    { icon: Users, label: 'Users', path: '/users' },
];

/* ─── Components ───────────────────────────────────── */

const Badge = ({ role }) => {
    const config = ROLE_BADGE[role] || ROLE_BADGE['CITIZEN'];
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
            <Icon className="w-3 h-3" />
            {role}
        </span>
    );
};

const UserCard = ({ user }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                    {user.username[0]?.toUpperCase()}
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">{user.username}</h3>
                    <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                </div>
            </div>
            <Badge role={user.role} />
        </div>

        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Mail className="w-3.5 h-3.5" /> {user.email || 'No email'}
            </div>
            {user.phone && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                </div>
            )}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.date_joined || Date.now()).toLocaleDateString()}
            </div>
        </div>

        <button className="w-full py-2.5 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 rounded-xl text-xs font-bold transition-all border border-slate-100 hover:border-orange-100 flex items-center justify-center gap-2">
            View Activity <ChevronRight className="w-3.5 h-3.5" />
        </button>
    </div>
);

/* ─── Main Component ───────────────────────────────── */

export default function AdminUserListing() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const adminName = localStorage.getItem('username') || 'Admin';

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                // We'll use a generic endpoint or separate ones
                const response = await fetch('http://localhost:8000/api/profile/all/', {
                    headers: { 'Authorization': `Token ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                }
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'ALL' || u.role === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ fontFamily: FONT }} className="min-h-screen bg-[#F8F9FB]">

            {/* Header / Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
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

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-4">
                            {NAV_LINKS.map(link => (
                                <button
                                    key={link.label}
                                    onClick={() => navigate(link.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${link.path === '/users' ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex-1 md:hidden" />

                        {/* Profile/Actions */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 cursor-pointer overflow-hidden border-2 border-transparent hover:border-orange-200 transition-all"
                                >
                                    <span className="font-bold">{adminName[0].toUpperCase()}</span>
                                </button>
                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                                        <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-all">
                                            <Settings className="w-4 h-4" /> Settings
                                        </button>
                                        <div className="h-px bg-slate-100 my-1 mx-2" />
                                        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-500">
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2">
                        {NAV_LINKS.map(link => (
                            <button key={link.label} onClick={() => navigate(link.path)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${link.path === '/users' ? 'bg-orange-50 text-orange-600' : 'text-slate-500'}`}>
                                <link.icon className="w-5 h-5" /> {link.label}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage Citizens and Administrative accounts.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full sm:w-64 outline-none"
                            />
                        </div>
                        <div className="flex bg-white border border-slate-200 rounded-2xl p-1">
                            {['ALL', 'ADMIN', 'CITIZEN'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${filter === f ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-bold">Synchronizing User Data...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">No users found</h3>
                        <p className="text-slate-400 mt-1">Try adjusting your search or filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

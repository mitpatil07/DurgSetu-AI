import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Lock, Save, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import AdminNavbar from './AdminNavbar';

const AdminSettings = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone: '',
        role: ''
    });
    const [passwords, setPasswords] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('profile'); // 'profile' or 'password'

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8000/api/profile/', {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8000/api/profile/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: profile.email,
                    phone: profile.phone
                })
            });
            if (res.ok) {
                alert('Profile updated successfully!');
            }
        } catch (err) {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8000/api/change-password/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: passwords.old_password,
                    new_password: passwords.new_password
                })
            });
            if (res.ok) {
                alert('Password changed successfully!');
                setPasswords({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Password change failed');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <AdminNavbar onRefresh={fetchProfile} />

            {/* Breadcrumb Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Settings className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                            <p className="text-sm font-medium text-slate-500">Configure your administrative environment.</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Nav */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'profile' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <User className="w-4 h-4" /> My Profile
                        </button>
                        <button
                            onClick={() => setTab('password')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'password' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Lock className="w-4 h-4" /> Security
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-6">

                        {tab === 'profile' ? (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h2 className="text-2xl font-black text-slate-800 mb-6">Profile Information</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
                                            <div className="relative">
                                                <input type="text" value={profile.username} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Admin Role</label>
                                            <div className="relative">
                                                <input type="text" value={profile.role} disabled className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-orange-600 cursor-not-allowed" />
                                                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                                            <input
                                                type="text"
                                                value={profile.phone || ''}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile Changes
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h2 className="text-2xl font-black text-slate-800 mb-6">Security Settings</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={passwords.old_password}
                                            onChange={e => setPasswords({ ...passwords, old_password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.new_password}
                                            onChange={e => setPasswords({ ...passwords, new_password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwords.confirm_password}
                                            onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-100 active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Additional Info Section */}
                        <div className="bg-orange-50/50 rounded-3xl border border-orange-100 p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-orange-900">Need help?</h3>
                                <p className="text-sm text-orange-600 font-medium">Contact system security for role escalations or permission audits.</p>
                            </div>
                            <button className="px-5 py-2.5 bg-white border border-orange-200 text-orange-700 rounded-xl font-bold text-sm hover:shadow-md transition-all">
                                Support Docs
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminSettings;

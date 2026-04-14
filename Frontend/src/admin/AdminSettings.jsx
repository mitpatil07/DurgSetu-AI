import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Save, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import { successToast, errorToast } from '../services/swal';

const AdminSettings = () => {
    const [profile, setProfile] = useState({ username: '', email: '', phone: '', role: '' });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('profile');

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://127.0.0.1:8000/api/profile/', {
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
            const res = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: profile.email, phone: profile.phone })
            });
            if (res.ok) {
                successToast('Profile Updated', 'Your profile changes have been saved.');
            } else {
                errorToast('Update Failed', 'Could not save profile. Please try again.');
            }
        } catch {
            errorToast('Error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            errorToast('Password Mismatch', 'New passwords do not match.');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await fetch('http://127.0.0.1:8000/api/change-password/', {
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
                successToast('Password Changed', 'Your password has been updated successfully.');
                setPasswords({ old_password: '', new_password: '', confirm_password: '' });
            } else {
                const data = await res.json();
                errorToast('Change Failed', data.error || 'Password change failed');
            }
        } catch {
            errorToast('Error', 'Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <AdminNavbar onRefresh={fetchProfile} />

            {/* Breadcrumb Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
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

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Nav */}
                    <div className="space-y-2">
                        <button
                            onClick={() => setTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer
                                ${tab === 'profile'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
                        >
                            <User className="w-4 h-4" /> My Profile
                        </button>
                        <button
                            onClick={() => setTab('password')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer
                                ${tab === 'password'
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'}`}
                        >
                            <Lock className="w-4 h-4" /> Security
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-6">

                        {tab === 'profile' ? (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h2 className="text-xl font-black text-slate-800 mb-6">Profile Information</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Username</label>
                                            <div className="relative">
                                                <input type="text" value={profile.username} disabled
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-400 cursor-not-allowed" />
                                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Admin Role</label>
                                            <div className="relative">
                                                <input type="text" value={profile.role} disabled
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-orange-600 cursor-not-allowed" />
                                                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                                            <input type="email" value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
                                            <input type="text" value={profile.phone || ''}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={saving}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Profile Changes
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                                <h2 className="text-xl font-black text-slate-800 mb-6">Security Settings</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                                    {[
                                        { label: 'Current Password', key: 'old_password' },
                                        { label: 'New Password', key: 'new_password' },
                                        { label: 'Confirm New Password', key: 'confirm_password' },
                                    ].map(({ label, key }) => (
                                        <div key={key} className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label>
                                            <input type="password" value={passwords[key]}
                                                onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
                                        </div>
                                    ))}
                                    <button type="submit" disabled={saving}
                                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Help Section */}
                        <div className="bg-orange-50/60 rounded-3xl border border-orange-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-bold text-orange-900">Need help?</h3>
                                <p className="text-sm text-orange-600 font-medium mt-1">Contact system security for role escalations or permission audits.</p>
                            </div>
                            <button className="px-5 py-2.5 bg-white border border-orange-200 text-orange-700 rounded-xl font-bold text-sm hover:shadow-md hover:border-orange-300 transition-all flex-shrink-0 cursor-pointer">
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

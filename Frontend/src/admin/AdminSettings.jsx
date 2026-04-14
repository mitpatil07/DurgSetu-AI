import React, { useState, useEffect } from 'react';
import { Settings, User, Lock, Save, RefreshCw, Shield, ShieldCheck } from 'lucide-react';
import AdminNavbar from './AdminNavbar';
import { successToast, errorToast } from '../services/swal';
import { apiFetch } from '../api';

const AdminSettings = () => {
    const [profile, setProfile] = useState({ username: '', email: '', phone: '', role: '' });
    const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('profile');

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await apiFetch('/profile/');
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
            const res = await apiFetch('/profile/update_profile/', {
                method: 'PATCH',
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
            const res = await apiFetch('/change-password/', {
                method: 'POST',
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

            {/* page header */}
            <div className="bg-white border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative z-10 transition-all">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-orange-500/30 transform hover:rotate-3 transition-transform">
                            <Settings className="w-10 h-10 text-white" />
                        </div>
                        <div className="pt-2">
                            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Account Settings</h1>
                            <p className="text-slate-500 font-bold text-sm tracking-wide">CONFIGURE YOUR ADMINISTRATIVE PREFERENCES & SECURITY</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Sidebar Nav */}
                    <div className="space-y-4">
                        {[
                            { id: 'profile', icon: User, label: 'My Profile' },
                            { id: 'password', icon: Lock, label: 'Security' }
                        ].map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all cursor-pointer border-2
                                    ${tab === id
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/30 -translate-y-1'
                                        : 'bg-white text-slate-500 border-slate-100 hover:border-orange-200 hover:text-orange-500 shadow-sm'}`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3 space-y-6">

                        {tab === 'profile' ? (
                            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10 transition-all hover:bg-white active:scale-[0.99]">
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-orange-500 rounded-full" /> Profile Information
                                </h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                            <div className="relative group">
                                                <input type="text" value={profile.username} disabled
                                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-400 cursor-not-allowed uppercase tracking-tight" />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Role</label>
                                            <div className="relative group">
                                                <input type="text" value={profile.role} disabled
                                                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black text-orange-600/60 cursor-not-allowed uppercase tracking-wide" />
                                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <input type="email" value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                                placeholder="Enter admin email..."
                                                className="w-full px-5 py-4 bg-slate-50/30 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <input type="text" value={profile.phone || ''}
                                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                                placeholder="+91 XXXXX XXXXX"
                                                className="w-full px-5 py-4 bg-slate-50/30 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all placeholder:text-slate-300" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4 border-t border-slate-50">
                                        <button type="submit" disabled={saving}
                                            className="inline-flex items-center gap-3 px-10 py-4 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-slate-200/50 hover:shadow-orange-500/30 hover:-translate-y-1 active:scale-95 disabled:opacity-50 cursor-pointer"
                                        >
                                            {saving ? <RefreshCw className="w-4 h-4 animate-spin text-orange-400" /> : <Save className="w-4 h-4" />}
                                            Commit Changes
                                        </button>
                                    </div>
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

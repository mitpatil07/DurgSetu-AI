import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCircle, ChevronRight, Landmark } from 'lucide-react';

const RoleSelect = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side — same orange theme as Login */}
                <div className="md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-3 mb-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-10 md:mb-0">
                        <h2 className="text-4xl font-bold leading-tight mb-4">
                            Preserving Heritage with <span className="text-orange-200">Intelligence.</span>
                        </h2>
                        <p className="text-orange-100 text-lg leading-relaxed mb-8">
                            Select your role to continue. Users can submit damage reports, admins can manage them.
                        </p>
                        <div className="bg-black/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                            <p className="text-sm font-medium text-orange-50 italic">
                                "Forts are the foundation of the kingdom" <br />- Chhatrapati Shivaji Maharaj
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 text-sm font-medium text-orange-200/80 mt-8 md:mt-0">
                        © 2026 DurgSetu AI
                    </div>
                </div>

                {/* Right Side — Role Cards */}
                <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome</h2>
                            <p className="text-slate-500 font-medium">Choose how you want to access the platform.</p>
                        </div>

                        <div className="space-y-4">
                            {/* User Card */}
                            <button
                                onClick={() => navigate('/user/login')}
                                className="w-full group text-left p-6 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-400 rounded-2xl transition-all duration-200 flex items-center gap-5 cursor-pointer"
                            >
                                <div className="bg-orange-100 group-hover:bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                                    <UserCircle className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-200" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-lg">Login as User</p>
                                    <p className="text-slate-500 text-sm mt-0.5">Submit damage reports and track repair status</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                            </button>

                            {/* Admin Card */}
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="w-full group text-left p-6 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-400 rounded-2xl transition-all duration-200 flex items-center gap-5 cursor-pointer"
                            >
                                <div className="bg-orange-100 group-hover:bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                                    <Landmark className="w-7 h-7 text-orange-500 group-hover:text-white transition-colors duration-200" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-lg">Login as Admin</p>
                                    <p className="text-slate-500 text-sm mt-0.5">Manage reports, run AI analysis, upload repairs</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                            </button>
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors text-sm">
                                Return to Landing Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelect;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCircle, Landmark } from 'lucide-react';

const RoleSelect = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

                {/* Brand Side */}
                <div className="w-full md:w-5/12 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />

                    <div className="relative z-10 flex items-center gap-3 mb-4 sm:mb-10">
                        <div className="bg-white/20 p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">DurgSetu AI</h1>
                    </div>

                    <div className="relative z-10 mb-4 md:mb-0">
                        <h2 className="text-2xl sm:text-4xl font-bold leading-tight mb-2 sm:mb-4">
                            Preserving Heritage with <span className="text-orange-200">Intelligence.</span>
                        </h2>
                        <div className="bg-black/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-white/10">
                            <p className="text-[10px] sm:text-sm font-medium text-orange-50 italic">
                                "Forts are the foundation of the kingdom" <br className="hidden sm:block" />- Chhatrapati Shivaji Maharaj
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 text-[10px] sm:text-sm font-medium text-orange-200/80 mt-2 md:mt-0">
                        © 2026 DurgSetu AI
                    </div>
                </div>

                {/* Right Side — Role Cards */}
                <div className="md:w-7/12 p-8 sm:p-14 flex flex-col justify-center bg-white">
                    <div className="max-w-md w-full mx-auto">
                        <div className="mb-6 sm:mb-10 text-center md:text-left">
                            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">Welcome</h2>
                            <p className="text-slate-500 text-xs sm:text-lg sm:font-medium">Choose your focus area</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                            {/* User Card */}
                            <button
                                onClick={() => navigate('/user/login')}
                                className="group p-4 sm:p-8 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-400 rounded-2xl transition-all flex flex-col lg:flex-row items-center gap-3 sm:gap-6 cursor-pointer"
                            >
                                <div className="bg-orange-100 group-hover:bg-orange-500 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                    <UserCircle className="w-6 h-6 sm:w-9 sm:h-9 text-orange-500 group-hover:text-white" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="font-bold text-slate-900 text-base sm:text-2xl">User</p>
                                    <p className="text-slate-500 text-[10px] sm:text-sm mt-0.5 sm:block hidden">Report Damage & Track</p>
                                </div>
                            </button>

                            {/* Admin Card */}
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="group p-4 sm:p-8 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-400 rounded-2xl transition-all flex flex-col lg:flex-row items-center gap-3 sm:gap-6 cursor-pointer"
                            >
                                <div className="bg-orange-100 group-hover:bg-orange-500 w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors">
                                    <Landmark className="w-6 h-6 sm:w-9 sm:h-9 text-orange-500 group-hover:text-white" />
                                </div>
                                <div className="text-center lg:text-left">
                                    <p className="font-bold text-slate-900 text-base sm:text-2xl">Admin</p>
                                    <p className="text-slate-500 text-[10px] sm:text-sm mt-0.5 sm:block hidden">Analyze & Manage</p>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
                            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-slate-600 transition-colors text-xs sm:text-sm font-medium">
                                ← Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleSelect;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Cpu,
    Camera,
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    ArrowRight,
    Landmark,
    UserCircle,
    FileText,
    MapPin,
    Activity,
    Sparkles,
    Menu,
    X,
    Lock
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const navigate = useNavigate();
    const { token, isStaff } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('differencing');

    // Smooth scroll to section
    const scrollToSection = (id) => {
        setMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
            {/* Animated Canvas Background */}
            <AnimatedBackground />

            {/* Ambient Background Light Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-400/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-amber-400/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[160px] pointer-events-none" />

            {/* ── 1. NAVIGATION BAR ────────────────────────────────────── */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-orange-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <img src="/logo.png" alt="DurgSetu AI Logo" className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm" />
                        <div>
                            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                                DurgSetu <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">AI</span>
                            </span>
                            <span className="block text-[10px] text-orange-700 font-extrabold tracking-widest uppercase -mt-1">
                                Heritage Monitoring
                            </span>
                        </div>
                    </div>


                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-extrabold text-slate-600">
                        <button onClick={() => scrollToSection('about')} className="hover:text-orange-600 transition-colors">
                            About Platform
                        </button>
                        <button onClick={() => scrollToSection('features')} className="hover:text-orange-600 transition-colors">
                            AI Features
                        </button>
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-orange-600 transition-colors">
                            How It Works
                        </button>
                        <button onClick={() => scrollToSection('forts')} className="hover:text-orange-600 transition-colors">
                            Fort Highlights
                        </button>
                    </nav>

                    {/* Actions / Auth Redirects */}
                    <div className="hidden md:flex items-center gap-4">
                        {token ? (
                            <button
                                onClick={() => navigate(isStaff ? '/admin/dashboard' : '/user/dashboard')}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                            >
                                <Activity className="w-4 h-4" />
                                Go to Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/user/login')}
                                    className="text-slate-700 hover:text-orange-600 font-extrabold text-sm px-4 py-2 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                                >
                                    User Portal
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                                >
                                    <Lock className="w-4 h-4" />
                                    Portal Login
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-700 hover:text-orange-600 focus:outline-none"
                        >
                            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 border-b border-orange-100 px-4 pt-2 pb-6 space-y-3 shadow-xl backdrop-blur-md">
                        <button
                            onClick={() => scrollToSection('about')}
                            className="block w-full text-left py-2 text-slate-700 hover:text-orange-600 font-bold"
                        >
                            About Platform
                        </button>
                        <button
                            onClick={() => scrollToSection('features')}
                            className="block w-full text-left py-2 text-slate-700 hover:text-orange-600 font-bold"
                        >
                            AI Features
                        </button>
                        <button
                            onClick={() => scrollToSection('how-it-works')}
                            className="block w-full text-left py-2 text-slate-700 hover:text-orange-600 font-bold"
                        >
                            How It Works
                        </button>
                        <button
                            onClick={() => scrollToSection('forts')}
                            className="block w-full text-left py-2 text-slate-700 hover:text-orange-600 font-bold"
                        >
                            Fort Highlights
                        </button>

                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            {token ? (
                                <button
                                    onClick={() => navigate(isStaff ? '/admin/dashboard' : '/user/dashboard')}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold text-center rounded-2xl shadow-lg"
                                >
                                    Go to Dashboard
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate('/user/login')}
                                        className="w-full py-3 bg-slate-100 hover:bg-orange-50 text-slate-800 font-extrabold text-center rounded-2xl"
                                    >
                                        User Login
                                    </button>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-extrabold text-center rounded-2xl shadow-lg"
                                    >
                                        Access Portal / Login
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* ── 2. HERO SECTION ───────────────────────────────────────── */}
            <section className="relative pt-10 pb-16 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: Headline & Action Buttons */}
                    <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
                            Preserving Historical Forts With <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                                AI Visual Intelligence.
                            </span>
                        </h1>

                        {/* Historical Quote Box */}
                        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 shadow-sm backdrop-blur-md max-w-xl mx-auto lg:mx-0">
                            <p className="text-xs sm:text-sm italic text-amber-950 font-bold">
                                "Forts are the foundation of the kingdom — their preservation is our sacred duty."
                            </p>
                            <p className="text-[11px] font-extrabold text-orange-800 mt-1 uppercase tracking-wider">
                                — Chhatrapati Shivaji Maharaj Heritage Legacy
                            </p>
                        </div>

                        {/* Subtitle / Description */}
                        <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-medium leading-relaxed">
                            <strong className="text-slate-900 font-bold">DurgSetu AI</strong> combines automated visual change detection (PyTorch & OpenCV SSIM analysis) with community crowdsourced reporting to detect wall decay, structural cracks, and erosion before heritage loss occurs.
                        </p>

                        {/* CTA Redirect Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 cursor-pointer"
                            >
                                <Shield className="w-5 h-5" />
                                <span>Access Portal / Login</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => navigate('/user/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-orange-50 text-slate-800 font-extrabold text-base rounded-2xl border-2 border-slate-200 hover:border-orange-300 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Camera className="w-5 h-5 text-orange-600" />
                                <span>Report Damage</span>
                            </button>
                        </div>

                        {/* Feature Badges */}
                        <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-bold">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Automated SSIM Metrics</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Risk Score Heatmaps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>PDF Audit Reports</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Demo Showcase Card Mockup */}
                    <div className="lg:col-span-5 relative">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            {/* Glow Behind Card */}
                            <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 opacity-40 blur-xl" />

                            <div className="relative rounded-3xl bg-white border-2 border-orange-100 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
                                {/* Header of Card */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                                        <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                                            Live AI Differencing Scan
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-extrabold border border-red-200">
                                        High Risk Alert
                                    </span>
                                </div>

                                {/* Comparison Display */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                                        <span>Raigad Fort — Western Wall</span>
                                        <span className="text-orange-600">SSIM Index: 0.74</span>
                                    </div>

                                    {/* Mockup Box */}
                                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white rounded-xl p-3 text-center border border-slate-200 shadow-sm">
                                                <span className="text-[10px] text-slate-500 font-extrabold uppercase block mb-1">Baseline Image</span>
                                                <div className="h-24 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                    <Landmark className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Intact Structure</span>
                                            </div>

                                            <div className="bg-orange-50/60 rounded-xl p-3 text-center border-2 border-orange-300 shadow-sm relative">
                                                <span className="text-[10px] text-orange-700 font-extrabold uppercase block mb-1">Current Scan</span>
                                                <div className="h-24 rounded-lg bg-orange-100/70 flex items-center justify-center border border-orange-300 relative overflow-hidden">
                                                    <Landmark className="w-8 h-8 text-orange-600" />
                                                    {/* Bounding box mock */}
                                                    <div className="absolute inset-2 border-2 border-dashed border-red-500 rounded bg-red-500/10 flex items-center justify-center">
                                                        <span className="text-[9px] font-black bg-red-600 text-white px-1.5 py-0.5 rounded shadow">Crack Detected</span>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] text-red-600 font-bold mt-1 block">Wall Decay</span>
                                            </div>
                                        </div>

                                        {/* Metrics Bar */}
                                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-bold">
                                            <span className="flex items-center gap-1 text-slate-700">
                                                <Cpu className="w-3.5 h-3.5 text-orange-600" /> Contours Extracted
                                            </span>
                                            <span className="text-amber-700 font-black">Risk Score: 8.2 / 10</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action button inside card */}
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Access Stage 1 & Stage 2 Dashboards</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ──. WHAT THE PROJECT DOES (FEATURE HIGHLIGHTS) ────────── */}
            <section id="about" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-orange-600">
                        Platform Capability & Architecture
                    </h2>
                    <p className="text-3xl sm:text-5xl font-black text-slate-900">
                        How DurgSetu AI Protects Heritage Sites
                    </p>
                    <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                        A dual-powered conservation platform uniting automated computer vision differencing with community crowdsourced reporting.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Feature 1 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Cpu className="w-7 h-7 text-orange-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">AI Visual Differencing</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Uses PyTorch and OpenCV SSIM metrics to compare baseline fort imagery with current photos, calculating exact structural variation scores.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Camera className="w-7 h-7 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Crowdsourced Field Intelligence</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Empowers heritage enthusiasts and visitors to submit geotagged damage reports with photos, description, and severity tags.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Risk Scoring & Heatmaps</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Calculates dynamic risk indices for every fort bastion and wall section, generating site-wise heatmaps for quick prioritization.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 hover:border-orange-300 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1.5 group">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-7 h-7 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">PDF Audit Reports</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Generates professional ReportLab audit PDF files documenting structural degradation for state conservation authorities.
                        </p>
                    </div>
                </div>
            </section>

            {/* ──. INTERACTIVE TAB SHOWCASE ───────────────────────────── */}
            <section id="features" className="py-16 md:py-24 bg-orange-50/50 border-t border-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                        <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-orange-600">
                            Interactive Demo Preview
                        </h2>
                        <p className="text-3xl sm:text-4xl font-black text-slate-900">
                            Explore Core Engine Modules
                        </p>
                    </div>

                    {/* Tabs Selection */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                        <button
                            onClick={() => setActiveTab('differencing')}
                            className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'differencing'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                                    : 'bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-600 border border-slate-200'
                            }`}
                        >
                            <Cpu className="w-4 h-4" />
                            Visual Differencing (Stage 1)
                        </button>

                        <button
                            onClick={() => setActiveTab('crowdsource')}
                            className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'crowdsource'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                                    : 'bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-600 border border-slate-200'
                            }`}
                        >
                            <Camera className="w-4 h-4" />
                            Crowdsourced Reporting
                        </button>

                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
                                activeTab === 'analytics'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25'
                                    : 'bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-600 border border-slate-200'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics & Heatmaps
                        </button>
                    </div>

                    {/* Tab Content Display */}
                    <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-orange-100 shadow-2xl max-w-4xl mx-auto">
                        {activeTab === 'differencing' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">Stage 1: Automated Image Differencing</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">PyTorch feature extraction and OpenCV structural similarity (SSIM)</p>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200">
                                        Automated Pipeline
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">Image Resizing</span>
                                        <span className="text-lg font-black text-orange-600">256 x 256 Grayscale</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">Metric Calculation</span>
                                        <span className="text-lg font-black text-amber-600">SSIM Index (0.0 - 1.0)</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                        <span className="text-xs text-slate-500 font-bold block mb-1">Bounding Box</span>
                                        <span className="text-lg font-black text-red-600">Contour Extraction</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'crowdsource' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">Community Damage Portal</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">Public submission of wall cracks, stone displacement, and erosion</p>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-orange-100 text-orange-800 text-xs font-extrabold rounded-full border border-orange-200">
                                        Geotagged Field Reports
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                        <div className="flex items-center gap-2 text-orange-600 font-extrabold text-sm">
                                            <MapPin className="w-4 h-4" /> Fort Site Tagging
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium">Select fort location, specific bastion, and upload field photograph.</p>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                        <div className="flex items-center gap-2 text-amber-600 font-extrabold text-sm">
                                            <AlertTriangle className="w-4 h-4" /> Severity Rating
                                        </div>
                                        <p className="text-xs text-slate-600 font-medium">Classify structural hazard as Low, Medium, High, or Critical.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h4 className="text-2xl font-black text-slate-900">Admin Intelligence & Heatmaps</h4>
                                        <p className="text-sm text-slate-600 font-medium mt-1">14-day report trends, contributor leaderboards, and site rankings</p>
                                    </div>
                                    <span className="px-3.5 py-1.5 bg-red-100 text-red-800 text-xs font-extrabold rounded-full border border-red-200">
                                        Admin Analytics Portal
                                    </span>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Real-time damage aggregation prioritizing urgent conservation interventions across Maharashtra heritage forts.
                                    </p>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer"
                                    >
                                        Login as Admin to View Analytics Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── . HOW IT WORKS (3 STEPS) ─────────────────────────────── */}
            <section id="how-it-works" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-orange-600">
                        Workflow & Action Steps
                    </h2>
                    <p className="text-3xl sm:text-5xl font-black text-slate-900">
                        Simple 3-Step Conservation Process
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Step 1 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-lg relative hover:border-orange-300 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                            1
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Field Capture & Report</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            Visitors or authorized surveyors snap photographs of fort structures and upload them via the mobile-friendly user portal.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-lg relative hover:border-orange-300 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                            2
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">AI Visual Differencing</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            The Django backend runs OpenCV & PyTorch visual differencing against historical baselines, generating structural risk scores.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="p-8 rounded-3xl bg-white border-2 border-slate-100 shadow-lg relative hover:border-orange-300 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 text-white font-black text-xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                            3
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-3">Admin Review & Dispatch</h3>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            Heritage administrators inspect high-risk alerts, generate PDF audit reports, and authorize field restoration teams.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── . CALL TO ACTION (CTA) BANNER ────────────────────────── */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="relative rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 p-8 sm:p-14 overflow-hidden shadow-2xl text-white">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/15 blur-3xl" />
                    <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
                        <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                            Ready to Protect Heritage Forts?
                        </h2>
                        <p className="text-base sm:text-lg text-orange-100 font-semibold">
                            Join the community of heritage conservators, researchers, and administrators protecting historical monuments.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-950 text-white font-black text-base rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5"
                            >
                                <Lock className="w-5 h-5 text-orange-400" />
                                <span>Portal Login</span>
                            </button>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-extrabold text-base rounded-2xl border border-white/40 backdrop-blur-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <UserCircle className="w-5 h-5" />
                                <span>Register as Contributor</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 8. FOOTER ────────────────────────────────────────────── */}
            <footer className="border-t border-orange-100 bg-white py-12 px-4 sm:px-6 lg:px-8 text-slate-600 text-xs sm:text-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="DurgSetu AI Logo" className="h-9 w-auto object-contain drop-shadow-sm" />
                        <div>
                            <span className="font-black text-slate-900 text-base">DurgSetu AI</span>
                        </div>
                    </div>


                    <div className="flex items-center gap-6 font-extrabold text-slate-600">
                        <button onClick={() => scrollToSection('about')} className="hover:text-orange-600 transition-colors">
                            About
                        </button>
                        <button onClick={() => scrollToSection('features')} className="hover:text-orange-600 transition-colors">
                            AI Features
                        </button>
                        <button onClick={() => navigate('/login')} className="hover:text-orange-600 transition-colors">
                            Portal Login
                        </button>
                    </div>

                    <div className="font-semibold text-slate-500">
                        © {new Date().getFullYear()} DurgSetu AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

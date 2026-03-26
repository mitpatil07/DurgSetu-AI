import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportsAdmin.css';

const SEV_LABELS = {critical:'🚨 Critical',high:'🔴 High',medium:'🟠 Medium',low:'🟡 Low'};
const SEV_CLASSES = {critical:'acc-sev-bg-c',high:'acc-sev-bg-h',medium:'acc-sev-bg-m',low:'acc-sev-bg-l'};

const ReportsAdmin = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, critical: 0, pending: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentReport, setCurrentReport] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [suggLoading, setSuggLoading] = useState(false);
    
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [dispatching, setDispatching] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '', success: true });
    
    // Live Clock
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return navigate('/login');

        try {
            const [reportsRes, statsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/reports/list/', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:8000/api/reports/stats/', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (reportsRes.ok) {
                const data = await reportsRes.json();
                setReports(data.results || data);
            }
            if (statsRes.ok) {
                const sData = await statsRes.json();
                setStats(sData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Fetch AI suggestions when report is selected
    useEffect(() => {
        if (currentReport) {
            setSuggLoading(true);
            const token = localStorage.getItem('auth_token');
            fetch(`http://127.0.0.1:8000/api/reports/${currentReport.id}/suggestions/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(r => r.json())
            .then(data => {
                setSuggestions(data.suggestions || []);
            })
            .catch(err => console.error(err))
            .finally(() => setSuggLoading(false));
            
            // clear form
            setSelectedStatus(null);
            setAdminNotes('');
        } else {
            setSuggestions([]);
        }
    }, [currentReport?.id]);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    const showToast = (msg, success = true) => {
        setToast({ show: true, msg, success });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    };

    const dispatchAction = async () => {
        if (!selectedStatus) {
            showToast('⚠️ Please select a status first', false);
            return;
        }

        setDispatching(true);
        const token = localStorage.getItem('auth_token');

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/reports/${currentReport.id}/status/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: selectedStatus,
                    admin_notes: adminNotes,
                    actioned_by: 'Superintendent' // Could replace with real user name from token
                })
            });

            if (res.ok) {
                const updatedReport = await res.json();
                const newReports = reports.map(r => r.id === updatedReport.id ? updatedReport : r);
                setReports(newReports);
                setCurrentReport(updatedReport);
                fetchDashboardData(); // Refresh stats
                showToast(`✅ Status updated · ${updatedReport.sevak_name} notified by email`);
            } else {
                showToast('❌ Failed to update report status', false);
            }
        } catch (err) {
            showToast('❌ Network error', false);
        } finally {
            setDispatching(false);
            setSelectedStatus(null);
            setAdminNotes('');
        }
    };

    const dismissReport = async () => {
        setSelectedStatus('dismissed'); 
        setAdminNotes('Report archived without specific physical structural repair.');
        showToast('Info marked for archival, click Dispatch to confirm', true);
    };

    const filteredReports = reports.filter(r => {
        const matchF = filter === 'all' ? true :
            (filter === 'submitted' || filter === 'resolved')
                ? r.status === filter
                : r.severity === filter;
        
        const q = search.toLowerCase();
        const refStr = (r.reference_number || '').toLowerCase();
        const matchQ = !q || refStr.includes(q) ||
            r.fort_name.toLowerCase().includes(q) || r.sevak_name.toLowerCase().includes(q) ||
            r.fort_section.toLowerCase().includes(q);
        
        return matchF && matchQ;
    });

    const fmtDate = (dt) => {
        if (!dt) return '';
        const d = new Date(dt);
        const df = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const tf = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return `${df}, ${tf}`;
    };

    const statusLabelText = (s) => {
        return {
            submitted: '🆕 Submitted',
            under_review: '🔍 Under Review',
            in_progress: '🔧 In Progress',
            resolved: '✅ Resolved',
            dismissed: '🛡️ Dismissed/Archived'
        }[s] || s;
    };

    return (
        <div className="acc-page">
            {/* NAV */}
            <nav className="acc-nav">
                <div className="acc-nav-left">
                    <div className="acc-nav-brand">🏛️ DurgSetu</div>
                    <span className="acc-nav-badge">Authority Command Centre</span>
                </div>
                <div className="acc-nav-right">
                    <span className="acc-nav-clock">
                        {time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="acc-nav-user">🛡️ Superintendent of Heritage</span>
                    <button className="acc-nav-btn" onClick={() => navigate('/')}>Dashboard</button>
                    <button className="acc-nav-btn" onClick={handleLogout} style={{borderColor: 'rgba(122,26,26,.6)'}}>Log Out</button>
                </div>
            </nav>

            {/* STATS BAR */}
            <div className="acc-stats-bar">
                <div className="acc-stat-cell">
                    <div className="acc-stat-n">{loading ? '-' : stats.total}</div>
                    <div className="acc-stat-l">Total Reports</div>
                </div>
                <div className="acc-stat-cell">
                    <div className="acc-stat-n crit-n">{loading ? '-' : stats.critical}</div>
                    <div className="acc-stat-l">Critical</div>
                </div>
                <div className="acc-stat-cell">
                    <div className="acc-stat-n">{loading ? '-' : stats.pending}</div>
                    <div className="acc-stat-l">Pending Review</div>
                </div>
                <div className="acc-stat-cell">
                    <div className="acc-stat-n">{loading ? '-' : stats.resolved}</div>
                    <div className="acc-stat-l">Resolved</div>
                </div>
            </div>

            {/* LAYOUT */}
            <div className="acc-layout">

                {/* SIDEBAR */}
                <aside className="acc-sidebar">
                    <div className="acc-sb-head">
                        <div className="acc-sb-title">📋 Reports Inbox</div>
                        <div className="acc-sb-search">
                            <span className="acc-sb-search-icon">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search fort, sevak, ref…" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="acc-sb-filters">
                        <button className={`acc-sf-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`acc-sf-pill acc-crit-f ${filter === 'critical' ? 'active' : ''}`} onClick={() => setFilter('critical')}>🚨 Critical</button>
                        <button className={`acc-sf-pill acc-hi-f ${filter === 'high' ? 'active' : ''}`} onClick={() => setFilter('high')}>🔴 High</button>
                        <button className={`acc-sf-pill ${filter === 'medium' ? 'active' : ''}`} onClick={() => setFilter('medium')}>🟠 Medium</button>
                        <button className={`acc-sf-pill ${filter === 'low' ? 'active' : ''}`} onClick={() => setFilter('low')}>🟡 Low</button>
                        <button className={`acc-sf-pill ${filter === 'submitted' ? 'active' : ''}`} onClick={() => setFilter('submitted')}>New</button>
                        <button className={`acc-sf-pill ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>Resolved</button>
                    </div>
                    
                    <div className="acc-sb-list">
                        {!loading && filteredReports.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--stone-5)', fontStyle: 'italic', fontSize: '.9rem' }}>
                                No reports match this filter
                            </div>
                        )}
                        {filteredReports.map((r, i) => (
                            <div 
                                key={r.id}
                                className={`acc-ritem acc-sev-${r.severity} ${currentReport?.id === r.id ? 'selected' : ''}`}
                                style={{ animationDelay: `${i * 0.05}s` }}
                                onClick={() => setCurrentReport(r)}
                            >
                                <div className="acc-ri-top">
                                    <span className="acc-ri-ref">
                                        {r.status === 'submitted' && <span className="acc-ri-new"></span>}
                                        {r.reference_number || `REP-${r.id}`}
                                    </span>
                                    <span className={`acc-ri-sev ${SEV_CLASSES[r.severity]}`}>
                                        {SEV_LABELS[r.severity]}
                                    </span>
                                </div>
                                <div className="acc-ri-fort">{r.fort_name}</div>
                                <div className="acc-ri-section">{r.fort_section}</div>
                                <div className="acc-ri-meta">
                                    <span className="acc-ri-name">👤 {r.sevak_name}</span>
                                    <span className="acc-ri-date">{fmtDate(r.submitted_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* MAIN */}
                <main className="acc-main">
                    {!currentReport ? (
                        <div className="acc-empty-state">
                            <div className="acc-es-icon">🏰</div>
                            <div className="acc-es-title">Select a Report</div>
                            <div className="acc-es-sub">Choose a DurgSevak report from the inbox to review details and take action</div>
                        </div>
                    ) : (
                        <>
                            {/* DETAIL CARD */}
                            <div className="acc-detail-card">
                                <div className="acc-dc-header">
                                    <div className="acc-dc-header-left">
                                        <div className="acc-dc-ref">{currentReport.reference_number || `REP-${currentReport.id}`} · {fmtDate(currentReport.submitted_at)}</div>
                                        <div className="acc-dc-fort">{currentReport.fort_name}</div>
                                        <div className="acc-dc-section">📍 {currentReport.fort_section}</div>
                                    </div>
                                    <span className={`acc-dc-sev-badge ${SEV_CLASSES[currentReport.severity]}`}>{SEV_LABELS[currentReport.severity]}</span>
                                </div>
                                <div className="acc-dc-info">
                                    <div className="acc-dc-info-cell"><div className="acc-dc-info-label">DurgSevak</div><div className="acc-dc-info-val">👤 {currentReport.sevak_name}</div></div>
                                    <div className="acc-dc-info-cell"><div className="acc-dc-info-label">Email</div><div className="acc-dc-info-val"><a href={`mailto:${currentReport.sevak_email}`}>{currentReport.sevak_email}</a></div></div>
                                    <div className="acc-dc-info-cell"><div className="acc-dc-info-label">Phone</div><div className="acc-dc-info-val">{currentReport.sevak_phone || '—'}</div></div>
                                    <div className="acc-dc-info-cell"><div className="acc-dc-info-label">Current Status</div><div className="acc-dc-info-val">{statusLabelText(currentReport.status)}</div></div>
                                </div>
                                
                                {currentReport.image ? (
                                    <div className="acc-dc-photo">
                                        <img src={`http://127.0.0.1:8000${currentReport.image}`} alt="Damage photo" loading="lazy" />
                                        <div className="acc-dc-photo-label">📷 Photo Evidence submitted by DurgSevak</div>
                                    </div>
                                ) : (
                                    <div className="acc-dc-nophoto">📷 No photo submitted with this report</div>
                                )}
                                
                                <div className="acc-dc-body">
                                    <div className="acc-dc-sec-label">📝 Damage Description</div>
                                    <div className="acc-dc-text">{currentReport.description}</div>
                                    {currentReport.suggestions && (
                                        <>
                                            <div className="acc-dc-sec-label">💡 DurgSevak Suggestions</div>
                                            <div className="acc-dc-text">{currentReport.suggestions}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* AI SUGGESTIONS CARD */}
                            <div className="acc-sug-card">
                                <div className="acc-sug-header">
                                    <div className="acc-sug-title">⚡ Recommended Actions for Authorities</div>
                                    <span className="acc-sug-powered">AI-Assisted · Based on severity & damage type</span>
                                </div>
                                <div className="acc-sug-body">
                                    <div className="acc-sug-intro">Based on the reported severity (<strong>{SEV_LABELS[currentReport.severity]}</strong>) and analysis of the damage description, the following actions are dynamically recommended.</div>
                                    <div className="acc-al">
                                        {suggLoading ? (
                                            <div style={{color: 'var(--stone-4)', padding: '1rem'}}>Generating live AI suggestions...</div>
                                        ) : suggestions.length === 0 ? (
                                            <div style={{color: 'var(--stone-4)', padding: '1rem'}}>No specific systemic suggestions mapped.</div>
                                        ) : (
                                            suggestions.map((a, i) => (
                                                <div key={i} className={`acc-ai p-${a.priority || a.p || 2}`} style={{ animation: `accFadeUp .35s ${0.05 * i}s ease both` }}>
                                                    <div className="acc-ai-icon">{a.icon || '🔸'}</div>
                                                    <div className="acc-ai-content">
                                                        <div className="acc-ai-title">{a.title}</div>
                                                        <div className="acc-ai-desc">{a.description || a.desc}</div>
                                                        <span className="acc-ai-timeline">⏱ {a.timeline}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ACTION PANEL */}
                            <div className="acc-ac-card">
                                <div className="acc-ac-header">
                                    <div className="acc-ac-title">🏹 Dispatch Action</div>
                                </div>
                                <div className="acc-ac-body">
                                    <div>
                                        <div className="acc-ac-label">Update Report Status</div>
                                        <div className="acc-status-grid">
                                            {[
                                                { v: 'under_review', icon: '🔍', l: 'Under Review', d: 'Assessment in progress' },
                                                { v: 'in_progress', icon: '🔧', l: 'In Progress', d: 'Repair work has begun' },
                                                { v: 'resolved', icon: '✅', l: 'Resolved', d: 'Issue has been addressed' },
                                            ].map(s => (
                                                <div 
                                                    key={s.v}
                                                    className={`acc-status-opt ${selectedStatus === s.v || (currentReport.status === s.v && !selectedStatus) ? 'selected' : ''}`}
                                                    onClick={() => setSelectedStatus(s.v)}
                                                >
                                                    <span className="acc-status-icon">{s.icon}</span>
                                                    <div>
                                                        <div className="acc-status-lbl">{s.l}</div>
                                                        <div className="acc-status-desc">{s.d}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="acc-ac-label">Notes to DurgSevak <span style={{ fontWeight: 400, fontFamily: "'EB Garamond',serif", letterSpacing: 0, textTransform: 'none', fontSize: '.9rem', color: 'var(--stone-5)' }}>(sent via email)</span></div>
                                        <textarea 
                                            className="acc-ac-textarea" 
                                            placeholder="Describe the action being taken, expected timeline, and any instructions for the DurgSevak…"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="acc-ac-actions">
                                        <button className="acc-btn-dispatch" onClick={dispatchAction} disabled={dispatching}>
                                            <span>{dispatching ? 'Dispatching…' : '📨 Dispatch & Notify DurgSevak'}</span>
                                            <div className="spin" style={{ display: dispatching ? 'block' : 'none' }}></div>
                                        </button>
                                        <button className="acc-btn-dismiss" onClick={dismissReport}>Archive without action</button>
                                    </div>
                                </div>
                            </div>

                            {/* TIMELINE CARD */}
                            <div className="acc-tl-card">
                                <div className="acc-tl-header"><div className="acc-tl-title">📅 Report Timeline</div></div>
                                <div className="acc-tl-body">
                                    <div className="acc-tl-list">
                                        {currentReport.history && currentReport.history.length > 0 ? (
                                            currentReport.history.map((h, i) => {
                                                const isLast = i === currentReport.history.length - 1;
                                                return (
                                                    <div className="acc-tl-item" key={h.id || i}>
                                                        <div className={`acc-tl-dot ${isLast ? 'activ' : 'done'}`}>
                                                            {isLast ? '●' : '✓'}
                                                        </div>
                                                        <div className="acc-tl-content">
                                                            <div className="acc-tl-label">{statusLabelText(h.status)} {h.changed_by && `(by ${h.changed_by})`}</div>
                                                            <div className="acc-tl-time">{fmtDate(h.changed_at)}</div>
                                                            {h.notes && (
                                                                <div className="acc-tl-notes" style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--stone-3)', background: 'var(--cream)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2px solid var(--gold)' }}>
                                                                    "{h.notes}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div style={{padding: '1rem', color: 'var(--stone-4)'}}>No timeline history available.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* TOAST */}
            <div className={`acc-toast ${toast.show ? 'show' : ''}`} style={{ background: toast.success ? 'linear-gradient(135deg,#1C4A28,#2A6E3A)' : 'linear-gradient(135deg,#4A1C1C,#7A1A1A)' }}>
                <div className="acc-toast-icon">{toast.success ? '✅' : '⚠️'}</div>
                <div className="acc-toast-text" style={{ color: toast.success ? '#90E0A0' : '#F09080' }}>{toast.msg}</div>
            </div>
        </div>
    );
};

export default ReportsAdmin;

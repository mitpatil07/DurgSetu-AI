import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [role, setRole] = useState('admin');
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_email', data.email);
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('user_role', data.role);
                
                if (data.role === 'admin' || role === 'admin') {
                    navigate('/'); // Going to Main Dashboard
                } else {
                    navigate('/report-issue');
                }
            } else {
                if (typeof data === 'object' && data !== null) {
                    const firstError = Object.values(data)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : (data.error || 'Registration failed'));
                } else {
                    setError('Registration failed');
                }
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="durg-theme page" id="pg-login" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', flexDirection: 'column' }}>
            <div className="torch t1"></div>
            <div className="torch t2"></div>
            <div className="login-wrap">
                <div className="top-rule"></div>
                <div className="lcard">
                    <div className="lhdr">
                        <div className="emblem">
                            <svg viewBox="0 0 82 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="52" width="64" height="22" fill="#BF9020" rx="1"/>
                                <rect x="9" y="44" width="10" height="10" fill="#DDB840"/>
                                <rect x="36" y="44" width="10" height="10" fill="#DDB840"/>
                                <rect x="63" y="44" width="10" height="10" fill="#DDB840"/>
                                <rect x="19" y="52" width="17" height="22" fill="#B08010" opacity=".45"/>
                                <rect x="46" y="52" width="17" height="22" fill="#B08010" opacity=".45"/>
                                <path d="M35 74 L35 63 Q41 55 47 63 L47 74Z" fill="#420C0C" opacity=".85"/>
                                <rect x="7" y="28" width="18" height="36" fill="#BF9020" rx="1"/>
                                <rect x="7" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="14" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="20" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="57" y="28" width="18" height="36" fill="#BF9020" rx="1"/>
                                <rect x="57" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="64" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="70" y="21" width="5" height="9" fill="#DDB840"/>
                                <rect x="39.5" y="4" width="3" height="22" fill="#D4580A"/>
                                <path d="M42.5 4 L58 9 L42.5 16Z" fill="#D4580A"/>
                                <circle cx="41" cy="3.5" r="3.5" fill="#F5E090"/>
                                <circle cx="41" cy="3.5" r="6.5" stroke="#D4580A" strokeWidth="1" opacity=".3"/>
                            </svg>
                        </div>
                        <h1 className="brand" style={{ fontSize: '1.8rem' }}>Join DurgSetu</h1>
                        <div className="brand-sub">Heritage Guardian System · महाराष्ट्र</div>
                    </div>
                    <div className="lbody">
                        <div className="role-row">
                            <button 
                                className={`rpill ${role === 'admin' ? 'on' : ''}`} 
                                onClick={() => { setRole('admin'); setError(''); }}
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7v5c0 5.5 4.2 10.5 10 12 5.8-1.5 10-6.5 10-12V7z"/></svg>
                                Admin
                            </button>
                            <button 
                                className={`rpill ${role === 'durgsevak' ? 'on' : ''}`} 
                                onClick={() => { setRole('durgsevak'); setError(''); }}
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                DurgSevak
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className={`err ${error ? 'show' : ''}`}>{error}</div>
                            
                            <div className="fld">
                                <label className="lbl" htmlFor="ru">Username</label>
                                <input 
                                    className="inp" 
                                    type="text" 
                                    id="ru" 
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose username" 
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="fld">
                                <label className="lbl" htmlFor="re">Email</label>
                                <input 
                                    className="inp" 
                                    type="email" 
                                    id="re" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@durgsetu.ai" 
                                    autoComplete="email"
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="fld">
                                    <label className="lbl" htmlFor="rp">Password</label>
                                    <input 
                                        className="inp" 
                                        type="password" 
                                        id="rp" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••" 
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                                <div className="fld">
                                    <label className="lbl" htmlFor="rcp">Confirm</label>
                                    <input 
                                        className="inp" 
                                        type="password" 
                                        id="rcp" 
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••" 
                                        autoComplete="new-password"
                                        required
                                    />
                                </div>
                            </div>
                            <button className="btn-enter" type="submit" disabled={loading}>
                                {loading ? 'Registering...' : 'Create Profile →'}
                            </button>
                        </form>
                        
                        <div className="lfoot"><p>Your watch begins now. Protect the Past.</p></div>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button onClick={() => navigate('/login')} style={{ fontSize: '0.8rem', color: 'var(--stone-4)', textDecoration: 'underline', background: 'transparent', border: 'none', cursor: 'pointer' }}>Already have an account? Log in</button>
                        </div>
                    </div>
                </div>
                <div className="bot-rule"></div>
            </div>
        </div>
    );
};

export default Register;

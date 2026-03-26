import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        fortName: 'Shivneri',
        section: '',
        issueType: 'Structural Crack',
        severity: 'medium',
        description: ''
    });
    
    // Image state
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // Status state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successData, setSuccessData] = useState(null);
    
    const fileInputRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        navigate('/login');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
            setError('Unauthorized. Please login again.');
            setLoading(false);
            return;
        }

        const userEmail = localStorage.getItem('user_email') || 'sevak@durgsetu.ai';
        const combinedDescription = `[${formData.issueType}] ${formData.description}`;

        const data = new FormData();
        data.append('sevak_name', formData.fullName || userEmail);
        data.append('sevak_email', userEmail);
        data.append('sevak_phone', formData.phone);
        data.append('fort_name', formData.fortName);
        data.append('fort_section', formData.section);
        data.append('severity', formData.severity);
        data.append('description', combinedDescription);
        data.append('suggestions', '');
        
        if (image) {
            data.append('image', image);
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/reports/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data,
            });

            const result = await response.json();

            if (response.ok) {
                setSuccessData(result);
            } else {
                setError(result.error || 'Failed to submit report. Please check your data.');
            }
        } catch (err) {
            setError('Network error. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSuccessData(null);
        setFormData({
            ...formData,
            section: '',
            description: ''
        });
        removeImage();
    };

    return (
        <div className="durg-theme page" id="pg-sevak" style={{ flexDirection: 'column' }}>
            <nav className="snav">
                <div className="snav-brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    DurgSetu
                    <span className="sbadge">Sevak Portal</span>
                </div>
                <button className="btnout2" onClick={handleLogout}>Depart System</button>
            </nav>
            
            <main className="smain">
                <div className="shero">
                    <h2 className="shero-title">Fort Status Report</h2>
                    <p className="shero-sub">Document structural concerns directly to heritage authorities</p>
                </div>

                {!successData ? (
                    <div className="rcard" id="sevak-form-pane">
                        <form onSubmit={handleSubmit}>
                            
                            {/* Section 1: Sevak Details */}
                            <div className="rsec">
                                <h3 className="rtitle">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                    Sevak Details
                                </h3>
                                <div className="frow">
                                    <div className="fld">
                                        <label className="lbl">Full Name</label>
                                        <input 
                                            className="inp" type="text" name="fullName"
                                            value={formData.fullName} onChange={handleChange}
                                            required placeholder="e.g. Ramesh Patil"
                                        />
                                    </div>
                                    <div className="fld">
                                        <label className="lbl">Contact Number</label>
                                        <input 
                                            className="inp" type="tel" name="phone"
                                            value={formData.phone} onChange={handleChange}
                                            required placeholder="e.g. 9876543210"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Section 2: Location Details */}
                            <div className="rsec">
                                <h3 className="rtitle">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Location Details
                                </h3>
                                <div className="frow">
                                    <div className="fld">
                                        <label className="lbl">Fort Name</label>
                                        <select className="inp" name="fortName" value={formData.fortName} onChange={handleChange} required>
                                            <option value="Shivneri">Shivneri Fort</option>
                                            <option value="Raigad">Raigad Fort</option>
                                            <option value="Pratapgad">Pratapgad</option>
                                            <option value="Rajgad">Rajgad</option>
                                            <option value="Sindhudurg">Sindhudurg</option>
                                        </select>
                                    </div>
                                    <div className="fld">
                                        <label className="lbl">Specific Section</label>
                                        <input 
                                            className="inp" type="text" name="section"
                                            value={formData.section} onChange={handleChange}
                                            required placeholder="e.g. Maha Darwaza"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Issue Assessment */}
                            <div className="rsec">
                                <h3 className="rtitle">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    Issue Assessment
                                </h3>
                                <div className="frow">
                                    <div className="fld">
                                        <label className="lbl">Type of Concern</label>
                                        <select className="inp" name="issueType" value={formData.issueType} onChange={handleChange} required>
                                            <option value="Structural Crack">Structural Crack</option>
                                            <option value="Water Seepage">Water Seepage</option>
                                            <option value="Erosion">Wall Erosion</option>
                                            <option value="Vegetation">Vegetation Roots</option>
                                            <option value="Vandalism">Vandalism</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="fld">
                                        <label className="lbl">Severity Level</label>
                                        <select className="inp" name="severity" value={formData.severity} onChange={handleChange} required>
                                            <option value="low">Low (Requires monitoring)</option>
                                            <option value="medium">Medium (Needs maintenance)</option>
                                            <option value="high">High (Urgent repair needed)</option>
                                            <option value="critical">Critical (Collapse risk)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="fld mt-3">
                                    <label className="lbl">Detailed Description</label>
                                    <textarea 
                                        className="inp" name="description"
                                        value={formData.description} onChange={handleChange}
                                        required placeholder="Describe the current state, size of crack, or rate of deterioration..."
                                        style={{ minHeight: '80px', marginTop: '8px' }}
                                    />
                                </div>
                            </div>

                            {/* Section 4: Visual Evidence */}
                            <div className="rsec">
                                <h3 className="rtitle">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                    Visual Evidence
                                </h3>
                                <div className="uzone" onClick={() => fileInputRef.current && fileInputRef.current.click()}>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                                    <div className="uicon">📷</div>
                                    <div className="utxt">Tap to capture or upload photo</div>
                                    <div className="uhint">Max 5MB (JPG, PNG)</div>
                                </div>
                                
                                {imagePreview && (
                                    <div className="pvwrap on">
                                        <img className="pvimg" src={imagePreview} alt="Preview"/>
                                        <button type="button" className="pvrm" onClick={(e) => { e.stopPropagation(); removeImage(); }}>✕</button>
                                    </div>
                                )}
                            </div>

                            {/* Submit Button Section */}
                            <div className="rsec" style={{ backgroundColor: 'rgba(212,88,10,.02)', padding: '1.5rem', marginTop: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                                {error && <div className="suberr show" style={{ color: 'red', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
                                
                                <button className="btnsub" type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #F07030, #D4580A)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    {loading ? 'Submitting to Command...' : 'Submit Report →'}
                                </button>
                                
                                <div className="hint" style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--stone-4)' }}>
                                    By submitting, you confirm the accuracy of this field report.
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="rcard sucpane show" id="sevak-suc-pane" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div className="sucicon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                        <h3 className="suctitle" style={{ fontSize: '1.8rem', color: 'var(--stone-2)', marginBottom: '0.5rem' }}>Report Secured</h3>
                        <p className="sucsub" style={{ color: 'var(--stone-4)', marginBottom: '2rem' }}>Your findings have been successfully logged in the central registry and dispatched to the authorities.</p>
                        
                        <div className="sucemail" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--cream-2)', padding: '0.5rem 1rem', borderRadius: '4px', color: 'var(--green)', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Notification Email Dispatched
                        </div>
                        
                        <div className="sucref" style={{ fontSize: '1.2rem', fontFamily: 'Cinzel', fontWeight: 'bold', background: 'var(--stone)', color: 'var(--gold-l)', padding: '1rem', borderRadius: '4px', letterSpacing: '2px', marginBottom: '2rem' }}>
                            REF: {successData.reference_number || 'TRK-29001-MH'}
                        </div>
                        
                        <button className="btnagain" onClick={resetForm} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '2px solid var(--sf)', color: 'var(--sf)', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
                            Submit Another Report
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ReportIssue;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, 
    Lock, 
    Trophy, 
    Star, 
    Users, 
    Search,
    TrendingUp,
    MapPin,
    ArrowRight,
    MousePointer2
} from 'lucide-react';
import useUiStore from '../../store/uiStore';

const ToolPreviewModal = ({ isOpen, onClose, toolName, toolPath }) => {
    const { openAuthModal } = useUiStore();
    const navigate = useNavigate();

    const isReviewGap = toolName === "Review Gap Analyzer";

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const mockData = {
        keyword: "dentist",
        location: "chicago",
        totalFound: 75,
        topCompetitors: [
            { name: "Chicago Dental Arts", rating: 4.8, reviews: 250, position: 1 },
            { name: "Downtown Dental LLC", rating: 4.7, reviews: 180, position: 2 },
            { name: "West Loop Dental", rating: 4.9, reviews: 120, position: 3 }
        ],
        insights: [
            "High competition area with 70+ dentists within 5 miles.",
            "Average rating for top 3 is 4.8 — review quality is critical.",
            "Top ranking profiles use 'Family Dentistry' in their descriptions."
        ]
    };

    const handleUnlock = () => {
        onClose();
        openAuthModal('register');
    };

    return (
        <div style={overlay} onClick={onClose}>
            <div 
                style={modalContainer} 
                onClick={(e) => e.stopPropagation()}
                className="animate-in zoom-in-95 fade-in duration-300"
            >
                {/* Header */}
                <div style={header}>
                    <div style={headerContent}>
                        <div style={badge}>FREE PREVIEW</div>
                        <h2 style={title}>{toolName}</h2>
                        <div style={searchPreview}>
                            <Search size={14} style={{ marginRight: '6px' }} />
                            <span>Preview for: <strong>"{mockData.keyword}"</strong> in <strong>"{mockData.location}"</strong></span>
                        </div>
                    </div>
                    <button onClick={onClose} style={closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={content}>
                    {/* Summary Stats */}
                    <div style={statsGrid}>
                        <div style={statCard}>
                            <Users size={20} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                            <div style={statLabel}>Total Found</div>
                            <div style={statValue}>{mockData.totalFound}+</div>
                        </div>
                        <div style={statCard}>
                            <TrendingUp size={20} style={{ color: '#10b981', marginBottom: '8px' }} />
                            <div style={statLabel}>Market Density</div>
                            <div style={statValue}>High</div>
                        </div>
                        <div style={statCard}>
                            <MapPin size={20} style={{ color: '#f59e0b', marginBottom: '8px' }} />
                            <div style={statLabel}>Search Radius</div>
                            <div style={statValue}>5 Miles</div>
                        </div>
                    </div>

                    {/* Top Competitors */}
                    <div style={section}>
                        <h3 style={sectionTitle}>
                            <Trophy size={18} style={{ marginRight: '8px', color: '#f59e0b' }} />
                            Top 3 Competitors (Chicago)
                        </h3>
                        <div style={competitorList}>
                            {mockData.topCompetitors.map((comp, i) => (
                                <div key={i} style={competitorRow}>
                                    <div style={rankBadge}>{i + 1}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={compName}>{comp.name}</div>
                                        <div style={compMeta}>
                                            <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b', marginRight: '4px' }} />
                                            <span>{comp.rating}</span>
                                            <span style={{ color: '#94a3b8', margin: '0 8px' }}>•</span>
                                            <span>{comp.reviews} reviews</span>
                                        </div>
                                    </div>
                                    <div style={hiddenMetric}>SECRET</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div style={section}>
                        <h3 style={sectionTitle}>
                            <Search size={18} style={{ marginRight: '8px', color: '#3b82f6' }} />
                            Sample Insights
                        </h3>
                        <ul style={insightList}>
                            {mockData.insights.map((insight, i) => (
                                <li key={i} style={insightItem}>
                                    <div style={checkDot}></div>
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Blocker Overlay */}
                    <div style={lockOverlay}>
                        <div style={lockContent}>
                            <div style={lockIconCircle}>
                                <Lock size={24} />
                            </div>
                            <h4 style={lockTitle}>Full Report Locked</h4>
                            <p style={lockDesc}>
                                Unlock full competitor insights and AI-powered recommendations with a free account.
                            </p>
                            <div style={ctaGroup}>
                                <button onClick={handleUnlock} style={ctaBtn} className="group">
                                    Unlock Full Reports
                                    <ArrowRight size={18} style={{ marginLeft: '10px' }} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div style={trustText}>No credit card required • Instant access</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const overlay = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px'
};

const modalContainer = {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column'
};

const header = {
    padding: '32px 32px 24px',
    borderBottom: '1px solid #f1f5f9',
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
};

const headerContent = {
    flex: 1
};

const badge = {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.05em',
    marginBottom: '12px'
};

const title = {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.2
};

const searchPreview = {
    display: 'flex',
    itemsCenter: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginTop: '8px'
};

const closeBtn = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '16px',
    transition: 'all 0.2s'
};

const content = {
    padding: '24px 32px 32px',
    overflowY: 'auto',
    position: 'relative'
};

const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '32px'
};

const statCard = {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #f1f5f9',
    textAlign: 'center'
};

const statLabel = {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500'
};

const statValue = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '2px'
};

const section = {
    marginBottom: '32px'
};

const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '16px'
};

const competitorList = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
};

const competitorRow = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #f1f5f9',
    borderRadius: '12px',
};

const rankBadge = {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '14px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px'
};

const compName = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a'
};

const compMeta = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px'
};

const hiddenMetric = {
    fontSize: '10px',
    backgroundColor: '#f1f5f9',
    color: '#cbd5e1',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '700'
};

const insightList = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
};

const insightItem = {
    display: 'flex',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: '#475569',
    lineHeight: 1.5
};

const checkDot = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    marginTop: '8px',
    marginRight: '12px',
    shrink: 0
};

const lockOverlay = {
    marginTop: '8px',
    padding: '40px 32px',
    backgroundColor: '#f8fafc',
    backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 0)',
    backgroundSize: '24px 24px',
    borderRadius: '20px',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
    position: 'relative'
};

const lockContent = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const lockIconCircle = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    color: '#3b82f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
};

const lockTitle = {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 12px'
};

const lockDesc = {
    fontSize: '14px',
    color: '#64748b',
    maxWidth: '380px',
    margin: '0 0 24px',
    lineHeight: 1.5
};

const ctaBtn = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
    width: '100%',
    maxWidth: '300px'
};

const trustText = {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '16px',
    fontWeight: '500'
};

const ctaGroup = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    alignItems: 'center'
};

const secondaryBtn = {
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    maxWidth: '300px'
};

export default ToolPreviewModal;

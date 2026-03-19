import { useState, useEffect } from "react"
import { fetchMyLeads } from "../services/api"
import BrandingPanel from "../components/reports/BrandingPanel"
import ReportPreview from "../components/reports/ReportPreview"
import ActionButtons from "../components/reports/ActionButtons"
import SuccessState from "../components/reports/SuccessState"
import { Sparkles, AlertCircle, RefreshCw, X } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const getToken = () => {
    try {
        const raw = localStorage.getItem("locitra-auth")
        return raw ? JSON.parse(raw)?.state?.token || "" : ""
    } catch { return "" }
}

export default function Reports() {
    const [leads, setLeads] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ companyName: "", customMessage: "", keyword: "dentist", city: "chicago" })
    const [downloading, setDownloading] = useState(null)
    const [error, setError] = useState(null)
    const [reportReady, setReportReady] = useState(false)

    useEffect(() => {
        fetchMyLeads().then(res => {
            if (res.success) {
                const leads = res.data.leads || []
                setLeads(leads)
                if (leads.length > 0) {
                    // Pre-fill with last scan data if any
                    setForm(prev => ({
                        ...prev,
                        keyword: leads[0].keyword || prev.keyword,
                        city: leads[0].city || prev.city
                    }))
                }
            }
            setLoading(false)
        })
    }, [])

    const handleFormChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
        if (reportReady) setReportReady(false)
    }

    const handleDownload = async (format) => {
        setDownloading(format)
        setError(null)
        try {
            const token = getToken()
            const reportId = `${form.keyword.trim().toLowerCase().replace(/\s+/g, '-')}-${form.city.trim().toLowerCase().replace(/\s+/g, '-')}`
            
            const params = new URLSearchParams({
                reportId,
                companyName: form.companyName,
                customMessage: form.customMessage,
                // Backward-compatible keys (backend accepts both)
                company: form.companyName,
                message: form.customMessage,
                keyword: form.keyword,
                city: form.city
            })
            const url = `${API_BASE}/reports/${format}?${params}`

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to generate report" }))
                throw new Error(errorData.message || "Failed to generate report")
            } else {
                const blob = await response.blob()
                const objectUrl = window.URL.createObjectURL(blob)

                // Open in new tab
                window.open(objectUrl, '_blank')

                // Also trigger download
                const a = document.createElement("a")
                a.href = objectUrl
                a.download = `locitra-report-${form.city.toLowerCase()}.${format}`
                document.body.appendChild(a)
                a.click()
                a.remove()
                
                if (format === 'pdf') {
                    setReportReady(true)
                }

                // Small delay before revoking to ensure opener has it
                setTimeout(() => window.URL.revokeObjectURL(objectUrl), 5000)
            }
        } catch (err) {
            console.error("Download error:", err)
            setError(err.message)
        } finally {
            setDownloading(null)
        }
    }

    const reportSlug = `${form.keyword.trim().toLowerCase().replace(/\s+/g, '-')}-${form.city.trim().toLowerCase().replace(/\s+/g, '-')}`
    const shareUrl = `${window.location.origin}/report/${reportSlug}`

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            return true
        } catch (err) {
            console.error("Copy link error:", err)
            setError("Failed to copy link. Please copy it manually.")
            return false
        }
    }

    const sendEmail = async (to) => {
        try {
            const token = getToken()
            const response = await fetch(`${API_BASE}/report/send-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    to,
                    reportUrl: shareUrl,
                    companyName: form.companyName || "Your Agency"
                })
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to send email")
            }
            return true
        } catch (err) {
            console.error("Send email error:", err)
            setError(err.message || "Failed to send email")
            return false
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Waking up Report Engine...</p>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-widest mb-2">
                        <Sparkles className="w-4 h-4" />
                        Conversion Engine
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">White-Label Reports</h1>
                    <p className="text-slate-500 font-medium">Turn raw data into high-converting client presentations.</p>
                </div>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex items-center justify-between animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-900 font-bold">{error}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => handleDownload('pdf')}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                        <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-lg transition-all">
                            <X className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </div>
            )}

            {reportReady ? (
                <div className="max-w-3xl mx-auto">
                    <SuccessState 
                        shareUrl={shareUrl}
                        onDownloadPDF={() => handleDownload('pdf')}
                        onCopyLink={copyToClipboard}
                        onSendEmail={sendEmail}
                    />
                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => setReportReady(false)}
                            className="text-slate-400 font-bold text-xs uppercase hover:text-purple-600 transition-all"
                        >
                            ← Back to Customization
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* LEFT PANEL: Customization */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-2 h-6 bg-purple-600 rounded-full" />
                                Branding Panel
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Acme Marketing"
                                        value={form.companyName}
                                        onChange={(e) => handleFormChange('companyName', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Keyword</label>
                                        <input 
                                            type="text"
                                            value={form.keyword}
                                            onChange={(e) => handleFormChange('keyword', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                        <input 
                                            type="text"
                                            value={form.city}
                                            onChange={(e) => handleFormChange('city', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Custom Message</label>
                                    <textarea 
                                        rows={4}
                                        placeholder="Add a personal touch to this report..."
                                        value={form.customMessage}
                                        onChange={(e) => handleFormChange('customMessage', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>

                            <ActionButtons 
                                onGeneratePDF={() => handleDownload('pdf')}
                                onExportCSV={() => handleDownload('csv')}
                                onCopyLink={copyToClipboard}
                                onSendEmail={sendEmail}
                                downloading={downloading}
                                shareUrl={shareUrl}
                            />
                        </div>

                        {/* Tip Card */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Pro Tip</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Share the public link with your clients for a search-optimized interactive experience. They can view it on mobile and desktop instantly.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Preview */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full lg:sticky lg:top-8">
                        <div className="flex items-center justify-between mb-4 px-4 overflow-hidden">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Live Report Preview
                            </h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">Updates in real-time</div>
                        </div>
                        <ReportPreview form={form} />
                    </div>
                </div>
            )}
        </div>
    )
}

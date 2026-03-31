import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import useAuthStore from "./store/authStore"

import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import LeadGenerator from "./pages/LeadGenerator"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AuthModal from "./components/auth/AuthModal"

// Lazy-load the new SaaS pages (avoids blocking initial load)
import { lazy, Suspense } from "react"
const LeadManager = lazy(() => import("./pages/LeadManager"))
const Outreach = lazy(() => import("./pages/Outreach"))
const Billing = lazy(() => import("./pages/Billing"))
const Reports = lazy(() => import("./pages/Reports"))
const PublicReport = lazy(() => import("./pages/PublicReport"))
const ScanPreview = lazy(() => import("./pages/ScanPreview"))
const LandingPage = lazy(() => import("./pages/LandingPage"))
const Pricing = lazy(() => import("./pages/Pricing"))
const Blog = lazy(() => import("./pages/Blog"))
const Contact = lazy(() => import("./pages/Contact"))
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"))
const Terms = lazy(() => import("./pages/Terms"))
const UseCases = lazy(() => import("./pages/UseCases"))
const AgencyGuide = lazy(() => import("./pages/AgencyGuide"))
const Templates = lazy(() => import("./pages/Templates"))
const OpportunityHeatmap = lazy(() => import("./pages/dashboard/OpportunityHeatmap"))
const GoogleMapsRankChecker = lazy(() => import("./pages/tools/GoogleMapsRankChecker"));
const ToolsHub = lazy(() => import("./pages/tools/ToolsHub"));
const GoogleBusinessAudit = lazy(() => import("./pages/tools/GoogleBusinessAudit"));
const CompetitorFinder = lazy(() => import("./pages/tools/CompetitorFinder"));
const ReviewGapAnalyzer = lazy(() => import("./pages/tools/ReviewGapAnalyzer"));
const OpportunityFinder = lazy(() => import("./pages/tools/OpportunityFinder"));
const RankingSeoPage = lazy(() => import("./pages/tools/RankingSeoPage"));
const WebsitePresenceChecker = lazy(() => import("./pages/tools/WebsitePresenceChecker"));
const WebsitePresenceTool = lazy(() => import("./pages/dashboard/tools/WebsitePresenceTool"));
const MarketGaps = lazy(() => import("./pages/dashboard/MarketGaps"));

/* ── Route guard: redirects to /login if no JWT ─────────── */
function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

/* ── Redirect Handler: Manages post-login tool redirection ── */
function RedirectHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const selectedTool = localStorage.getItem("selectedTool");
    if (selectedTool) {
      localStorage.removeItem("selectedTool");
      // Check if it's the rank checker (handle both slug and direct dash)
      if (selectedTool.includes("rank-checker") || selectedTool.includes("ranking-checker")) {
        navigate("/tools/google-maps-rank-checker", { replace: true });
      } else {
        navigate(`/tools/${selectedTool}`, { replace: true });
      }
    } else {
      navigate("/app", { replace: true });
    }
  }, [navigate]);

  return <div style={{ padding: "40px" }}>Redirecting...</div>;
}

/* ── Public-only route: redirect logged-in users away ────── */
function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <RedirectHandler /> : children
}

const Placeholder = ({ title }) => (
  <div style={{ padding: "40px" }}>
    <h2>{title}</h2>
    <p style={{ color: "#64748b", marginTop: "8px" }}>Coming soon.</p>
  </div>
)

const AdminRoute = lazy(() => import("./components/AdminRoute"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const AdminBlogWriter = lazy(() => import("./pages/AdminBlogWriter"))
const AlertsDashboard = lazy(() => import("./pages/dashboard/AlertsDashboard"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading…</div>}>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/agency-guide" element={<AgencyGuide />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    {/* Free SEO Tools */}
                    <Route path="/tools" element={<ToolsHub />} />
                    <Route path="/tools/google-maps-rank-checker" element={<GoogleMapsRankChecker />} />
                    <Route path="/tools/google-business-profile-audit" element={<GoogleBusinessAudit />} />
                    <Route path="/tools/local-competitor-finder" element={<CompetitorFinder />} />
                    <Route path="/tools/review-gap-analyzer" element={<ReviewGapAnalyzer />} />
                    <Route path="/tools/local-opportunity-finder" element={<OpportunityFinder />} />
                    <Route path="/tools/website-presence" element={<WebsitePresenceChecker />} />
                    <Route path="/tools/google-maps-ranking-checker/:slug" element={<RankingSeoPage />} />
          <Route path="/report/:slug" element={<PublicReport />} />
          <Route path="/scan-preview" element={<ScanPreview />} />

          {/* ── Protected dashboard routes ── */}
          <Route path="/app" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<LeadGenerator />} />
            <Route path="opportunity-heatmap" element={<OpportunityHeatmap />} />
            <Route path="tools/website-presence" element={<WebsitePresenceTool />} />
            <Route path="crm" element={<LeadManager />} />
            <Route path="outreach" element={<Outreach />} />
            <Route path="reports" element={<Reports />} />
            <Route path="billing" element={<Billing />} />
            <Route path="market-gaps" element={<MarketGaps />} />
            <Route path="alerts" element={<AlertsDashboard />} />
          </Route>

          {/* ── Admin Hidden Routes ── */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          <Route path="/admin/blog-writer" element={
            <AdminRoute>
              <AdminBlogWriter />
            </AdminRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/app" replace />} />

        </Routes>
        <AuthModal />
      </Suspense>
    </BrowserRouter>
  )
}

export default App
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

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
const OpportunityHeatmap = lazy(() => import("./pages/dashboard/OpportunityHeatmap"))
const GoogleMapsRankChecker = lazy(() => import("./pages/tools/GoogleMapsRankChecker"));
const ToolsHub = lazy(() => import("./pages/tools/ToolsHub"));
const GoogleBusinessAudit = lazy(() => import("./pages/tools/GoogleBusinessAudit"));
const CompetitorFinder = lazy(() => import("./pages/tools/CompetitorFinder"));
const ReviewGapAnalyzer = lazy(() => import("./pages/tools/ReviewGapAnalyzer"));
const OpportunityFinder = lazy(() => import("./pages/tools/OpportunityFinder"));
const RankingSeoPage = lazy(() => import("./pages/tools/RankingSeoPage"));
const MarketGaps = lazy(() => import("./pages/dashboard/MarketGaps"));

/* ── Route guard: redirects to /login if no JWT ─────────── */
function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

/* ── Public-only route: redirect logged-in users away ────── */
function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/app" replace /> : children
}

const Placeholder = ({ title }) => (
  <div style={{ padding: "40px" }}>
    <h2>{title}</h2>
    <p style={{ color: "#64748b", marginTop: "8px" }}>Coming soon.</p>
  </div>
)

const AdminRoute = lazy(() => import("./components/AdminRoute"))
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"))
const AlertsDashboard = lazy(() => import("./pages/dashboard/AlertsDashboard"))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading…</div>}>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                    {/* Free SEO Tools */}
                    <Route path="/tools" element={<ToolsHub />} />
                    <Route path="/tools/google-maps-rank-checker" element={<GoogleMapsRankChecker />} />
                    <Route path="/tools/google-business-profile-audit" element={<GoogleBusinessAudit />} />
                    <Route path="/tools/local-competitor-finder" element={<CompetitorFinder />} />
                    <Route path="/tools/review-gap-analyzer" element={<ReviewGapAnalyzer />} />
                    <Route path="/tools/local-opportunity-finder" element={<OpportunityFinder />} />
                    <Route path="/tools/google-maps-ranking-checker/:slug" element={<RankingSeoPage />} />
          <Route path="/report/:slug" element={<PublicReport />} />
          <Route path="/scan-preview" element={<ScanPreview />} />

          {/* ── Protected dashboard routes ── */}
          <Route path="/app" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/leads" element={
            <PrivateRoute>
              <Layout>
                <LeadGenerator />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/dashboard/opportunity-heatmap" element={
            <PrivateRoute>
              <Layout>
                <OpportunityHeatmap />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/crm" element={
            <PrivateRoute>
              <Layout>
                <LeadManager />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/outreach" element={
            <PrivateRoute>
              <Layout>
                <Outreach />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/billing" element={
            <PrivateRoute>
              <Layout>
                <Billing />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/dashboard/market-gaps" element={
            <PrivateRoute>
              <Layout>
                <MarketGaps />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/alerts" element={
            <PrivateRoute>
              <Layout>
                <AlertsDashboard />
              </Layout>
            </PrivateRoute>
          } />

          {/* ── Admin Hidden Route ── */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
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
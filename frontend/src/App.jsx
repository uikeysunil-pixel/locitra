import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import useAuthStore from "./store/authStore"

import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import LeadGenerator from "./pages/LeadGenerator"
import Login from "./pages/Login"
import Register from "./pages/Register"

// Lazy-load the new SaaS pages (avoids blocking initial load)
import { lazy, Suspense } from "react"
const LeadManager = lazy(() => import("./pages/LeadManager"))
const Outreach = lazy(() => import("./pages/Outreach"))
const Billing = lazy(() => import("./pages/Billing"))
const Reports = lazy(() => import("./pages/Reports"))
const ScanPreview = lazy(() => import("./pages/ScanPreview"))
const LandingPage = lazy(() => import("./pages/LandingPage"))

/* ── Route guard: redirects to /login if no JWT ─────────── */
function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? children : <Navigate to="/login" replace />
}

/* ── Public-only route: redirect logged-in users away ────── */
function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/" replace /> : children
}

const Placeholder = ({ title }) => (
  <div style={{ padding: "40px" }}>
    <h2>{title}</h2>
    <p style={{ color: "#64748b", marginTop: "8px" }}>Coming soon.</p>
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: "40px" }}>Loading…</div>}>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
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

          <Route path="/gaps" element={
            <PrivateRoute>
              <Layout>
                <Placeholder title="Market Gaps" />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/alerts" element={
            <PrivateRoute>
              <Layout>
                <Placeholder title="Alerts" />
              </Layout>
            </PrivateRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/app" replace />} />

        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
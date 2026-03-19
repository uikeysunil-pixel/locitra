import { Navigate } from "react-router-dom"
import useAuthStore from "../store/authStore"

/**
 * AdminRoute Guard
 * Only allows access if the user is logged in AND has the "admin" role.
 * Otherwise redirects to the dashboard (/app).
 */
const AdminRoute = ({ children }) => {
    const { token, user } = useAuthStore()

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== "admin") {
        console.warn("Unauthorized access attempt to admin area")
        return <Navigate to="/app" replace />
    }

    return children
}

export default AdminRoute

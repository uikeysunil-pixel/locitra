import Sidebar from "./Sidebar"
import CommandPalette from "./ui/CommandPalette"
import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <div style={appLayout}>
            <CommandPalette />
            <Sidebar />
            <div style={mainArea}>
                <main style={content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

const appLayout = { display: "flex" }

const mainArea = {
    marginLeft: "240px",
    width: "calc(100% - 240px)",
    minHeight: "100vh",
    background: "var(--bg, #f0f2f8)"
}

const content = {
    padding: "36px 40px",
    maxWidth: "1300px",
    margin: "0 auto"
}
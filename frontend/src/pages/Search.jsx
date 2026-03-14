import { useState, useEffect } from "react"

import {
    fetchAlerts,
    fetchMarketGaps,
    fetchAdvisor
} from "../services/api"

import PageContainer from "../components/PageContainer"
import AnalysisPanel from "../components/AnalysisPanel"
import ProspectTable from "../components/ProspectTable"
import CompetitionChart from "../components/CompetitionChart"
import AlertsPanel from "../components/AlertsPanel"
import MarketGapPanel from "../components/MarketGapPanel"
import AIAdvisor from "../components/AIAdvisor"
import OpportunityChart from "../components/OpportunityChart"
import RevenueOpportunity from "../components/RevenueOpportunity"
import TopOpportunities from "../components/TopOpportunities"

export default function Search() {


    const [keyword, setKeyword] = useState("")
    const [location, setLocation] = useState("")
    const [loading, setLoading] = useState(false)

    const [data, setData] = useState(null)
    const [alerts, setAlerts] = useState([])
    const [gaps, setGaps] = useState([])
    const [advice, setAdvice] = useState([])
    const [leads, setLeads] = useState([])

    const [recentSearches, setRecentSearches] = useState([])

    useEffect(() => {

        const savedKeyword = localStorage.getItem("lastKeyword")
        const savedLocation = localStorage.getItem("lastLocation")
        const savedData = localStorage.getItem("lastSearchData")

        if (savedKeyword) setKeyword(savedKeyword)
        if (savedLocation) setLocation(savedLocation)
        if (savedData) setData(JSON.parse(savedData))

        const recent = JSON.parse(localStorage.getItem("recentSearches")) || []
        setRecentSearches(recent)

    }, [])

    const handleSearch = async () => {

        if (!keyword || !location) {
            alert("Please enter keyword and location")
            return
        }

        try {

            setLoading(true)

            const response = await fetch(
                `http://localhost:5000/api/search?keyword=${keyword}&location=${location}`
            )

            const dashboardData = await response.json()

            const alertsData = await fetchAlerts()
            const gapsData = await fetchMarketGaps(keyword)

            setData(dashboardData)
            setAlerts(alertsData || [])
            setGaps(gapsData || [])

            if (dashboardData?.marketAnalysis) {

                const advisorData = await fetchAdvisor(
                    dashboardData.marketAnalysis.averageReviews,
                    dashboardData.marketAnalysis.marketDifficulty
                )

                setAdvice(advisorData?.advice || [])
            }

            localStorage.setItem("lastKeyword", keyword)
            localStorage.setItem("lastLocation", location)
            localStorage.setItem("lastSearchData", JSON.stringify(dashboardData))

            let recent = JSON.parse(localStorage.getItem("recentSearches")) || []

            const newSearch = { keyword, location }

            recent = recent.filter(
                s => !(s.keyword === keyword && s.location === location)
            )

            recent.unshift(newSearch)
            recent = recent.slice(0, 5)

            localStorage.setItem("recentSearches", JSON.stringify(recent))
            setRecentSearches(recent)

        } catch (error) {

            console.error("Search failed:", error)

        } finally {

            setLoading(false)

        }

    }

    const scanCity = async () => {

        if (!location) {
            alert("Enter a city first")
            return
        }

        try {

            setLoading(true)

            const response = await fetch(
                `http://localhost:5000/api/scanner/scan-city?city=${location}`
            )

            const result = await response.json()

            setLeads(result?.leads || [])

        } catch (error) {

            console.error("City scan failed:", error)

        } finally {

            setLoading(false)

        }

    }

    return (

        <PageContainer
            title="Market Intelligence"
            subtitle="Analyze local markets and discover SEO opportunities"
        >

            <div style={searchControls}>

                <input
                    placeholder="Business keyword (ex: Dentist)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    style={input}
                />

                <input
                    placeholder="City or location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={input}
                />

                <button onClick={handleSearch} style={button}>
                    {loading ? "Analyzing..." : "Analyze Market"}
                </button>

                <button onClick={scanCity} style={scanButton}>
                    {loading ? "Scanning..." : "Scan Entire City"}
                </button>

            </div>

            {recentSearches.length > 0 && (

                <div style={{ marginBottom: "25px" }}>

                    <strong>Recent Searches:</strong>

                    <div style={recentContainer}>

                        {recentSearches.map((s, i) => (

                            <button
                                key={i}
                                style={recentButton}
                                onClick={() => {
                                    setKeyword(s.keyword)
                                    setLocation(s.location)
                                }}
                            >
                                {s.keyword} — {s.location}
                            </button>

                        ))}

                    </div>

                </div>

            )}

            {data && <AnalysisPanel data={data} />}

            {data?.businesses && (

                <>

                    <section style={section}>
                        <ProspectTable prospects={data.businesses} />
                    </section>

                    <section style={section}>
                        <CompetitionChart businesses={data.businesses} />
                    </section>

                    <section style={section}>
                        <OpportunityChart businesses={data.businesses} />
                    </section>

                    <section style={section}>
                        <TopOpportunities leads={data.businesses} />
                    </section>

                    <section style={section}>
                        <RevenueOpportunity leads={data.businesses} />
                    </section>

                    <section style={section}>
                        <AlertsPanel alerts={alerts} />
                    </section>

                    <section style={section}>
                        <MarketGapPanel gaps={gaps} />
                    </section>

                    <section style={section}>
                        <AIAdvisor advice={advice} />
                    </section>

                </>

            )}

        </PageContainer>

    )


}

const searchControls = {
    display: "flex",
    gap: "12px",
    marginBottom: "20px"
}

const input = {
    padding: "10px 14px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    width: "200px"
}

const button = {
    background: "#6366f1",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
}

const scanButton = {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
}

const recentContainer = {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
}

const recentButton = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#f8fafc",
    cursor: "pointer"
}

const section = {
    marginTop: "40px"
}
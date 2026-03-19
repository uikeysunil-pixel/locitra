import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TrendingUp, MapPin, Zap } from 'lucide-react'

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Static city coordinates mapping
const CITY_COORDS = {
    'Chicago': [41.8781, -87.6298],
    'Dallas': [32.7767, -96.7970],
    'Austin': [30.2672, -97.7431],
    'Houston': [29.7604, -95.3698],
    'New York': [40.7128, -74.0060],
    'Los Angeles': [34.0522, -118.2437],
    'Miami': [25.7617, -80.1918],
    'Seattle': [47.6062, -122.3321],
    'Denver': [39.7392, -104.9903],
    'Atlanta': [33.7490, -84.3880],
    'Phoenix': [33.4484, -112.0740],
    'San Francisco': [37.7749, -122.4194],
    'Boston': [42.3601, -71.0589],
    'Las Vegas': [36.1699, -115.1398],
    'Nashville': [36.1627, -86.7816]
}

const getMarkerIcon = (score) => {
    let color = '#22c55e' // Low (Green)
    if (score >= 70) color = '#ef4444' // High (Red)
    else if (score >= 40) color = '#f59e0b' // Medium (Orange)

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.8);
            box-shadow: 0 0 15px ${color};
            animation: pulse 2s infinite;
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    })
}

export default function MarketOpportunityMap({ gaps, onMarketClick }) {
    if (!gaps || gaps.length === 0) return null

    // Find center of map based on first gap or default to US center
    const defaultCenter = [37.8, -96]
    const center = gaps[0] && CITY_COORDS[gaps[0].city] ? CITY_COORDS[gaps[0].city] : defaultCenter

    return (
        <div style={mapSection}>
            <div style={headerRow}>
                <div>
                    <h3 style={sectionTitle}>Market Opportunity Map</h3>
                    <p style={sectionSub}>Visualize cities with the highest SEO opportunity potential.</p>
                </div>
            </div>

            <div style={mapContainerWrap}>
                <MapContainer 
                    center={center} 
                    zoom={4} 
                    style={mapStyle}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    
                    {gaps.map((gap, idx) => {
                        const coords = CITY_COORDS[gap.city]
                        if (!coords) return null

                        return (
                            <Marker 
                                key={idx} 
                                position={coords} 
                                icon={getMarkerIcon(gap.opportunityScore)}
                                eventHandlers={{
                                    click: () => onMarketClick(gap)
                                }}
                            >
                                <Popup className="custom-popup">
                                    <div style={popupContent}>
                                        <div style={popupHeader}>
                                            <MapPin size={14} color="#6366f1" />
                                            <span style={popupCity}>{gap.city}</span>
                                        </div>
                                        <h4 style={popupIndustry}>{gap.keyword}</h4>
                                        <div style={popupStats}>
                                            <div style={popupStat}>
                                                <span style={popupLabel}>Score</span>
                                                <span style={popupVal(gap.opportunityScore)}>🔥 {gap.opportunityScore}</span>
                                            </div>
                                            <div style={popupStat}>
                                                <span style={popupLabel}>Competition</span>
                                                <span style={popupComp(gap.competitionLevel)}>{gap.competitionLevel}</span>
                                            </div>
                                        </div>
                                        <button 
                                            style={popupBtn}
                                            onClick={() => onMarketClick(gap)}
                                        >
                                            View Target Businesses
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .leaflet-container {
                    background: #0f172a !important;
                }
                .custom-popup .leaflet-popup-content-wrapper {
                    background: #1e293b;
                    color: #fff;
                    border-radius: 12px;
                    padding: 0;
                    border: 1px solid rgba(255,255,255,0.1);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                }
                .custom-popup .leaflet-popup-tip {
                    background: #1e293b;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: 220px !important;
                }
            `}</style>
        </div>
    )
}

const mapSection = {
    marginBottom: "40px"
}

const headerRow = {
    marginBottom: "20px"
}

const sectionTitle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "4px"
}

const sectionSub = {
    fontSize: "14px",
    color: "rgba(255,255,255,0.4)"
}

const mapContainerWrap = {
    height: "450px",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
}

const mapStyle = {
    height: "100%",
    width: "100%"
}

const popupContent = {
    padding: "16px"
}

const popupHeader = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "4px"
}

const popupCity = {
    fontSize: "12px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
}

const popupIndustry = {
    fontSize: "18px",
    fontWeight: "800",
    color: "#fff",
    margin: "0 0 12px 0",
    textTransform: "capitalize"
}

const popupStats = {
    display: "flex",
    gap: "20px",
    marginBottom: "16px"
}

const popupStat = {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
}

const popupLabel = {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase"
}

const popupVal = (score) => ({
    fontSize: "14px",
    fontWeight: "800",
    color: score >= 70 ? "#ef4444" : "#f59e0b"
})

const popupComp = (level) => ({
    fontSize: "14px",
    fontWeight: "800",
    color: level === "Low" ? "#10b981" : "#f59e0b"
})

const popupBtn = {
    width: "100%",
    background: "#6366f1",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "background 0.2s ease"
}

export default function AlertsPanel({ alerts }) {

    if (!alerts || alerts.length === 0) return null

    return (

        <div style={{ marginTop: "40px" }}>

            <h3>🚨 Opportunity Alerts</h3>

            <ul>

                {alerts.map((a, i) => (
                    <li key={i}>
                        {a.name} — Rating {a.rating} | Reviews {a.reviews}
                    </li>
                ))}

            </ul>

        </div>

    )

}
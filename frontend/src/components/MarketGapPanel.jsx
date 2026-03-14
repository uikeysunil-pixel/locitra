export default function MarketGapPanel({ gaps }) {

    if (!gaps || gaps.length === 0) return null

    return (

        <div style={{ marginTop: "40px" }}>

            <h3>📊 Market Gap Detection</h3>

            <table style={tableStyle}>

                <thead style={headerStyle}>
                    <tr>
                        <th style={cell}>Location</th>
                        <th style={cell}>Avg Reviews</th>
                        <th style={cell}>Opportunity</th>
                    </tr>
                </thead>

                <tbody>

                    {gaps.map((g, i) => (

                        <tr key={i} style={rowStyle}>
                            <td style={cell}>{g.location}</td>
                            <td style={cell}>{g.avgReviews}</td>
                            <td style={cell}>{g.opportunity}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>

    )

}

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px"
}

const headerStyle = {
    background: "#f4f4f4"
}

const rowStyle = {
    borderBottom: "1px solid #ddd"
}

const cell = {
    padding: "12px",
    textAlign: "left"
}
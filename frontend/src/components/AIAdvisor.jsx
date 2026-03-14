export default function AIAdvisor({ advice }) {

    if (!advice || advice.length === 0) return null

    return (

        <div style={{ marginTop: "40px" }}>

            <h3>🤖 AI Market Advisor</h3>

            <ul>
                {advice.map((a, i) => (
                    <li key={i}>{a}</li>
                ))}
            </ul>

        </div>

    )

}
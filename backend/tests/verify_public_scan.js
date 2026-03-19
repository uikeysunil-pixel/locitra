const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";
const TEST_PAYLOAD = {
    keyword: "dentist",
    city: "chicago"
};

async function runTests() {
    console.log("🚀 Starting Rank Checker UPGRADE Verification Tests...");

    try {
        // Test 1: Cache Hit Verification
        console.log("\n[Test 1] Verifying MongoDB Cache Source...");
        const res1 = await axios.post(`${BASE_URL}/public-scan`, TEST_PAYLOAD);
        console.log(`Status: ${res1.status}`);
        console.log(`Source: ${res1.data.source}`); // Should be "mongodb-cache"
        if (res1.data.source !== "mongodb-cache") {
            console.error("❌ FAIL: Expected source 'mongodb-cache'");
        } else {
            console.log("✅ PASS: Correctly identified MongoDB cache source.");
        }

        // Test 2: Identical Search Rate Limiting (2 per hour)
        console.log("\n[Test 2] Testing IDENTICAL Search Rate Limiting (limit: 2)...");
        // We already did 1 call above. Let's do 2 more.
        for (let i = 0; i < 2; i++) {
            try {
                process.stdout.write(`Identical Call ${i + 2}... `);
                const res = await axios.post(`${BASE_URL}/public-scan`, TEST_PAYLOAD);
                console.log(`Success (${res.data.source})`);
            } catch (err) {
                if (err.response?.status === 429) {
                    console.log("✅ Blocked as expected on Call 3! (429)");
                    break;
                } else {
                    console.error("❌ Unexpected error:", err.response?.data?.message || err.message);
                }
            }
        }

        // Test 3: Different Search Still Allowed
        console.log("\n[Test 3] Verifying DIFFERENT search is still allowed...");
        try {
            const res3 = await axios.post(`${BASE_URL}/public-scan`, {
                keyword: "lawyer",
                city: "chicago"
            });
            console.log(`Status: ${res3.status}`);
            console.log(`Source: ${res3.data.source}`);
            console.log("✅ PASS: Different search not blocked by identical rate limiter.");
        } catch (err) {
            console.error("❌ FAIL: Different search was blocked:", err.response?.data?.message || err.message);
        }

        console.log("\n🎉 Upgrade Verification complete!");

    } catch (error) {
        console.error("\n❌ Unexpected error:", error.message);
    }
}

runTests();

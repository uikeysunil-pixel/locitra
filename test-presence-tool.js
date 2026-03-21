async function testWebsitePresence() {
    const url = 'http://localhost:5000/api/tools/website-presence';
    const payload = {
        name: 'Starbucks',
        city: 'Chicago'
    };

    try {
        console.log('Testing Website Presence Checker API...');
        console.log('Payload:', payload);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
            console.log('✅ API Test Passed!');
        } else {
            console.log('❌ API Test Failed (success=false)');
        }
    } catch (error) {
        console.error('❌ API Test Failed with error:', error.message);
    }
}

testWebsitePresence();

const plans = {
    free: {
        scansPerDay: 2,
        maxBusinesses: 100
    },
    starter: {
        scansPerDay: 20,
        maxBusinesses: 500
    },
    agency: {
        scansPerDay: Infinity,
        maxBusinesses: 1000
    }
}

module.exports = plans

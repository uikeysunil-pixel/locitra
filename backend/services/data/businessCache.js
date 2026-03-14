const cache = {}

exports.getCache = (key) => cache[key]

exports.setCache = (key, data) => {
    cache[key] = data
}
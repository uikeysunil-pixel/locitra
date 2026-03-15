const models = {}

models.Business = require("./business.model")
models.EnrichmentCache = require("./enrichmentCache.model")
models.Lead = require("./lead.model")
models.ScanCache = require("./scanCache.model")
models.User = require("./user.model")
models.WatchMarket = require("./watchMarket.model")
models.Job = require("./job.model")

module.exports = models

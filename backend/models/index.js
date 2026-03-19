const models = {}

models.Business = require("./business.model")
models.EnrichmentCache = require("./enrichmentCache.model")
models.Lead = require("./lead.model")
models.ScanCache = require("./scanCache.model")
models.User = require("./user.model")
models.ScanLog = require("./scanLog.model")
models.WatchMarket = require("./watchMarket.model")
models.Scan = require("./scan.model")
models.Job = require("./job.model")
models.OpportunityAlert = require("./opportunityAlert.model")

module.exports = models

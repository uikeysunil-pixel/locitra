const express = require("express")
const router = express.Router()
const {
    listWatches,
    addWatch,
    removeWatch,
    triggerProspecting
} = require("../controllers/watchMarket.controller")
const { protect } = require("../middlewares/auth.middleware")

router.use(protect)

router.get("/", listWatches)
router.post("/", addWatch)
router.delete("/:id", removeWatch)
router.post("/run", triggerProspecting)   // manual trigger (or call from cron job)

module.exports = router

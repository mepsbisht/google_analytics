const express = require("express")
const router = express.Router()

const googleAnalyticsController = require("./controllers/googleAnalyticsController")

router.post("/create_ga4_property", googleAnalyticsController.createGa4Property )

router.post("/create_data_stream", googleAnalyticsController.createDataStream)

module.exports = router
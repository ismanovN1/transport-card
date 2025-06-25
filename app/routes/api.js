const express = require("express");
const router = express.Router();
const { getVehicles,getStationCurTable } = require("../controllers/vehicleController");
const { getStations, getRoute } = require("../controllers/stationsController");

router.get("/vehicles", getVehicles);
router.get("/cur-table", getStationCurTable);
router.get("/stations", getStations);
router.get("/route", getRoute);

module.exports = router;

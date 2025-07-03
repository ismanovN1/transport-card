const express = require("express");
const router = express.Router();
const { getVehicles,getStationCurTable } = require("../controllers/vehicleController");
const { getStations, getRoute, fetchStationsRoutes } = require("../controllers/stationsController");
const { getRasp } = require("../controllers/raspController");
const { buildRouteStore } = require("../services/build-route-store");

router.get("/vehicles", getVehicles);
router.get("/cur-table", getStationCurTable);
router.get("/stations", getStations);
router.get("/stations-routes", fetchStationsRoutes);
router.get("/route", getRoute);
router.get("/rasp", getRasp);
router.get("/sync", (req, res) => {
    buildRouteStore()
    res.send('started sync')
});

module.exports = router;

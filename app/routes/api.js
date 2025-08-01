const express = require("express");
const router = express.Router();
const {
  getVehicles,
  getStationCurTable,
} = require("../controllers/vehicleController");
const {
  getStations,
  fetchStationsRoutes,
  fetchRouteStations,
} = require("../controllers/stationsController");
const { getRoutes, getRoutesData } = require("../controllers/routeController");
const { getRasp } = require("../controllers/raspController");
const { buildRouteStore } = require("../services/build-route-store");

router.get("/vehicles", getVehicles);
router.get("/cur-table", getStationCurTable);
router.get("/stations", getStations);
router.get("/stations-routes", fetchStationsRoutes);
router.get("/routes", getRoutes);
router.get("/route-stations", fetchRouteStations);
router.get("/rasp", getRasp);
router.get("/all-routes", getRoutesData);
router.get("/sync", (req, res) => {
  buildRouteStore();
  res.send("started sync");
});

module.exports = router;

const express = require("express");
const StationsBlackList = require("../models/StationsBlackList");
const {
  getCachedStations,
  setCachedStations,
  setCachedRoutesStations,
  setStationsCheckSum,
  setStationsRoutes,
} = require("../cache/memoryCache");
const getStops = require("../services/getStops");
const getChecksum = require("../services/getChecksum");
const { buildRouteStore } = require("../services/build-route-store");
const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    const stationId = req.body.id; // take from form input
    const isExists = await StationsBlackList.findOne({ id: stationId });
    if (isExists) {
      return res
        .status(400)
        .json({ message: "Station already exists in blacklist" });
    }

    let data = getCachedStations();
    if (!data) {
      data = await getStops();
    }

    const station = data?.find?.((st) => String(st.id) === String(stationId));
    if (!station) {
      return res.status(404).json({ message: "Station not found" });
    }

    await StationsBlackList.create(station.properties);
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);

    res.status(201).json({
      message: "Station added to blacklist",
      station: station.properties?.id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read all
router.get("/", async (req, res) => {
  const stations = await StationsBlackList.find();
  res.json(stations);
});

// Read one
router.get("/:id", async (req, res) => {
  try {
    const station = await StationsBlackList.findOne({ id: req.params.id });
    if (!station)
      return res
        .status(404)
        .json({ message: "Station not found in blacklist" });
    res.json(station);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const isExists = await StationsBlackList.findOne({ id: req.params.id });
    if (!isExists) {
      return res.status(400).json({ message: "Station not found" });
    }
    await StationsBlackList.findOneAndDelete({ id: req.params.id });
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);
    res.json({ message: "Station deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

const getStops = require("../services/getStops");
const fs = require("fs/promises");
const path = require("path");
const {
  getStationsRoutes,
  setStationsRoutes,
} = require("../cache/memoryCache");

async function getStations(req, res) {
  try {
    const { refresh } = req.query;
    const stations = await getStops();

    res.json(stations);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function fetchStationsRoutes(req, res) {
  try {
    let data = getStationsRoutes();
    if (!data) {
      const routesPath = path.join(__dirname, "..", "data", "stopsStore.json");
      data = await fs.readFile(routesPath, "utf-8");
      setStationsRoutes(data);
    }

    res.send(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getStations,
  fetchStationsRoutes,
};


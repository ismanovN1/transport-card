const getStops = require("../services/getStops");
const fs = require("fs/promises");
const path = require("path");
const {
  getStationsRoutes,
  setStationsRoutes,
  setCachedStations,
  setCachedRoutesStations,
  getCachedRoutesStations,
} = require("../cache/memoryCache");

async function getStations(req, res) {
  try {
    const { refresh } = req.query;

    let data = setCachedStations();
    if (!data || refresh) {
      data = await getStops();
      setCachedStations(data);
      setCachedRoutesStations(null);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function fetchRouteStations(req, res) {
  try {
    const routesStations = getCachedRoutesStations();

    if (routesStations) return res.send(routesStations);

    let stations = getStationsRoutes();
    if (!stations) {
      stations = await getStops();
      setCachedStations(stations);
    }

    const routesPath = path.join(__dirname, "..", "data", "routesStore.json");
    const routes = await fs.readFile(routesPath, "utf-8");

    const data = JSON.parse(routes).reduce(
      (acc, item) => ({
        ...acc,
        [`${item.mv_id}A`]: item.directions.A.stops.map((s) => ({
          title:
            stations.find((st) => st.id === String(s.st_id))?.properties?.title ||
            "",
          st_id: s.st_id,
        })),
        [`${item.mv_id}B`]: item.directions.B.stops.map((s) => ({
          title:
            stations.find((st) => st.id === s.st_id)?.properties?.title ||
            "",
          st_id: s.st_id,
        })),
      }),
      {}
    );

    setCachedRoutesStations(data);

    res.send(data);
  } catch (error) {
    console.log(error);

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
  fetchRouteStations,
};

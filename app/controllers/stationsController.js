const getStops = require("../services/getStops");
const fs = require("fs/promises");
const path = require("path");

async function getStations(req, res) {
  try {
    const { refresh } = req.query;
    const stations = await getStops();

    res.json(stations);
  } catch (error) {
    res.status(500).json(error);
  }
}

async function getRoute(req, res) {
  try {
    const routesPath = path.join(__dirname, "..", "data", "routesStore.json");
    const data = await fs.readFile(routesPath, "utf-8");

    res.json(
      JSON.parse(data).reduce((acc, item) => {
        return {
          ...acc,
          [`${item.mv_id}A`]: item.directions.A.stops
            .sort((a, b) => (Number(a.order) > Number(b.order) ? 1 : -1))
            .map(({ st_id, title }) => ({ title, st_id })),
          [`${item.mv_id}B`]: item.directions.B.stops
            .sort((a, b) => (Number(a.order) > Number(b.order) ? 1 : -1))
            .map(({ st_id, title }) => ({ title, st_id })),
        };
      }, {})
    );
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getStations,
  getRoute,
};

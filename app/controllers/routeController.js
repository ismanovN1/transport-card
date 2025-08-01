const fs = require("fs/promises");
const path = require("path");
const { setAllRoutes, getAllRoutes } = require("../cache/memoryCache");

async function getRoutes(req, res) {
  try {
    const cachedData = getAllRoutes();

    if (cachedData) {
      return res.json(cachedData);
    }

    const routesPath = path.join(__dirname, "..", "data", "routesStore.json");
    const jsonData = await fs.readFile(routesPath, "utf-8");
    const data = JSON.parse(jsonData).reduce((acc, item) => {
      return {
        ...acc,
        [`${item.mv_id}A`]: {
          type: "Feature",
          id: "routeA-" + item.mv_id,
          properties: {
            mv_id: item.mv_id,
            mr_num: item.mr_num,
            mr_title: item.mr_title,
            length: item.directions.A.stops.reduce(
              (acc, item) => acc + (Number(item.distance) || 0),
              0
            ),
          },
          geometry: {
            type: "LineString",
            coordinates: item.directions.A.geometry,
          },
        },
        [`${item.mv_id}B`]: {
          type: "Feature",
          id: "routeB-" + item.mv_id,
          properties: {
            mv_id: item.mv_id,
            mr_num: item.mr_num,
            mr_title: item.mr_title,
            length: item.directions.B.stops.reduce(
              (acc, item) => acc + (Number(item.distance) || 0),
              0
            ),
          },
          geometry: {
            type: "LineString",
            coordinates: item.directions.B.geometry,
          },
        },
      };
    }, {});

    setAllRoutes(data);

    res.json(data);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
}
async function getRoutesData(req, res) {
  try {

    const routesPath = path.join(__dirname, "..", "data", "routes.json");
    const jsonData = await fs.readFile(routesPath, "utf-8");
   

    res.send(jsonData);
  } catch (error) {
    console.log(error);

    res.status(500).json(error);
  }
}

module.exports = {
  getRoutes,
  getRoutesData
};

let stationsRoutes = null

function setStationsRoutes(data) {
  stationsRoutes = data;
}

function getStationsRoutes() {
  return stationsRoutes;
}

module.exports = {
  getStationsRoutes,
  setStationsRoutes
};

let stationsRoutes = null;

function setStationsRoutes(data) {
  stationsRoutes = data;
}

function getStationsRoutes() {
  return stationsRoutes;
}

let allRoutes = null;

function setAllRoutes(data) {
  allRoutes = data;
}

function getAllRoutes() {
  return allRoutes;
}

let routeStopsDistance = null;

function setRouteStopsDistance(data) {
  routeStopsDistance = data;
}

function getRouteStopsDistance() {
  return routeStopsDistance;
}

module.exports = {
  getStationsRoutes,
  setStationsRoutes,
  getAllRoutes,
  setAllRoutes,
  getRouteStopsDistance,
  setRouteStopsDistance,
};

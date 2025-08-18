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

let stations = null;

function setCachedStations(data) {
  stations = data;
}

function getCachedStations() {
  return stations;
}

let routesStations = null;

function setCachedRoutesStations(data) {
  routesStations = data;
}

function getCachedRoutesStations() {
  return routesStations;
}


let stationsCheckSum = null;

function setStationsCheckSum(data) {
  stationsCheckSum = data;
}

function getStationsCheckSum() {
  return stationsCheckSum;
}

module.exports = {
  getStationsRoutes,
  setStationsRoutes,
  getAllRoutes,
  setAllRoutes,
  getRouteStopsDistance,
  setRouteStopsDistance,
  setCachedStations,
  getCachedStations,
  setCachedRoutesStations,
  getCachedRoutesStations,
  setStationsCheckSum,
  getStationsCheckSum
};

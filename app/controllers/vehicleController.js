const getNariad = require("../services/getNariad");
const getTableCur2 = require("../services/getTableCur2");
const getUnits = require("../services/getUnits");
const getTableAll = require("../services/getTableAll");
const routeNums = require("../data/routeNums.json");
const stationTitles = require("../data/stationTitles.json");
const moment = require("moment-timezone");

const vehicles = new Map();
let stations = new Map();

let lastSyncDate;

async function updateVehiclesStates() {
  lastSyncDate = new Date().valueOf();
  const nariads = await getNariad();
  const units = await getUnits();
  const tableAll = await getTableAll();

  vehicles.clear();
  for (const nariad of nariads) {
    const distance = parseFloat(nariad.nr_pos);
    const key = `${nariad.srv_id}-${nariad.uniqueid}`;
    if (distance >= 0)
      vehicles.set(key, {
        id: key,
        distance,
        mv_id: nariad.mv_id,
        mr_num: routeNums[nariad.mr_id],
        nr_status: nariad.nr_status,
        rl_racetype: nariad.rl_racetype,
      });
  }

  for (const unit of units) {
    const key = `${unit.srv_id}-${unit.uniqueid}`;
    if (!["1", "2", "3"].includes(unit.tt_id)) {
      vehicles.delete(key);
      continue;
    }
    const vehicle = vehicles.get(key);
    if (vehicle) {
      vehicles.set(key, {
        ...vehicle,
        garageNumber: unit.u_garagnum,
        stateNum: unit.u_statenum,
        tt_id: unit.tt_id,
        model: unit.u_model,
        speed: unit.u_speed,
        bearing: unit.u_course,
        syncDate: moment(unit.u_timenav).toISOString(),
      });
    }
  }

  for (const t of tableAll) {
    const key = `${t.srv_id}-${t.uniqueid}`;
    const vehicle = vehicles.get(key);
    const ta_len2target = parseFloat(t.ta_len2target);

    if (
      vehicle &&
      vehicle.rl_racetype === t.rl_racetype &&
      ta_len2target >= 0
    ) {
      if (!moment(vehicle.ta_arrivetime).isAfter(vehicle.syncDate)) continue;
      const distance = vehicle.distance + (ta_len2target || 0);

      vehicles.set(key, {
        ...vehicle,
        nextStops: [
          ...(vehicle.nextStops || []),
          {
            st_id: t.st_id,
            distance,
            ta_arrivetime: moment(t.ta_arrivetime).toISOString(),
          },
        ].sort((a, b) => (a.distance > b.distance ? 1 : -1)),
      });
    }
  }
}

const updateTableCur2 = async () => {
  lastSyncCurTableDate = new Date().valueOf();
  const table = await getTableCur2();

  stations.clear();

  table.forEach((item) => {
    if(Number(item.tc_len2target) === -1) return
    const key = `${item.srv_id}-${item.uniqueid}`;
    const vehicle = vehicles.get(key);
    const station = stations.get(Number(item.st_id)) || {};
    station[item.mr_id] = [
      ...(station[item.mr_id] || []),
      {
        vehicle: vehicle?.stateNum,
        mr_num: vehicle?.mr_num || routeNums[item.mr_id],
        nextStation: stationTitles[vehicle?.nextStops?.[0]?.st_id],
        arrivetime: moment(item.tc_arrivetime).toISOString(),
        tt_id: vehicle?.tt_id,
      },
    ];
    stations.set(Number(item.st_id), station);
  });
};

async function getVehicles(req, res) {
  try {
    if (!lastSyncDate || (new Date().valueOf() - lastSyncDate) / 1000 > 20)
      await updateVehiclesStates();

    res.json(Array.from(vehicles.values()));
  } catch (error) {
    res.status(500).json(error);
  }
}

let lastSyncCurTableDate;

async function getStationCurTable(req, res) {
  try {

    if (vehicles.size < 1) await updateVehiclesStates();
    if (
      stations.size < 1 ||
      !lastSyncCurTableDate ||
      (new Date().valueOf() - lastSyncCurTableDate) / 1000 > 20
    )
      await updateTableCur2();

    const station = stations.get(Number(req.query.st_id));


    res.json(station);
  } catch (e) {
    console.error("refreshVehicles error:", e);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getVehicles,
  getStationCurTable,
};

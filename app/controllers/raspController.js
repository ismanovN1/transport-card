const getRaspVariants = require("../services/getRaspVariants");
const getRaspTime = require("../services/getRaspTime");

const rasps = new Map();
const raspTimes = new Map();

let lastSyncDate;

async function getRasp(req, res) {
  const { mr_id, st_id } = req.query;
  let isUpdated = false;
  try {
    if (
      rasps.size < 0 ||
      !lastSyncDate ||
      (new Date().valueOf() - lastSyncDate) / 1000 > 3600
    ) {
      lastSyncDate = Date.now();
      isUpdated = true;
      const res = await getRaspVariants();
      res.forEach((item) => {
        const rasp = rasps.get(item.mr_id);

        if (
          !rasp ||
          item.rv_startdate > rasp.rv_startdate ||
          (item.rv_startdate === rasp.rv_startdate && item.rv_id > rasp.rv_id)
        )
          rasps.set(Number(item.mr_id), item);
      });
    }

    const rasp = rasps.get(Number(mr_id));
    let raspTime = isUpdated
      ? undefined
      : raspTimes.get(`${rasp?.srv_id}-${rasp?.rv_id}`);
    if (!raspTime) {
      raspTime = await getRaspTime(rasp?.srv_id, rasp?.rv_id);
      raspTimes.set(`${rasp?.srv_id}-${rasp?.rv_id}`, raspTime);
    }

    res.json(
      (raspTime || [])
        .filter((item) => item.st_id == st_id)
        .sort((a, b) => (a.rt_orderby > b.rt_orderby ? 1 : -1))
        .map((item) => Number(item.rt_time))
    );
  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = {
  getRasp,
};

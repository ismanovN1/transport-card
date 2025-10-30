const {
  setStationsRoutes,
  setAllRoutes,
  setStationsCheckSum,
} = require("../cache/memoryCache");
const getMarshVariants = require("./getMarshVariants");
const getMarshes = require("./getMarshes");
const getRaceCard = require("./getRaceCard");
const getRaceCoord = require("./getRaceCoord");
const fs = require("fs");
const path = require("path");

async function buildRouteStore(onSuccess = undefined) {
  console.log(" === START SYNC === ");

  try {
    const routeStore = [];
    const stopsStore = {};
    const marshes = await getMarshes();
    const routes = (await getMarshVariants()).reduce((acc, item) => {
      const lastMv = acc[item.mr_id];
      if (lastMv && lastMv.mv_startdate > item.mv_startdate) {
        return acc;
      }
      return {
        ...acc,
        [item.mr_id]: {
          ...marshes.find((m) => m.mr_id === item.mr_id),
          mv_id: item.mv_id,
          mv_startdate: item.mv_startdate,
        },
      };
    }, {});

    for (const key in routes) {
      const { mv_id, mr_id, mr_num, mr_title, tt_id, mt_id } = routes[key];
      let raceCard;
      let raceCoord;
      await (async () => {
        try {
          raceCard = await getRaceCard(mv_id);
          await new Promise((resolve) => setTimeout(resolve, 1200));
          raceCoord = await getRaceCoord(mv_id);
        } catch (error) {
          try {
            raceCard = await getRaceCard(mv_id);
            await new Promise((resolve) => setTimeout(resolve, 1200));
            raceCoord = await getRaceCoord(mv_id);
          } catch (error) {
            throw new Error("getRaceCard, getRaceCoord -> ERROR");
          }
        }
      })();

      const directions = ["A", "B"];
      const [A, B] = (mr_title || "").split(" - ");
      const mvRoutes = {};

      for (const direction of directions) {
        const drTo = direction === "A" ? A : B;
        let distanceSum = 0;
        const stops = raceCard
          .filter((item) => item.rl_racetype === direction)
          .sort((a, b) => a.rc_orderby - b.rc_orderby)
          .map((item) => {
            stopsStore[item.st_id] = [
              ...(stopsStore[item.st_id] || []),
              {
                mv_id,
                mr_id,
                tt_id,
                mr_num,
                mr_title,
                rl_racetype: direction,
                direction: drTo,
              },
            ];
            const distance = parseFloat(item.rc_distance);
            const distanceToStop = distanceSum + 0;
            distanceSum += distance;
            return {
              order: item.rc_orderby,
              st_id: item.st_id,
              distance,
              isFinal: item.rc_kkp === "E",
              isFirst: item.rc_kkp === "B",
              isControlPoint: item.rc_kp === "1",
              distanceToStop,
            };
          });

        const geometry = raceCoord
          .filter((item) => item.rl_racetype === direction)
          .sort((a, b) => a.rd_orderby - b.rd_orderby)
          .map((item) => [parseFloat(item.rd_long), parseFloat(item.rd_lat)]);

        if (stops.length && geometry.length) {
          mvRoutes[direction] = { stops, geometry };
        }
      }

      routeStore.push({
        mv_id,
        mr_id,
        tt_id,
        mt_id,
        mr_num,
        mr_title,
        directions: mvRoutes,
      });
    }

    if (routeStore) {
      const filePath = path.join(__dirname + "/../data/", "routesStore.json");
      fs.writeFileSync(filePath, JSON.stringify(routeStore, null, 2), "utf-8");
    }

    if (stopsStore) {
      const filePath = path.join(__dirname + "/../data/", "stopsStore.json");
      fs.writeFileSync(filePath, JSON.stringify(stopsStore, null, 2), "utf-8");
      setStationsRoutes(null);
      setAllRoutes(null);
    }

    if (routes) {
      const filePath = path.join(__dirname + "/../data/", "routes.json");
      fs.writeFileSync(
        filePath,
        JSON.stringify(Object.values(routes), null, 2),
        "utf-8"
      );
    }

    onSuccess && onSuccess();
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));

    console.log(
      `✅ routeStore.json создан. Всего маршрутов: ${routeStore.length}`
    );
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  buildRouteStore,
};

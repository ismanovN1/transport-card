const { Parser } = require("xml2js");
const data = require("../data/routeStopsDistanse.json");
module.exports = async function getStops() {
  const myHeaders = new Headers();
  const credentials = Buffer.from(`SOCCRD:100625`).toString("base64");
  myHeaders.append("Authorization", `Basic ${credentials}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    "http://178.205.251.34:8080/kazan/getStops.php",
    requestOptions
  ).then((response) => response.text());

  const parser = new Parser({
    explicitArray: false,
    mergeAttrs: true,
    trim: true,
  });

  const data = (await parser.parseStringPromise(response))?.tbstops?.row || [];

  return data?.map((item) => {
    const { st_long, st_lat, st_id, ok_id, st_title } = item;
    return {
      type: "Feature",
      id: item.st_id,
      geometry: { type: "Point", coordinates: [Number(st_long), Number(st_lat)] },
      properties: {
        title: st_title,
        id: st_id,
        okato: ok_id,
      },
    };
  });
};

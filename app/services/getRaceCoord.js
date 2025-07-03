const { Parser } = require("xml2js");

module.exports = async function getRaceCoord(mv_id) {
  const myHeaders = new Headers();
  const credentials = Buffer.from(`SOCCRD:100625`).toString("base64");
  myHeaders.append("Authorization", `Basic ${credentials}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    "http://178.205.251.34:8080/kazan/getRaceCoord.php?mv_id=" + mv_id,
    requestOptions
  ).then((response) => response.text());

  const parser = new Parser({
    explicitArray: false,
    mergeAttrs: true,
    trim: true,
  });

  const data =
    (await parser.parseStringPromise(response))?.tbracecoord?.row || [];

  return data.sort((a, b) => (a.rd_orderby > b.rd_orderby ? 1 : -1));
};

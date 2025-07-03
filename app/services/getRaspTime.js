const { Parser } = require("xml2js");

module.exports = async function getRaspTime(srv_id, rv_id) {
  const myHeaders = new Headers();
  const credentials = Buffer.from(`SOCCRD:100625`).toString("base64");
  myHeaders.append("Authorization", `Basic ${credentials}`);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `http://178.205.251.34:8080/kazan/getRaspTime.php?srv_id=${Number(
      srv_id || 0
    )}&rv_id=${Number(rv_id || 0)}`,
    requestOptions
  ).then((response) => response.text());

  const parser = new Parser({
    explicitArray: false,
    mergeAttrs: true,
    trim: true,
  });

  const data =
    (await parser.parseStringPromise(response))?.tbrasptime?.row || [];

  return data;
};

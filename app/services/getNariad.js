const { Parser } = require("xml2js");

module.exports =  async function getNariad() {

  const myHeaders = new Headers();
    const credentials = Buffer.from(`SOCCRD:100625`).toString("base64");
    myHeaders.append("Authorization", `Basic ${credentials}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

      const response = await fetch(
      "http://178.205.251.34:8080/kazan/getNariad.php",
      requestOptions
    ).then((response) => response.text());

    const parser = new Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });

    const data = (await parser.parseStringPromise(response))?.tbnariad?.row ||[];

    return data
}

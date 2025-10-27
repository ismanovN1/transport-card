const { getStationsCheckSum } = require("../cache/memoryCache");
const CheckSum = require("../models/CheckSum");
const { buildRouteStore } = require("../services/build-route-store");
const getChecksum = require("../services/getChecksum");
const express = require("express");
const _ = require("lodash");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const checkSumList = await CheckSum.find();

    const list = [
      ...checkSumList,
      {
        tableName: "station",
        value: getStationsCheckSum(),
      },
    ];

    res.json(
      list.reduce((acc, item) => ({ ...acc, [item.tableName]: item.value }), {})
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const checkSum = async () => {
  try {
    const res = await getChecksum();

    const savedCheckSum = await CheckSum.find({
      tableName: "checksum"
    })


    const stringifiedRes = JSON.stringify(res);
    if (!savedCheckSum.length || stringifiedRes !== savedCheckSum[0]?.value) {
      buildRouteStore(() => {
        CheckSum.findOneAndUpdate(
          { tableName: "checksum" },
          { value: stringifiedRes },
          { upsert: true, new: true }
        ).exec();
      });

      console.log("CheckSum updated");
    } else {
      console.log("CheckSum is up to date");
    }
  } catch (error) {
    console.error("Checksum error:", error);
  }
};

module.exports = { router, checkSum };

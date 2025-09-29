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

    const savedCheckSum = await CheckSum.find({}, { _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();

    console.log("Current CheckSum:", res);
    console.log("Saved CheckSum:", savedCheckSum);
    
    if (!savedCheckSum.length || !_.isEqual(res, savedCheckSum)) {
      buildRouteStore(() => {
        CheckSum.deleteMany({});
        CheckSum.insertMany(res);
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

const express = require("express");
const StationsBlackList = require("../models/StationsBlackList");
const {
  getCachedStations,
  setCachedStations,
  setCachedRoutesStations,
  setStationsCheckSum,
  setStationsRoutes,
} = require("../cache/memoryCache");
const getStops = require("../services/getStops");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const stationId = req.body.id;
    const isExists = await StationsBlackList.findOne({ id: stationId });
    if (isExists) {
      return res.render("error", {
        title: "Ошибка",
        message: "Ошибка",
        description: "Указанная остановка уже в черный списке.",
        goTo: "/black-list",
      });
    }

    let data = getCachedStations();
    if (!data) {
      data = await getStops();
    }

    const station = data?.find?.((st) => String(st.id) === String(stationId));
    if (!station) {
      return res.render("error", {
        title: "Ошибка",
        message: "Остановка не найдена",
        description: "Указанная остановка отсутствует в списке остановок.",
        goTo: "/black-list",
      });
    }

    await StationsBlackList.create(station.properties);
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);

    return res.render("success", {
      title: "Успех",
      message: "Остановкa добавлена",
      description: "Остановкa добавлена в черный список.",
      goTo: "/black-list",
      autoRedirect: true,
    });
  } catch (error) {
    res.render("error", {
      title: "Ошибка",
      message: "Ошибка",
      description: error.message || "Unknown Error",
      goTo: "/black-list",
      autoRedirect: false,
    });
  }
});

router.get("/", async (req, res) => {
  const stations = await StationsBlackList.find();
  res.json(stations);
});

router.get("/:id", async (req, res) => {
  try {
    const station = await StationsBlackList.findOne({ id: req.params.id });
    if (!station)
      return res
        .status(404)
        .json({ message: "Station not found in blacklist" });
    res.json(station);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const isExists = await StationsBlackList.findOne({ id: req.params.id });
    if (!isExists) {
      return res.render("error", {
        title: "Ошибка",
        message: "Остановкa не найдена",
        description: "Указанная остановка отсутствует в черный списке.",
        goTo: "/black-list",
      });
    }
    await StationsBlackList.findOneAndDelete({ id: req.params.id });
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);
    res.render("success", {
      title: "Успех",
      message: "Остановкa удалена",
      description: "Остановкa успешно удалена из черный список.",
      goTo: "/black-list",
      autoRedirect: true,
    });
  } catch (error) {
    res.render("error", {
      title: "Ошибка",
      message: "Ошибка",
      description: error.message || "Unknown Error",
      goTo: "/changed-stations",
    });
  }
});

module.exports = router;

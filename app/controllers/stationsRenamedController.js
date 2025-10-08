const express = require("express");
const StationsRenamed = require("../models/StationsRenamed");
const {
  getCachedStations,
  setCachedStations,
  setCachedRoutesStations,
  setStationsCheckSum,
  setStationsRoutes,
} = require("../cache/memoryCache");
const getStops = require("../services/getStops");
const StationsBlackList = require("../models/StationsBlackList");

const router = express.Router();

router.get("/", async (req, res) => {
  let data = getCachedStations();
  if (!data) {
    const blackList = (await StationsBlackList.find()).map((i) => i.id);
    data = (await getStops()).filter((item) => !blackList.includes(item.id));
  }

  const renamed = await StationsRenamed.find();
  const renamedMap = Object.fromEntries(renamed.map((r) => [r.id, r.newTitle]));

  const stations = data.map((st) => ({
    id: st.id,
    title:
      st.properties?.oldTitle ||
      st.properties?.title ||
      st.name ||
      "Без названия",
    newTitle: renamedMap[st.id],
  }));

  res.render("all-stations", { stations });
});

router.get("/changed-stations", async (req, res) => {
  const renamed = await StationsRenamed.find();

  res.render("changed-stations", { stations: renamed });
});

router.get("/update-station", async (req, res) => {
  let data = getCachedStations();
  if (!data) {
    const blackList = (await StationsBlackList.find()).map((i) => i.id);
    data = (await getStops()).filter((item) => !blackList.includes(item.id));
  }

  if (req.query.id) {
    const station = data.find((st) => String(st.id) === req.query.id);
    if (!station) return res.status(404).send("Станция табылмады");

    const renamed = await StationsRenamed.findOne({ id: req.query.id });
    res.render("update-form", {
      station: {
        id: station.id,
        title: station.properties?.title || "Без названия",
        newTitle: renamed?.newTitle,
      },
    });
  } else {
    res.render("update-form", {
      station: { id: "", title: "" },
    });
  }
});

// Жаңарту (id бойынша атауын өзгерту)
router.put("/", async (req, res) => {
  try {
    const { title, id } = req.body;

    let data = getCachedStations();
    if (!data) {
      const blackList = (await StationsBlackList.find()).map((i) => i.id);
      data = (await getStops()).filter((item) => !blackList.includes(item.id));
      setCachedStations(data);
    }

    const isExists = data?.find((item) => String(item.id === String(id)));

    if (!isExists) {
      return res.render("error", {
        title: "Ошибка",
        message: "Остановкa не найдена",
        description: "Указанная остановка отсутствует в списке остановок.",
        goTo: "/update-station",
        autoRedirect: false,
      });
    }

    await StationsRenamed.findOneAndUpdate(
      { id },
      { newTitle: title },
      { upsert: true, new: true }
    );

    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);

    return res.render("success", {
      title: "Успех",
      message: "Остановкa изменена",
      description: "Название остановки успешно изменено.",
      goTo: "/stations",
      autoRedirect: true,
    });
  } catch (error) {
    res.render("error", {
      title: "Ошибка",
      message: "Ошибка",
      description: error?.message || "Unknown error",
      goTo: "/update-station",
      autoRedirect: false,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const isExists = await StationsRenamed.findOne({ id: req.params.id });

    if (!isExists) {
      return res.render("error", {
        title: "Ошибка",
        message: "Остановкa не найдена",
        description: "Указанная остановка отсутствует в списке измененных.",
        goTo: "/changed-stations",
      });
    }
    await StationsRenamed.findOneAndDelete({ id: req.params.id });
    setStationsCheckSum(Math.random().toString(36).substring(2, 15));
    setStationsRoutes(null);
    setCachedRoutesStations(null);
    setCachedStations(null);
    res.render("success", {
      title: "Успех",
      message: "Остановкa удалена",
      description: "Остановкa успешно удалена.",
      goTo: "/changed-stations",
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

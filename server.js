const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./app/routes/api');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone');
const connectDB = require('./db');
const { router: checksumController, checkSum } = require('./app/controllers/checksumController');
const stationsBlackListController = require("./app/controllers/stationsBlackListController");
const StationsBlackList = require("./app/models/StationsBlackList");
const expressLayouts = require("express-ejs-layouts");
const basicAuth = require("express-basic-auth"); 
const stationsRenamedController = require("./app/controllers/stationsRenamedController");

moment.tz.setDefault("Europe/Moscow")

connectDB();

const app = express();
const port = 3001;

const authMiddleware = basicAuth({
  users: { admin: "password123" }, 
  challenge: true,
});


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
app.set("layout", "layout");

app.use(express.urlencoded({ extended: true })); 
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// Routes for rendering pages
app.get("/add-to-black-list", authMiddleware, (req, res) => {
  res.render("form", { title: "Form Page", id: req.query.id || "" });
});
app.get("/black-list", authMiddleware, async (req, res) => {
  const stations = await StationsBlackList.find();
  res.render("info", { stations });
});

app.get("/stations", authMiddleware, async (req, res, next) => {
  req.url = "/";
  stationsRenamedController.handle(req, res, next);
});

app.get("/update-station", authMiddleware, async (req, res, next) => {
  stationsRenamedController.handle(req, res, next);
});

app.get("/changed-stations", authMiddleware, async (req, res, next) => {
  stationsRenamedController.handle(req, res, next);
});

// API
app.use("/control/stations", stationsRenamedController);

app.use('/api', apiRoutes);
app.use('/api/black-list',  stationsBlackListController);
app.use('/api/checksum',  checksumController);

app.listen(port, () => {
  console.log(`🚍 Server running at ${port}`);

  checkSum();
  setInterval(() => {
    checkSum();
  }, 1000 * 60 * 180);
});

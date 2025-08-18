const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./app/routes/api');
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone');
const connectDB = require('./db');
const {router: checksumController, checkSum} = require('./app/controllers/checksumController');
const stationsBlackListController = require("./app/controllers/stationsBlackListController");;
const StationsBlackList = require("./app/models/StationsBlackList");
const expressLayouts = require("express-ejs-layouts");

moment.tz.setDefault("Europe/Moscow")

connectDB();

const app = express();
const port = 3001;

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


app.get("/form", (req, res) => {
  res.render("form", { title: "Form Page" });
});


app.get("/info", async (req, res) => {
  const stations = await StationsBlackList.find();
  res.render("info", { stations });
});

app.use('/api', apiRoutes);
app.use('/api/black-list',  stationsBlackListController);
app.use('/api/checksum',  checksumController);

app.listen(port, () => {
  console.log(`🚍 Server running at ${port}`);

  checkSum();
  setInterval(() => {
    checkSum();
  }, 1000 * 60 * 60);
});

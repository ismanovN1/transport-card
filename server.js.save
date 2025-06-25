const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./app/routes/api');
const cors = require('cors');
const moment = require('moment-timezone');

moment.tz.setDefault("Europe/Moscow")

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRoutes);

app.listen(port, () => {
  console.log(`🚍 Server running at ${port}`);
});

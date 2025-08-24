const express = require('express');
require('dotenv').config();
const app = express();
const path = require("path");
const apiRoutes = require('./routes/index');
const cors = require('cors');




app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', apiRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});


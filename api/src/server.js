const express = require('express');
require('dotenv').config();
const app = express();

const apiRoutes = require('./routes');

app.use(express.json());
app.use('/api', apiRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

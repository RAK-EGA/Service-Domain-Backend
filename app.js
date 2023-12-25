const express = require('express');
const app = express();
const port = 3000;

app.get('/service', (req, res) => {
  res.send('Hello, World! v4');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

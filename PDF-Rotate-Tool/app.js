const express = require('express');

const app = express();
const port = 3040;

app.use(express.static('public')); // 静态文件中间件

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`PDF-Rotate-Tool Server is running on port ${port}`);
});

const express = require('express');
const {PDFDocument, rgb} = require('pdf-lib');
const script = require('./public/script.js');
// 将pdf-lib传递给script.js
script.pdfrotatetool(PDFDocument, rgb);

const app = express();
const port = 3040;

app.use(express.static('public')); // 静态文件中间件

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`PDF-Rotate-Tool Server is running on port ${port}`);
});

const dropArea = document.querySelector('.droparea');
const fileInput = document.getElementById('fileinput');
const selectedFilesInfo = new Set(); // 用于存储已选择文件的信息
const uploadpdfsdict = {}; // 定义对象, 用于实时存储上传的文件信息


function resetSelectedFilesInfo() {
  selectedFilesInfo.clear();
}

function updateloadedpdfsdict()
{
  const nameCells = document.querySelectorAll('.droparea td');
  let filenamelist  = [];
  nameCells.forEach((namecell, index) => {
    filenamelist.push(namecell.textContent);
  });
  Object.entries(uploadpdfsdict).forEach(([key, value]) => {
    if (!filenamelist.includes(key)){
      delete uploadpdfsdict[key];
    }
  });

  return uploadpdfsdict;
}

resetSelectedFilesInfo();

function addfilelist(filename) {
  const listItem = document.createElement('tr');

  // 创建一个包含文件名的<td>元素
  const nameCell = document.createElement('td');
  nameCell.textContent = filename;
  nameCell.style.fontSize = '0.8em';
  nameCell.style.padding = '0px';
  listItem.appendChild(nameCell);

  // 创建一个删除按钮
  const deleteButton = document.createElement('button');
  deleteButton.textContent = '❎';
  deleteButton.style.border = 'none';
  deleteButton.addEventListener('click', function(ev) {
    ev.stopPropagation(); // 阻止事件冒泡
    listItem.remove();
    updateloadedpdfsdict();
    checklistitems();
  });

  // 将删除按钮添加到<tr>元素
  const deleteCell = document.createElement('td');
  deleteCell.appendChild(deleteButton);
  listItem.appendChild(deleteCell);
  dropArea.appendChild(listItem);
  checklistitems();
}

// 检查listItems是否为空, 显示或隐藏相关元素
function checklistitems(){
  const listItems = document.querySelectorAll('.droparea tr');

  if (listItems.length == 0){
    selectpdf.style.display = 'inline';
    note.style.display = 'block';
    resetSelectedFilesInfo();
    uploadpdfsdict = {};
  }
}

function choosepdf() {
  fileInput.click();
  selectpdf.disable = true;
  fileInput.addEventListener('change', (e) => {
    // 判断是否选中文件，是则显示选中的文件名，否则保持原状
    const selectedFiles = e.target.files;
    FileList.innerHTML = '';
    for (let i= 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type === 'application/pdf' && !selectedFilesInfo.has(file.name)){
        selectedFilesInfo.add(file.name);
        addfilelist(file.name);
        uploadpdfsdict[file.name] = file;
        selectpdf.style.display = 'none';
        note.style.display = 'none';
      }
    }
    fileInput.value = '';
  })
}

// 释放文件时触发drop事件
function dropHandler(ev) {
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
  selectpdf.style.display = 'none';
  note.style.display = 'none';
  if (ev.dataTransfer.items) {
    // User DataTransferItemList interface to access the files
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // if dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();
        if (file.type === 'application/pdf' && !selectedFilesInfo.has(file.name)) {
          selectedFilesInfo.add(file.name);
          addfilelist(file.name);
          uploadpdfsdict[file.name] = file;
          selectpdf.style.display = 'none';
          note.style.display = 'none';
        }
      }
    }
  }
}

// 阻止浏览器的默认释放行为
function dragOverHandler(ev) {
  // Prevent default behavior (Prevent file from being opend)
  ev.preventDefault();
}

// 点击按钮选择文件
selectpdf.addEventListener('click', function(ev){
  choosepdf();
  ev.stopPropagation();
});
dropArea.addEventListener('click', choosepdf);

// 拖拽文件至框内
dropArea.addEventListener('dragenter', (ev) => {
  // highlight potential drop target when files enters it
  ev.target.toggleAttribute('over', true);
});

// 拖拽文件离开框内
dropArea.addEventListener('dragleave', (ev) => {
  // highlight potential drop target when files enters it
  ev.target.toggleAttribute('over', false);
});

// 旋转pdf文件
async function pdfrotatetool(pdfLib, rgbLib){
  PDFDocument = pdfLib;
  rgb = rgbLib;

  // 判断是否上传文件
  if (Object.keys(uploadpdfsdict).length == 0){
    alert("请上传PDF文件!");
    return;
  }

  // 打包下载旋转后PDF文件
  var zip = new JSZip();

  // 获取选择的角度并旋转PDF, 逆负顺正
  let selectedOption = rotateselection.options[rotateselection.selectedIndex].value;

  // 确保选择了有效的旋转角度
  if (!selectedOption) {
    alert("请选择旋转角度!");
    return;
  }
  
  // 旋转PDF文件
  for (const key in uploadpdfsdict) {
    const formPdfBytes = await readAsArrayBuffer(uploadpdfsdict[key]);
    const pdfDoc = await PDFLib.PDFDocument.load(formPdfBytes);
    const pages = pdfDoc.getPages();

    for (let i=0; i < pages.length; i++) {

      const page = pages[i];
      // 获取原文件旋转角度
      const originrotationAngle = page.getRotation().angle;

      switch (selectedOption) {
        case "90clockwise":
          await page.setRotation(PDFLib.degrees(originrotationAngle + 90));
          break;
        case "90counterclockwise":
          await page.setRotation(PDFLib.degrees(originrotationAngle - 90));
          break;
        case "rotate180":
          await page.setRotation(PDFLib.degrees(originrotationAngle + 180));
          break;
        case "autorotatelandscape":
          await page.setRotation(PDFLib.degrees(90));
          break;
        case "autorotateportrait":
          await page.setRotation(PDFLib.degrees(0));
          break;
        default:
          alert("选择了无效的旋转角度!");
          return;
    }


    }

    // 将旋转后的PDF添加至ZIP文件中
    const pdfData = await pdfDoc.save();
    zip.file(key, pdfData);
  }
  zip.generateAsync({type:"blob"}).then(function(content) {
    // see FileSaver.js
    saveAs(content, "Rotate-result.zip");
  });
}

// 读取载入文件字节流
function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // 定义读取完成时的回调函数
    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      resolve(arrayBuffer);
    };

    // 定义读取出错时的回调函数
    reader.onerror = (event) => {
      reject(`Error reading file: ${event.target.error}`);
    };

    // 以 ArrayBuffer 格式读取文件内容
    reader.readAsArrayBuffer(file);
  });
}


rotatebtn.addEventListener('click', pdfrotatetool);


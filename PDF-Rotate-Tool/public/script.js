const dropArea = document.querySelector('.droparea');
const fileInput = document.getElementById('fileinput');
const selectedFilesInfo = new Set(); // 用于存储已选择文件的信息

let zip, PDFDocument, rgb, degrees;
// 使用DOMContentLoaded事件确保文档准备好后再执行脚本
document.addEventListener("DOMContentLoaded", function () {
  // 现在可以安全地使用JSZip
  zip = new JSZip();
  const pdfLib = PDFLib;
  PDFDocument = pdfLib.PDFDocument;
  rgb = pdfLib.rgb;
  degrees = pdfLib.degrees;
});

function resetSelectedFilesInfo() {
  selectedFilesInfo.clear();
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
        selectedFilesInfo.add(file);
        addfilelist(file.name);
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
          selectedFilesInfo.add(file);
          addfilelist(file.name);
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

// 旋转PDF
async function rotatepdftool(pdfFile, rotateAngle){
  try{
    // 使用fetch加载PDF文件内容
    const pdfResponse = await fetch(URL.createObjectURL(pdfFile));
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF content');
    }
    const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const [page] = pdfDoc.getPages();
    page.setRotation(degrees(rotateAngle));
  
    // Create a new PDF with the rotated pages
    const pdfBytesRotated = await pdfDoc.save();
    return new Blob([pdfBytesRotated], ), {type: 'application/pdf'};
  }
  catch (error){
    console.error(error);
    throw error;
  }
}

rotatebtn.addEventListener('click', async() => {
  const selectedFiles = fileInput.files;
  for (let i= 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const rotatedFile = await rotatepdftool(file, 90);
    zip.file(file.name, rotatedFile);
  }
  zip.generateAsync({type:'blob'}).then(function(content){
    saveAs(content, "result.zip");
  });
})
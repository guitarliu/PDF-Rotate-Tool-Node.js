const dropArea = document.querySelector('.droparea');
const fileInput = document.getElementById('fileinput');

function addfilelist(filename) {
  const listItem = document.createElement('tr');
  listItem.textContent = filename;
  listItem.style.fontSize = '0.8em';
  listItem.style.padding = '5px';
  dropArea.appendChild(listItem);
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
      addfilelist(file.name);
    }
    fileInput.value = '';
    selectpdf.style.display = 'none';
    note.style.display = 'none';
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
        addfilelist(file.name);
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
selectpdf.addEventListener('click', choosepdf);
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
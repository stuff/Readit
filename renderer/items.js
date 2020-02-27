const fs = require('fs');
const { shell } = require('electron');

let items = document.getElementById('items');

let readerJS;
fs.readFile(`${__dirname}/reader.js`, (err, data) => {
  readerJS = data.toString();
});

exports.storage = JSON.parse(localStorage.getItem('readit-items')) || [];

window.addEventListener('message', (e) => {
  if (e.data.action === 'delete-reader-item') {
    this.delete(e.data.itemIndex);

    e.source.close();
  }
});

exports.delete = (itemIndex) => {
  items.removeChild(items.childNodes[itemIndex]);

  this.storage.splice(itemIndex, 1);

  this.save();

  if (this.storage.length) {
    const newSelectedIndex = itemIndex === 0 ? 0 : itemIndex - 1;
    document
      .getElementsByClassName('read-item')
      [newSelectedIndex].classList.add('selected');
  }
};

exports.getSelectedItem = () => {
  const currentItem = document.getElementsByClassName('read-item selected')[0];

  let itemIndex = 0;
  let child = currentItem;

  while ((child = child.previousSibling) !== null) {
    itemIndex += 1;
  }

  return { node: currentItem, index: itemIndex };
};

exports.save = () => {
  localStorage.setItem('readit-items', JSON.stringify(this.storage));
};

exports.select = (e) => {
  this.getSelectedItem().node.classList.remove('selected');

  e.currentTarget.classList.add('selected');
};

exports.changeSelection = (direction) => {
  const currentItem = this.getSelectedItem();
  console.log(currentItem.node.previousSibling, currentItem.node.nextSibling);
  if (direction === 'ArrowUp' && currentItem.node.previousSibling) {
    currentItem.node.classList.remove('selected');
    currentItem.node.previousSibling.classList.add('selected');
  } else if (direction === 'ArrowDown' && currentItem.node.nextSibling) {
    currentItem.node.classList.remove('selected');
    currentItem.node.nextSibling.classList.add('selected');
  }
};

exports.open = () => {
  if (!this.storage.length) {
    return;
  }

  const selectedItem = this.getSelectedItem();

  const contentUrl = selectedItem.node.dataset.url;

  const readerWin = window.open(
    contentUrl,
    '',
    `
    maxWidth=2000,
    maxHeight=2000,
    width=1200,
    height=800,
    backgroundColor=#DEDEDE,
    nodeIntegration=0,
    contextIsolation=1
  `,
  );

  readerWin.eval(readerJS.replace('{{index}}', selectedItem.index));
};

exports.openNative = () => {
  if (!this.storage.length) {
    return;
  }

  const selectedItem = this.getSelectedItem();

  const contentUrl = selectedItem.node.dataset.url;

  shell.openExternal(contentUrl);
};

exports.addItem = (item, isNew = false) => {
  const itemNode = document.createElement('div');
  itemNode.setAttribute('class', 'read-item');

  itemNode.dataset.url = item.url;

  itemNode.innerHTML = `<img src="${item.screenshot}"><h2>${item.title}</h2>`;

  items.appendChild(itemNode);

  itemNode.addEventListener('click', this.select);
  itemNode.addEventListener('dblclick', this.open);

  if (document.getElementsByClassName('read-item').length === 1) {
    itemNode.classList.add('selected');
  }

  if (isNew) {
    this.storage.push(item);
    this.save();
  }
};

this.storage.forEach((item) => {
  this.addItem(item);
});

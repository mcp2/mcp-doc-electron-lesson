const { ipcRenderer } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

 
	ipcRenderer.send('render-to-main', { "title": "hello","msg":"my-render-to-main" });
  ipcRenderer.on("reply-render-to-main", function (event, {title,msg}) {
    console.log(title,msg);
    setTimeout(()=>event.sender.send("render-to-main",{title:"hello",msg:(+new Date)}),1000);
  });

  ipcRenderer.on("main-to-render", function (event, {title,msg}) {
    console.log(title,msg);
  });

})



 //也可以发送
	// ipcRenderer.send('render-to-main', { "a": 2 });
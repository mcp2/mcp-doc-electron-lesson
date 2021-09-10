
const { ipcRenderer } = require('electron')



ipcRenderer.on('new-client', (event) => {
  const [port] = event.ports
  console.log("3.worker,接收main传入的 port");
  console.log("worker.html", event);
  window.postMessage('main-world-port', "*", event.ports)
})

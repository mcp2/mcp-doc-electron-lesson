const { ipcRenderer } = require('electron')

//申请一个后台的port
console.log("1.app:申请work接入")
ipcRenderer.send('request-worker-channel')

ipcRenderer.once('provide-worker-channel', (event) => {
  console.log("5.app:申请work接入")
  console.log("app.html",event);
  // const [ port ] = event.ports;
  // port.postMessage(21)
  // port.onmessage = (event) => {
  //   console.log('received result:', event.data)
  // }
  window.postMessage('main-world-port', '*', event.ports)

})
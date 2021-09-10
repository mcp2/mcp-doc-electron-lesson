// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')

const path = require('path')
const IS_DEBUG = /--debug/.test(process.argv[2]);


// contextIsolation
app.whenReady().then(async () => {
  //开启一个后台隐藏渲染进程
  const worker = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  await worker.loadFile('./worker.html')

  //页面进程
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  mainWindow.loadFile('./app.html')

  IS_DEBUG && mainWindow.webContents.openDevTools()
  
  ipcMain.on('request-worker-channel', (event) => {
    if (event.senderFrame === mainWindow.webContents.mainFrame) {
      const { port1, port2 } = new MessageChannelMain()
      console.log("2.main:向worker传入port1")
      worker.webContents.postMessage('new-client', null, [port1])
      console.log("4.main:向app传入port2")
      event.senderFrame.postMessage('provide-worker-channel', null, [port2])
    }
  })
})


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})



// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')
const path = require('path')
const IS_DEBUG = /--debug/.test(process.argv[2]);
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js')
    }
  })
  // and load the index.html of the app.
  // mainWindow.loadFile('localhost')
  mainWindow.loadURL('http://i.arlene.com:3333');
  // Open the DevTools.
  IS_DEBUG && mainWindow.webContents.openDevTools()


  ipcMain.on('render-to-main', (event, message) => {
    // console.log(event, message);
    // //直接回消息
    // setTimeout(() => event.reply("reply-render-to-main", { title: "hello reply", msg: (+new Date) }), 1000);
    //   //主动发送消息，mainWindow为窗口句柄
    // mainWindow.webContents.send("main-to-render", { title: "hello main to render", msg: (+new Date) });
    // //通过webContents的id获得实例发送
    // const { webContents } = require('electron')
    // webContents.fromId(mainWindow.webContents.id).send("main-to-render", { title: "hello main to render fromid", msg: (+new Date) })
  })


}

app.whenReady().then(async () => {
  createWindow();
})




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

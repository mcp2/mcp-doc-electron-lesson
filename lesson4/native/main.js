// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')
const path = require('path')
var IS_DEBUG = false;
var IS_INLINE = false

process.argv.forEach((e) => {
  if (e == "--inline") {
    IS_INLINE = true;
  } else if (e == "--debug") {
    IS_DEBUG = true;
  }
})

// var WEB_URL = path.join(process.resourcesPath,"app.asar/lib/index.html");
var WEB_URL = path.join(__dirname, "../../lib/index.html")
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, './preload.js')
    }
  })
  // and load the index.html of the app.
  if (IS_INLINE && IS_DEBUG) {
    WEB_URL = "http://i.arlene.com:3333"
    mainWindow.loadURL(WEB_URL);
  } else if (IS_INLINE) {

    mainWindow.loadFile(WEB_URL)
  } else {

    mainWindow.loadFile(WEB_URL)
  }



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
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

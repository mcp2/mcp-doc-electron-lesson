// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')
const path = require('path');

var IS_DEBUG = false;
var IS_INLINE = false

process.argv.forEach((e) => {
  if (e == "--inline") {
    IS_INLINE = true;
  } else if (e == "--debugs") {
    IS_DEBUG = true;
  }
})

// var WEB_URL = path.join(process.resourcesPath,"app.asar/lib/index.html");
var WEB_URL = "";
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

    var WEB_URL = "http://localhost:4444";
    mainWindow.loadURL(WEB_URL);




  // Open the DevTools.
  IS_DEBUG && mainWindow.webContents.openDevTools()


  // const gitRefreshReply = (event,code) =>{
  //   event.reply("git-refresh-reply",{code})
  // }

  // ipcMain.on('git-refresh', (event, data) => {

  // })

  

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

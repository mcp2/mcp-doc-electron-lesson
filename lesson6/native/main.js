// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')
const path = require('path')
const {gitClone,gitResetHard,gitPull,gitFetch,gitCDWD} = require('./gitUtil')
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


  const gitRefreshReply = (event,msg) =>{
    console.log(msg)
    // event.reply("reply-render-to-main",{title:'git-refresh-reply',msg:(+new Date)})
  }

  ipcMain.on('git-refresh', (event, data) => {
    // console.log(event, data.url);
    gitClone(data.url).then((isCloned)=>{
      if(isCloned){
        gitCDWD()
        .then(gitFetch)
        .then(gitResetHard)
        .then(gitPull)
        .then(()=>{
          gitRefreshReply(event,"success git pull");
        })
      }else{
        gitRefreshReply(event,"success  clone first");
      }
    }).then(result=>{
     
    })
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

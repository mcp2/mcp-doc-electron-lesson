// Modules to control application life and create native browser window

const { BrowserWindow, app, ipcMain, MessageChannelMain } = require('electron')
const path = require('path');
var IS_DEBUG = false;
var IS_INLINE = false
const http = require('http')
const {showNotification}= require('./logUtil')
var fs = require('fs');
var url = require('url');
const hostname = '127.0.0.1'
const port = 4446

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
  // const mainWindow = new BrowserWindow({
  //   width: 1200,
  //   height: 800,
  //   webPreferences: {
  //     nodeIntegration: true,
  //     contextIsolation: true,
  //     preload: path.join(__dirname, './preload.js')
  //   }
  // })
  //   mainWindow.loadFile(WEB_URL)


    const server = http.createServer((req, res) => {

      try {
          var requset_url = req.url;
          if (requset_url === "/favicon.ico") {
              res.statusCode = 200
              res.setHeader('Content-Type', 'text/html;charset=utf-8')
              res.end("0");
              return;
          }
          var strurl = url.parse(requset_url, true).query;
          var msg = strurl.message;
          showNotification("哈利助手",msg);
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json;charset=utf-8')
          res.end(JSON.stringify({code:"000000",
                  data:"hahahaha"
                  }));

      } catch (e) {
          resError(res);
      }
  });
  


   server.listen(port, hostname, () => {
    showNotification("哈利助手",`监控告警服务器运行在 http://${hostname}:${port}/`);
      // console.log(`服务器运行在 http://${hostname}:${port}/`)
  })

  // Open the DevTools.
  // IS_DEBUG && mainWindow.webContents.openDevTools()


  

}

app.whenReady().then(async () => {
  createWindow();
})




app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})




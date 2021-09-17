const { contextBridge } = require('electron')
const { readDirSync,readFileSync } = require('../common/FileUtils')
const { ipcRenderer } = require('electron')
const path = require('path')
contextBridge.exposeInMainWorld('bridge', {
    readDir: (rootDir) => {
        var rootPath = path.join(__dirname, rootDir);
        return readDirSync(rootPath)
    },
    readFile: (relPath) => {
        var absPath = path.join(__dirname,'../../', relPath);
        return readFileSync(absPath)
    },
    refreshDoc:(gitUrl,callback)=>{
        ipcRenderer.send('git-refresh', { "url": gitUrl});
        ipcRenderer.on("git-refresh-reply", function (event, {code}) {
                callback&&callback(code)
          });
    }
})


window.addEventListener('DOMContentLoaded', () => {


});


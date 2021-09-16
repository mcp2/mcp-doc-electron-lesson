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
    refreshDoc:(gitUrl)=>{
        ipcRenderer.send('git-refresh', { "url": gitUrl});
        ipcRenderer.on("git-refresh-reply", function (event, {title,msg}) {
            console.log(title,msg);
            setTimeout(()=>event.sender.send("render-to-main",{title:"hello",msg:(+new Date)}),1000);
          });
    }
})


window.addEventListener('DOMContentLoaded', () => {


});


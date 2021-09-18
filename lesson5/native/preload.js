const { contextBridge } = require('electron')
const { readDirSync, readFileSync, rmdirSync } = require('../common/FileUtils')

const { showNotification } = require("./logUtil");
const { ipcRenderer } = require('electron')


const path = require('path')
contextBridge.exposeInMainWorld('bridge', {
    readDir: (rootDir) => {
        var rootPath = path.join(__dirname, rootDir);
        return readDirSync(rootPath)
    },
    readFile: (relPath) => {
        var absPath = path.join(__dirname, '../../', relPath);
        return readFileSync(absPath)
    },
    refreshDoc: (gitUrl, callback) => {
        ipcRenderer.send('git-refresh', { "url": gitUrl });
        ipcRenderer.on("git-refresh-reply", function (event, { code }) {
            callback && callback(code)
        });
    },
    resetDocEnv: (rootDir) => {
        try {
            var absPath = path.join(__dirname, rootDir);
            rmdirSync(absPath)
            showNotification("重置成功");
        } catch (e) {
            showNotification("重置失败");
        }
    }
})


window.addEventListener('DOMContentLoaded', () => {


});


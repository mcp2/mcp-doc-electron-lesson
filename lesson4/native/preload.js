const { contextBridge } = require('electron')
const { readDirSync,readFileSync } = require('../common/FileUtils')
const { sendEvent, addEvent } = require('../common/EventUtils')
const path = require('path')
contextBridge.exposeInMainWorld('bridge', {
    readDir: (rootDir) => {
        var rootPath = path.join(__dirname, rootDir);
        return readDirSync(rootPath)
    },
    readFile: (relPath) => {
        var absPath = path.join(__dirname,'../../', relPath);
        return readFileSync(absPath)
    }
})


window.addEventListener('DOMContentLoaded', () => {
    addEvent("readDir", (ev) => {
        var rootPath = path.join(__dirname, ev.detail);
        var retPath = readDirSync(rootPath)
        sendEvent("readDirFinished", retPath);
    });

    addEvent("readFile", (ev) => {
        var absPath = path.join(__dirname,'../../', ev.detail);
        var content = readFileSync(absPath)
        sendEvent("readFileFinished", content);
    });

});


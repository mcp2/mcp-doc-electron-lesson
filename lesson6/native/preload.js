const { contextBridge } = require('electron')
const { readDirSync, readFileSync, rmdirSync } = require('../common/FileUtils')

const { showNotification } = require("./logUtil");
const { ipcRenderer } = require('electron')
var {RuniOSSim} = require('./mobile/iOSSimRunner')
const { RunAndroidPhone } = require('./mobile/AndroidPhoneRunner');

const path = require('path')
var previewCodeArray=[];
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
    },
    setPreviewCodeArray:(array)=>{
      
        previewCodeArray=array;
        console.log(previewCodeArray);
    }
})


window.addEventListener('DOMContentLoaded', () => {
    $=require("jquery")
    $(document).on("click",".playCode",function(e){
        let codeIndex = $(this).data("codeindex");
        if(this.innerHTML.toLocaleLowerCase().indexOf("ios")>0){
          RuniOSSim(previewCodeArray[codeIndex]);
        }else if(this.innerHTML.toLocaleLowerCase().indexOf("and")>0){
          RunAndroidPhone(previewCodeArray[codeIndex]);
        }
      });
});


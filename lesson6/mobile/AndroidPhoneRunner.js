var fs = require('fs')
var path = require('path')
var shell = require('shelljs');
var { writeFilePromise } = require("../../common/FileUtils")
var {  androidAppPackage,androidActivityName,androidDocTempPath,androidExternalPath,androidApkFile  } = require('./config')

var AndroidUUID;

var RunAndroidPhone = (runCode) => {
    try {
        checkDeviceOnline().then((devices) => {
            if(devices.length>0){
                AndroidUUID = devices[0].split("\t")[0];
                console.log("获得UUID:",AndroidUUID)
            }
            console.log("准备检查App是否安装");
            return checkAppInfo();
        }).then((appIsInstalled)=>{
            var readyToRunCode = "window.MCP_DOC_EXAMPLE = `" + runCode + "`";
                if(appIsInstalled){
                    console.log(`App已经安装，准备写入生成的代码片段，路径为:${androidDocTempPath},代码片段为:${readyToRunCode}`);
                    if (runCode) {
                        return writeFilePromise(androidDocTempPath, readyToRunCode, "utf8")
                    } else {
                        throw "代码为空，请检查";
                    }
                }else{
                    console.log(`App检测到未安装，先执行安装`);
                    return installApp().then(()=>writeFilePromise(androidDocTempPath, readyToRunCode, "utf8"))
                }
        }).then((path)=>{
          pushFileToDeivce();
        }).then(()=>{
            return restartApp();
        });
    } catch (e) {
        console.error("Android运行程序执行失败...." + e);
    }

}



/**
 * 判断安卓设备是否上线
 */
function checkDeviceOnline() {
    let shellScript = `adb devices`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (!code) {
                let devices = stdout.split('\n');
                if(devices.length>1){
                    devices = devices.slice(1)
                    devices = devices.filter((str)=>{
                        return str.toLowerCase().indexOf("emulat")==-1&&str.toLowerCase().indexOf("device")>-1;
                    })
                    console.log('已连接设备：', devices);
                    resolve(devices);
                } else {
                    throw '暂未连接设备'
                }
                
                
            } else {
                throw new Error('检查Android设备执行失败')
    
            }
        });
    });
}

/**
 * 判断预览应用是否安装
 * @returns boolean
 */
function checkAppInfo() {
    let shellScript = `adb -s ${AndroidUUID}  shell pm list packages ${androidAppPackage}`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (!code) {
                if(stdout.indexOf(androidAppPackage)>-1){
                    resolve(1)
                }else{
                    resolve(0)
                }
            } else {
                throw new Error('检查Android设备执行失败')
            }
        });
    });
}

/**
 * 安装安卓应用 
 */
function installApp() {
    var debugTag = "";
    if(androidApkFile.indexOf("debug")>-1){
        debugTag="-t";
    }

    let shellScript = `adb  -s ${AndroidUUID} install  ${debugTag}  ${androidApkFile}`;
    console.log(shellScript)
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (!code) {
                 resolve()
            } else {
                throw new Error(`安装App失败,请检查配置参数,uuid:${AndroidUUID}, apk路径:${androidApkFile}`);
            }
        });
    });
}

function restartApp() {
   return stopApp().then(()=>startApp())
}

/**
 * 启动应用
 */
function startApp() {
    let shellScript = `adb -s ${AndroidUUID}  shell am start ${androidAppPackage}/${androidActivityName}`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (!code) {
                resolve()
            } else {
                throw new Error('启动App失败')
            }
        });
    });
}



/**
 * 关闭应用
 */
 function stopApp() {
    let shellScript = `adb -s ${AndroidUUID}  shell am force-stop ${androidAppPackage}`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            // if (!code) {
                resolve()
            // } else {
            //     throw new Error('启动App失败')
            // }
        });
    });
}

function pushFileToDeivce(){
    let shellScript = `adb -s ${AndroidUUID}  push ${androidDocTempPath} ${androidExternalPath}`
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if(!code){
                    resolve()
            } else {
                throw new Error('push File到设备上失败')
            }
        });
    });
}

/**
 * 启动！
 */
function runAndroidPreviewApp() {
    if (!isAndroidDeviceOnline()) return;

    if (!isAndroidPreviewAppInstalled('com.mcp.android.hybrid')) return;

    // installAndroidPreviewApp('/Users/jiaoyechenmeng/Downloads/spdb_pmclient_test_debug_V10.8.8_build5.apk');

    startAndroidPreviewApp('com.mcp.android.hybrid', '.DemoActivity');
}





module.exports = {
    RunAndroidPhone
}






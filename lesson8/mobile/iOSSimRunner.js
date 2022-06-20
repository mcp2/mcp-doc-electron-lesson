var fs = require('fs')
var path = require('path')
var shell = require('shelljs');
var { writeFilePromise } = require("../../common/FileUtils")
var {iOSAppName, iOSSimName, iOSScheme, iOSDocTempPath, iOSInstallPackagePath } = require('./config')
var iOSSimUUID, iOSSimRootPath;


var iOSInstallPackagePath = require(__dirname,iOSInstallPackagePath);
var RuniOSSim = (runCode) => {
    try {
        simIsRunning().then((result) => {
            console.log("检测到模拟器启动成功......", result);
            if (setUUID(result)) {//设置如果未成功则抛错
                console.log("检测UUID成功......", iOSSimUUID);
                setAppEnv().then((rootPath) => {
                    if (rootPath) {
                        console.log("APP已安装成功，路径......", rootPath);
                    } else {
                        console.log("APP未安装，先进行安装", rootPath,"安装路径",iOSInstallPackagePath);
                        return installApp().then(
                            () => setAppEnv()
                        );
                    }
                }).then(() => {
                    var simPath = path.join(iOSSimRootPath, iOSDocTempPath);
                    var readyToRunCode = "window.MCP_DOC_EXAMPLE = `" + runCode + "`";
                    console.log(`准备写入生成的代码片段，路径为:${simPath},代码片段为:${readyToRunCode}`);
                    if (runCode) {
                        return writeFilePromise(simPath, readyToRunCode, "utf8")
                    } else {
                        throw "代码为空，请检查";
                    }
                }).then(() => stopApp())
                    .then(() => openUrl())
            }
        }).catch((stderr) => {
            console.log("检测到模拟器还未启动......准备启动");
            launchSim().then(() => {
                console.log("10秒后重新调用启动函数");
                setTimeout(() => RuniOSSim(runCode), 10000);
            })
        });
    } catch (e) {
        console.error("iOS模拟器执行失败...." + e);
    }
}



var simIsRunning = (isLoopCheck = false) => {
    let shellScript = `xcrun simctl list|grep -i '${iOSSimName}.*Booted.*'`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (code) {//已经启动
                reject(stderr)
            } else {//没有启动
                resolve(stdout);
            }
        });
    })
}

var launchSim = () => {
    let shellScript = `xcrun instruments -w '${iOSSimName}'`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            //无论是否启动，都会返回error code ,但是其实是正常的，所以忽略code判断
            // if(code){
            //     throw  new Error('启动模拟器失败',stderr);
            // }else{
            resolve(stdout);
            // }
        });
    })
}

// 获得运行中的模拟器UUID,并获取应用信息
var setUUID = (bootedInfo) => {
    // step1 创建 UUID
    var regex1 = /\((.+?)\)/g;//惰性可分出多个匹配规则
    var n = bootedInfo.match(regex1);
    var n = n.filter((e) => {
        return e.split("-").length > 2
    })
    if (n[0]) {
        iOSSimUUID = n[0].substr(1, n[0].length - 2);
        return true;
    } else {
        throw new Error("没有获取到合法的UUID，请核对信息");
    }
}



var setAppEnv = () => {
    let shellScript = `xcrun simctl appinfo ${iOSSimUUID} '${iOSAppName}'`;
    return new Promise((resolve) => {

        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            //无论是否有对应App信息，都会有返回，然后根据内容判断是否已经安装过
            if (code == 0) {
                var regex1 = /Bundle = \"(.+)\"/g;
                var n = stdout.match(regex1);
                if (n && n.length > 0) {
                    var str2 = n[0].replace("Bundle = \"file:\/\/", "");
                    var rootPath = str2.substring(0, str2.length - 2);
                    iOSSimRootPath = rootPath;
                    resolve(rootPath);
                } else {
                    resolve();
                }
            } else {
                throw new Error("没有获取到合法的App信息");
            }
        });
    })
}

var installApp = () => {
    // xcrun simctl install booted ~/Library/Developer/Xcode/DerivedData/mcphybrid-eoraxjpkegkrfoawwcnnicegpexd/Build/Products/Debug-iphonesimulator/mcphybrid-example.app 
    let shellScript = `xcrun simctl install ${iOSSimUUID} ${iOSInstallPackagePath}`;
    return new Promise((resolve) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            if (code == 0) {//安装成功
                resolve(stdout);
            } else {//安装失败，比如路径问题
                throw new Error("安装app失败,请确认相关配置及路径", iOSInstallPackagePath);
            }
        });
    })
}


var openUrl = () => {
    let shellScript = `xcrun simctl openurl ${iOSSimUUID} '${iOSScheme}'`;
    return new Promise((resolve) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            resolve(stdout);
        });
    })
}

var stopApp = () => {
    let shellScript = `xcrun simctl terminate booted '${iOSAppName}'`;
    return new Promise((resolve) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            resolve(stdout);
        });
    })
}

// var startApp = (callback) => {
//     //采用直接打开
//     let shellScript = `xcrun simctl launch booted '${iOSAppName}'`;
//     return new Promise((resolve) => {
//         shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
//             resolve(stdout);
//         });
//     })
// }

// var isInstalledApp=()=>{
//     // 显示所有的xcrun simctl listapps 0ECA34C9-8531-4BAF-8074-2CDDE6A315C4
//       let shellScript = `xcrun simctl appinfo  ${iOSSimUUID} '${iOSAppName}'`;
// }


//暂时不用
//获取模拟器的内置包路径 模拟器有权限可以读写
// var getSimPath = (runCode)=>{
//     let shellScript = `xcrun simctl get_app_container ${iOSSimUUID} '${iOSAppName}'`;
//     shell.exec(shellScript, { silent: true }, (code, stdout, stderr)=>{
//       if(code==0){
//         iOSSimRootPath=stdout.replace("\n","");
//         // console.log("iOSSimRootPath2222",iOSSimRootPath);
//         // console.log("path.join(iOSSimRootPath,iOSDocTempPath)",path.join(iOSSimRootPath,iOSDocTempPath),runCode)
//         if(runCode) writeToFileSync(path.join(iOSSimRootPath,iOSDocTempPath),"window.MCP_DOC_EXAMPLE = `"+runCode+"`");
//       }else{
//         console.error("没有获得iOS模拟器的根目录")
//       }
//     }); 
//   }
  

module.exports = {
    RuniOSSim
}
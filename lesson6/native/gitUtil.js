const shell = require('shelljs');
const path = require('path');
const { Notification } = require('electron')
const cwd = () => {
    return path.join(__dirname, "../../DocCenter");
}

const gitClone = function (gitUrl) {
    const shellScript = `git clone ${gitUrl} ${cwd()}`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            // 重复下载会报错
            showNotification("fetch",code+":"+stderr+":"+stdout);
            if (!code) {
                resolve(0);
            } else if(stderr.indexOf("already exists")>-1){
                resolve(1)
            }else{
                reject(2);
            }
        });
    })
}

const showNotification = function(title,body){
    new Notification({ title, body }).show()
}

const gitCDWD = function() {
    // const shellScript = `cd ${cwd()}`;




    shell.cd(cwd());
    return new Promise((resolve, reject) => {
        shell.cd(cwd());
        resolve();
        // shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
        //     console.log(code,stdout,stderr);
        //     // if (!code) {
        //     resolve();
        //     // } else {
        //     //     throw new Error('检查Android设备执行失败')

        //     // }
        // });
    })
}


const gitFetch = () => {
    const shellScript = `git fetch --all`;
    
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            showNotification("fetch",code+":"+stderr+":"+stdout);
            
           resolve(0)
        });
    })
}

const gitPull = () => {
    const shellScript = `git pull`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            showNotification("pull",code+":"+stderr+":"+stdout);
           resolve(0)
        });
    })
    
}

const gitResetHard =()=> {
    const shellScript = `git reset --hard origin/master`;
    return new Promise((resolve, reject) => {
        shell.exec(shellScript, { silent: true }, (code, stdout, stderr) => {
            showNotification("reset",code+":"+stderr+":"+stdout);
           resolve(0)
        });
    })
    
}



module.exports = {
    gitClone,gitResetHard,gitPull,gitFetch,gitCDWD
}
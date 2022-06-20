const fs = require("fs");
const nodePath = require("path")
const fse = require('fs-extra')
function _readDirSync(path) {
    var pa = fs.readdirSync(path);
    var files = [];
    pa.forEach(function (ele, index) {
        var info = fs.statSync(path + "/" + ele);
        if (info.isDirectory()) {
            files = files.concat(_readDirSync(path + "/" + ele));
        } else {
            // console.log("file: "+ele);
            files.push(path + "/" + ele);
        }
    })
    return files;
}

function _readFileSync(path) {
    var data = fs.readFileSync(path, { encoding: "utf8" });
    return data;
}


function _rmdirSync (dir) {
    fse.removeSync(dir)
}


var _writeFilePromise = (destPath, content) => {
    return new Promise((resolve) => {
        fs.writeFile(destPath, content, "utf8", (err, data) => {
            if (err) {
                throw `写入文件失败:${err},路径为:${destPath}，内容为:${content}`
            } else {
                resolve(destPath);
            }
        })
    })
}



module.exports = {
    readDirSync: _readDirSync,
    readFileSync:_readFileSync,
    rmdirSync:_rmdirSync,
    deletedirSync:_rmdirSync,
    writeFilePromise:_writeFilePromise
};
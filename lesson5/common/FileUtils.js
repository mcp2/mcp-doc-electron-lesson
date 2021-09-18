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

module.exports = {
    readDirSync: _readDirSync,
    readFileSync:_readFileSync,
    rmdirSync:_rmdirSync,
    deletedirSync:_rmdirSync
};
const { contextBridge } = require('electron')

const readLine = require('readline');
const fs = require('fs');
var { writeFilePromise } = require("../common/FileUtils")

contextBridge.exposeInMainWorld('bridge', {
    analyse: (targetFile, callback) => {
        var lineReader = readLine.createInterface({
            input: fs.createReadStream(targetFile)
        });

        var result = [];
        var startTime = -1;
        var linePtr = 0;
        var linePtrX = 0;
        var linePtrY = 0;
        var nowTime;
        var nowX;
        var nowY;
        lineReader.on('line', function (line) {
            linePtr++;
            if (line.indexOf('ABS_MT_POSITION_X') > -1) {
                var arr = line.split("ABS_MT_POSITION_X");
                var str = arr[0];
                var time = Math.floor(str.substring(str.indexOf("[") + 1, str.indexOf("]")).trim() * 1000);
                if (startTime == -1) {
                    startTime = time;
                    time = 0;
                } else {
                    var lastTime = startTime;
                    startTime = time;
                    time = time - lastTime;
                }
                nowTime = time;
                nowX = parseInt(arr[1].trim(), 16);
                linePtrX = linePtr;

            } else if (line.indexOf('ABS_MT_POSITION_Y') > -1) {
                linePtrY = linePtr;
                if (linePtrY == linePtrX + 1) {
                    var arr = line.split("ABS_MT_POSITION_Y");
                    nowY = parseInt(arr[1].trim(), 16);
                    result.push({ time: nowTime, x: nowX, y: nowY });
                }
            }

        });
        lineReader.on('close', function () {
            var output = "";
            result.forEach(elm => {
                output+="sleep(" + elm.time + ")\n";
                output+="click(" + elm.x + "," + elm.y + ")\n";
            });
            
            writeFilePromise(targetFile+".log",output).then(function(){
                callback(result);
                console.log("close........");
            })
            
        });
    }

})


window.addEventListener('DOMContentLoaded', () => {

});


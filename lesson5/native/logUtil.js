const { Notification } = require('electron')

const showNotification = function(title,body){
    new Notification({ title, body }).show()
}


module.exports = {
    showNotification
}
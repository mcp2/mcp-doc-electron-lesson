const EventUtils = {
    sendEvent:(name,options)=>{
        var ev = new CustomEvent(name, {"detail":options});
        // var ev = document.createEvent('CustomEvent');
        // ev.detail=options||{};
        // ev.initEvent(name, false, true);
        // console.log(ev)
        document.dispatchEvent(ev);
    },
    addEvent:(name,callback)=>{
        document.addEventListener(name,callback);
    }
}

module.exports=EventUtils;
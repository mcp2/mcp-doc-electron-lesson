// Run in Browser
const channel = new MessageChannel()
const port1 = channel.port1
const port2 = channel.port2

port2.postMessage({ question: "21*2=?" })
port2.onmessage=(event)=>{
    console.log("answer is:"+event.data.answer)

}

port1.onmessage=(event)=>{
    console.log(event.data.question)
    port1.postMessage({answer:"42"});
}
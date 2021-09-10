# mcp-doc-electron-lesson

## 介绍

在大前端Hybrid框架的开发过程中，往往需要用到很多原生（Native）的能力。前端童鞋在使用这些原生API的时候，一是没有很好的文档工具，往往需要从什么网站或者一堆文件中搜索出来，二是没有一个很好的原生调试环境去验证，很费时间。其实不仅仅是大前端开发过程中会遇到，其实很多场景都面临跨端调试的痛点，缺乏便利性，因此我希望以这个场景入手，并利用业余时间开发了mcp-doc-electron，希望将阅读文档和调试功能能很好的融合为一体，提升开发体验（DX）。

这个课程会介绍mcp-doc-electron中用到的一些技术及知识点，希望能启发大家也开发一些类似的搞笑（高效）工具。

## 功能

1. Electron打包生成各个客户端版本，用户即开即用
2. 拉取远程markdown文件，解析md文件，生成指定格式
3. 目录跳转功能，快速定位api
4. 代码片段处点击运行，可以直接在模拟器（iOS）或者Android设备上实时看到效果

## 课题大纲

1. 介绍electron架构，主进程渲染进程知识点，通信方式
2. ReactJS+AntDesign+Electron实现客户端界面，以及内部各端的通信研究
3. 启动iOS模拟器和Android模拟器，如何实时同步代码
4. markdown-it的研究

## Lesson1:electron简介

### 1-1. electron架构

electron采用了chrome内核的多进程来榨干系统性能。主要存在主进程和渲染进程。两者之间使用ipc方式通信，渲染进程有时也需要和web前端js相互调用。

![1](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/1.png)



### 1-2. 主进程

主进程负责createWindow,管理窗口，应用开启关闭等管理，属于应用调度的进程，一些通用的功能也可以放在这个进程中处理，可以在main.js(通常electron启动的js)可以活动main的通信句柄

```javascript
const ipcMain = require('electron').ipcMain	
```



### 1-3. 渲染进程

创建一个window就会开启一个渲染进程，就比如chrome中开启一个tab，在操作系统中就会添加对应进程。

1. 渲染进程在创建时可以指定preload.js，并且可以开启node，这样就可以在preload.js中使用require并使用node相关环境指令
```js
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, obj.preload)
      contextIsolation: false, 
    }
  })
```
2. [contextIsolation上下文隔离](https://www.electronjs.org/docs/tutorial/context-isolation)，这个最近版本都是默认开启，在node情况下，preload.js中可以获得js环境中的document和window，但是无法去添加一些参数，比如window.mykey,在web端添加后只能在web端获得，在preload.js中是找不到mykey的，不过强大的electron也提供了扩展方法

```js
const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {}
})

//web端可以调用
window.myAPI.doAThing
```

3. 如果指定contextIsolation为false,则在html端（一般是renderer.js）也可以直接使用require,并且提供了直接扩展window和document的能力,但是官方似乎不希望你这么做，因此我们还是首先考虑默认打开隔离情况下的处理，一般来说preload.js已经够用了
4. contextIsolation为true情况下，可以在preload.js获取`const { ipcRenderer } = require('electron')`,如果false,则web端中的js也可以获得




### 1-4. 主进程渲染进程间通信

#### 主进程发送消息给渲染进程

1. window.webContents.send
2. webContents.fromId([id]).send
3. 监听消息里的参数event:IpcMainEvent直接event.reply
4. event.senderFrame.postMessage   一般使用port时候可以调用这个，否则直接reply即可，其中senderFrame只有主进程可以用，类型为WebFrameMain

#### 渲染进程发消息给主进程

1. ipcRenderer.send 
2. 监听消息里的参数event直接event.sender.send

#### 进程监听消息

ipcMain.on和ipcRenderer.on

#### 代码示例

main.js(主进程的源文件)

```javascript
//获取main进程句柄
const ipcMain = require('electron').ipcMain

//main监听render的消息
ipcMain.on('render-to-main', (event,message) => {
    console.log(event,message);
		//主动发送消息，mainWindow为窗口句柄
    mainWindow.webContents.send("main-to-render",{title:"hello main to render",msg:(+new Date)});
    //通过webContents的id获得实例发送
    const { webContents } = require('electron')
    webContents.fromId(mainWindow.webContents.id).send('hello main to render find', {title:"hello reply",msg:(+new Date)})
    //直接回消息
    setTimeout(()=>event.reply("reply-render-to-main",{title:"hello reply",msg:(+new Date)}),1000);
  })
```

preload.js发送消息,也可以使用同步方法sendSync

```javascript
const { ipcRenderer } = require('electron')
window.addEventListener('DOMContentLoaded', () => {
	ipcRenderer.send('render-to-main', { "title": "hello","msg":"my-render-to-main" });
  ipcRenderer.on("reply-render-to-main", function (event, {title,msg}) {
    console.log(title,msg);
    setTimeout(()=>event.sender.send("render-to-main",{title:"hello",msg:(+new Date)}),1000);
  });
  
  ipcRenderer.on("main-to-render", function (event, {title,msg}) {
    console.log(title,msg);
  });
})
```



## Lesson2:使用messagePorts通信

### 2-1. 什么是messageChannel?

#### 

[MessageChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/MessageChannel)顾名思义，消息通道，可以方便实现消息接收和发送，很多框架也利用它是microTask的调用来实现任务切片，比如我们常用的reactjs的Scheduler就是采用这种方式实现了并发任务可中断的特性（超级牛）

基本用法如下：

```js
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

//如果要延迟监听要配合on+start
port1.on('message', (event) => {
  console.log('from renderer main world:', event.data)
})
port1.start()

```

electron中使用MessageChannel

```javascript
const {MessageChannelMain } = require('electron')
const { port1, port2 } = new MessageChannelMain()
```



### 2-2. 如何利用messagePort连接两个渲染进程

![2](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/2.png)

- 主进程和渲染进程通过IPC通信

- 主进程接收到渲染进程的消息，创建MessageChannel

- 分别将channel的port1和port2发送给work和App进程，注意发送的port方式

- 渲染进程获得port后，可以相互发送消息了



如果要传port，不能使用event.reply,要使用以下方法

```js
 worker.webContents.postMessage('new-client', null, [port1]) //window句柄的webContents发送
 event.senderFrame.postMessage('provide-worker-channel', null, [port2]) //on中的event参数
```

#### 示例：(contextIsolation为false)

主进程main.js

```javascript
 //创建2个window等于2个渲染进程 
 const worker = new BrowserWindow({
    show: false, //这里是隐藏的，会被mainWindow覆盖，等于后台执行
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, //这里是false哦~~~
    }
  })
  await worker.loadFile('./worker.html')

  //页面进程
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,//这里是false哦~~~~
    }
  })
  mainWindow.loadFile('./app.html')


//搭建通信事件
ipcMain.on('request-worker-channel', (event) => {
  if (event.senderFrame === mainWindow.webContents.mainFrame) {
    const { port1, port2 } = new MessageChannelMain()
    console.log("2.main:向worker传入port1")
    worker.webContents.postMessage('new-client', null, [port1]) //worker为windowFrame,port1作为第三个特有参数
    console.log("4.main:向app传入port2")
    event.senderFrame.postMessage('provide-worker-channel', null, [port2]) //注意port2作为第三个特有参数
  }
}) 
```

渲染进程app.html

```html
<script>
const { ipcRenderer } = require('electron')

//申请一个后台的port
console.log("1.app:申请work接入")
ipcRenderer.send('request-worker-channel')

ipcRenderer.once('provide-worker-channel', (event) => {
  console.log("5.app:申请work接入")
  console.log("app.html",event);
  const [ port ] = event.ports;
  port.postMessage(21)
  port.onmessage = (event) => {
    console.log('received result:', event.data)
  }
})
</script>
```

渲染进程worker.html

```html
<script>
const { ipcRenderer } = require('electron')

function doWork(input) {
  return input * 2
}

ipcRenderer.on('new-client', (event) => {
  const [ port ] = event.ports;//第三个参数传过来特有参数
  console.log("3.worker,接收main传入的 port");
  console.log("worker.html",event);
  port.onmessage = (event) => {
    const result = doWork(event.data)
    port.postMessage(result)
  }
})
</script>
```

#### 示例：(contextIsolation为true)

为true的情况下，无法直接require,那我们如何处理？

大致思路 preload的js还是可以使用require的，所以我们要用到preload方式去绑定port, 其次window还是共享的，我们再通过window的postMessage把port传到web端。

主进程main.js，只修改了窗口的参数，通讯不变

```js
const worker = new BrowserWindow({
  show: false,
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true,//或者不设置默认是true
    preload: path.join(__dirname, './worker_preload.js')//增加了preload
  }
})
await worker.loadFile('./worker.html')

const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: true,//或者不设置默认是true
    preload: path.join(__dirname, './app_preload.js')//增加了preload
  }
})
mainWindow.loadFile('./app.html')
```
渲染进程app.html

```html
<script>
  window.onmessage=(event) => {
    console.log(event)
    if (event.source === window && event.data === 'main-world-port') {
      //接收port,然后发送数据
      const [ port ] = event.ports
      port.postMessage(9)
      //接收worker计算的结果
      port.onmessage = (event) => {
        console.log('result is :', event.data)
      }
    }
  }
</script>
```

渲染进程app_preload.js

```js
const { ipcRenderer } = require('electron')
//申请一个后台的port
console.log("1.app:申请work接入")
ipcRenderer.send('request-worker-channel')

ipcRenderer.once('provide-worker-channel', (event) => {
  console.log("5.app:申请work接入")
  //通过window转发port给html端
  window.postMessage('main-world-port', '*', event.ports)
})
```

渲染进程worker.html

```html
<script>
  function doWork(input) {
    return input * 3
  }
  window.onmessage = (event) => {
    if (event.source === window && event.data === 'main-world-port') {
      //接收port
      const [port] = event.ports
      //监听app.html发过来的需要计算的数据，并将结果返回
      port.onmessage=(event)=>{
        const result = doWork(event.data)
        port.postMessage(result)
      }
    }
  }
</script>
```

渲染进程worker_preload.js和app_preload.js差不多，都是转发给自己的window

```javascript
ipcRenderer.on('new-client', (event) => {
  //接收port,并转发给window
  const [port] = event.ports
  console.log("3.worker,接收main传入的 port");
  window.postMessage('main-world-port', "*", event.ports)
})
```



### 2-3.渲染进程和web通信：document的Event机制 

```js
// EventUtils.js
const EventUtils = {
    sendEvent:(name,options)=>{
        var ev = new CustomEvent(name, {"detail":options});
        document.dispatchEvent(ev);
    },
    addEvent:(name,callback)=>{
        document.addEventListener(name,callback);
    }
}

module.exports=EventUtils;

// 接收和发送
EventUtils.addEvent("GET_MARKDOWN_FILE", (ev) => {
  console.log(ev.detail);
});
EventUtils.sendEvent("GET_MARKDOWN_FILE", {msg:"hello"});
```



### 2-4.渲染进程和web通信：contextBridge定义全局变量来传递消息

```js
const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {}
})

//web端可以调用
window.myAPI.doAThing()
```



## Lesson3:实战篇:ReactJS+Electron项目

搭建Re








## 如何调试主进程(main.js)

### 1. VSCode调试

1. 安装debugger for Electron

2. 创建debug类型，选择electron,

3. 修改 .vscode/launch.json,注意type要设置为node,否则无法调试main.js，如果是type为electron,只能调试渲染进程，并且无法修改入口man.js文件。

```json
{
    "version": "0.2.0",
    "configurations": [
      {
        "name": "Debug Main Process",
        "type": "node",
        "request": "launch",
        "cwd": "${workspaceFolder}",
        "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
        "args" : ["."]
      }
    ]
  }
```

4. 如果要调试前端，可以用devtool调试前端

```javascript
mainWindow.webContents.openDevTools()
```

### 2. Chrome调试

package.json的scripts下增加新的命令

```js

"scripts": {
  "start": "electron .",
  "debug": "electron --inspect=5999 ."  
},
```

**--inspect-brk和--inspect的区别在于前者会默认进入主进程，但是这个是electron框架的man.js不是自己的main.js**

启动electron程序

```
npm run debug
```

![image-20200611104414841-2](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/image-20200611104414841-2.png)

打开Chrome，输入框打入"chrome://inspect"

![image-20200611104652015-2](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/image-20200611104652015-2.png)

如果已经开启服务，则会显示在Target，点击inspect

![image-20200611110213637-2](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/image-20200611110213637-2.png)

**注意，开始进入时是找不到main.js的，需要添加源代码的folder,看下图1**

![image-20200611110820570-2](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/image-20200611110820570-2.png)

个人墙裂推荐还是用VS直接调试吧，因为这个前端渲染进程似乎也无法调试到，只能调试主进程







## 问题

### 1. 渲染进程require方法没有找到

原因是因为12版本以后contextIsolation默认为false,所以导致渲染进程的前端是无法使用require等node能力的，所以真的要使用，需要显示设置contextIsolation为false

```js
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: true,
    contextIsolation: false,
  }
})
```


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



## Lesson3:实战篇:文件浏览器

### 代码获取

项目模板关注公众号“二码前端说”，回复“900”。

### 简介

做一个文件阅读器，提供两种web和渲染进程通讯手段（ContextBridge和事件方式，messagePort相关可以看lesson2-2）

__界面__

![image-20210910164954476](/Users/fengc16/Library/Application Support/typora-user-images/image-20210910164954476.png)

__项目目录__

```shell
.
├── assets
│   └── doc
├── lesson3
    ├── common  //electron和web公用的一些工具类和配置
    ├── native // electron端代码
    └── web  //web端代码

```

__主要实现__

框架上利用webpack调试服务器功能，启动本地服务，然后electron直接loadUrl即可，如果是release后，应该是先打包web后然后electron直接打开本地文件即可

要实现读取本地文件，在web端无法读取本地目录系统（某些浏览器应该支持了，但是不通用）。因此利用electron的node能力读取本地文件，然后传给web端，web端展示属性目录，然后点击到树形目录中文件后，发送读取文件指令给electron端，读取系统文件内容后，返回给web端展示。

左边的树形目录采用react-treebeard，UI界面基于antd，通信是基于2-3，2-4的方式做通信

### 核心代码：ContextBridge通信

preload.js 

主要提供2个window.bridge方法readDir和readFile，分别是读取文件夹，遍历下面所有子文件夹的文件，readFile读取file的内容

```javascript
//ContextBridge通信
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('bridge', {
    readDir: (rootDir) => {
        var rootPath = path.join(__dirname, rootDir);
        return readDirSync(rootPath)
    },
    readFile: (relPath) => {
        var absPath = path.join(__dirname,'../../', relPath);
        return readFileSync(absPath)
    }
})
```



App.js(Web端)

读取的是工程目录的assets/doc下的所有文件

```javascript
  readDirByWindow=()=>{
    if (window.bridge) {
      var dirs = window.bridge.readDir("../../assets/doc");
      var list = rebuildListContent(dirs,"/assets/doc");
      var data = formatData(list);
      this.setState({data});
      this.loadType=0;//window方式
    }
  }
```

读取文件并返回内容更新界面

```javascript
  readFile = (relPath) =>{
  		…… ……
     if (window.bridge) {
        var content = window.bridge.readFile(relPath);
        this.setState(() => ({ cursor: content }));
      }
      …… ……
  }
```

不难发现，采用扩展方式相互调用非常简单，代码也相对简洁明了，暂未发现什么副作用，不过可能存在对于window这个全局对象的负担加重和不安全性。

### 核心代码：Event通信

设计4个事件readDir（获取文件夹下的文件列表），readDirFinished（返回文件列表），readFile（请求读取文件内容），readFileFinished（返回文件内容）

preload.js (渲染进程)

 ```javascript
const { sendEvent, addEvent } = require('../common/EventUtils')
//dom加载成功后绑定相关事件
window.addEventListener('DOMContentLoaded', () => {
    addEvent("readDir", (ev) => {
        var rootPath = path.join(__dirname, ev.detail);
        var retPath = readDirSync(rootPath)
        sendEvent("readDirFinished", retPath);
    });

    addEvent("readFile", (ev) => {
        var absPath = path.join(__dirname,'../../', ev.detail);
        var content = readFileSync(absPath)
        sendEvent("readFileFinished", content);
    });

});

 ```

App.js(Web)

```js
componentDidMount() {
    this.initEvent();
  }

//组件加载完成后注册事件
  initEvent = ()=>{
    EventUtils.addEvent("readDirFinished",(ev)=>{
      var list = rebuildListContent(ev.detail,"/assets/doc");
      var data = formatData(list);
      this.setState({data});
      this.loadType=1;//window方式
    });

    EventUtils.addEvent("readFileFinished",(ev)=>{
      this.setState(() => ({ cursor: ev.detail }));
    });
  }
  
  //按钮绑定事件
  readDirByEvent=()=>{
    EventUtils.sendEvent("readDir","../../assets/doc");
  }
  //点击读取文件事件
  readFile = (relPath) =>{
      EventUtils.sendEvent("readFile",relPath);
  }
```

整个Event 机制需要指定完善，还是比较方便的，复杂度和使用MessagePort通信方式差不多



## Lesson4:markdown-it

### 代码获取

项目模板关注公众号“二码前端说”，回复“900”。

### 简介

上一节我们完成了文件列表及展示，但是右边的markdown文件是原始的内容，很不美观，这一杰我们利用markdown-it来转换程我们想要的通用格式

![image-20210914103223368](/Users/fengc16/myworkspace/mcp-doc-electron-lesson/assets/image-20210914103223368.png)

### 课程目标

1. 封装组件CodeParser
2. h2标签作为子菜单提取出来显示在右边菜单，并添加锚点功能
3. code可以单独使用highlight.js做美化
4. 可以在代码处添加运行的按钮，自定义code代码输出
5. 插件扩展开发



### 封装React组件CodeParser

__CodeParser/index.js__

```javascript
export default class CodeParser extends React.Component {
  ………… …………
  ………… …………
  // 1.
  getSnapshotBeforeUpdate(prevProps, prevState) {
    if(this.props.sourceCode!==prevProps.sourceCode){
      this.Parser && this.Parser(this.props.sourceCode)
      return;
    }
    return null;
  }
  ………… …………
	………… …………
	
    componentDidMount() {
        let self = this;
        let codeBlocks = null;
        this.Parser = _.flow(
          // 2.
            MarkDownParser.parse(function (code, lang) {
                if (self.props.codeCallback) {
                    self.props.codeCallback(code, lang);
                }
            }),
            (result) => {
              //3.
                let titleList = window.titleList;
                titleList.forEach(elm => {
                    result = result.replace(elm.content, `${elm.content}<a name='/arlene/doc/${elm.content}'></a>`);
                });
                self.setState({ "mdResult": result })
            },
            () => {
                self.setState({ "codeBlocks": codeBlocks });
            },
            () => {
              //4.
                let titleList = window.titleList;
                let _apiList = titleList.reduce((prev, curr, idx) => {
                    prev.push(<li key={idx} ><a style={{ "color": "#eee", "textOverflow": "ellipsis", "width": "80%", "display": "inline-block", "overflow": "hidden", "whiteSpace": "nowrap", paddingLeft: "15px" }} href={`#/arlene/doc/${curr.content}`}>{`${curr.content}`}</a></li>);
                    return prev;
                }, [])
                this.setState({ "apiList": _apiList })
            }
        );
        this.Parser(this.props.sourceCode)
    }	

		// 5. render省略，可以看源码
}
```

封装的组件，主要分左右2部分，左边显示代码主体内容，右边显示文档中插入锚点(h2标签)的快捷跳转

1. getSnapshotBeforeUpdate：组件被mount后，如果props改变，则会触发该方法，用来替代componentWillUpdate，之前代码只是在didMount里触发了一次parser，之后如果文档列表中来回切换md文件，则不会刷新内容，需要在这里比对下文本内容，如果改变，则主动触发parser。
2. MarkDownParser是内部组件（后面介绍），利用函数式封装了组件，然后用flow来生成从左到右的执行流，最终将结果setState改变状态
3. MarkDownParser在parser过程中，会将h2的所有信息放在全局的window.titleList里，这里就是讲titleList里的内容增加`<a>`的跳转锚点
4. 如3，也是将titleList里的内容加入了点击锚点，这样可以在组件右边点击列表跳转到文档对应内容
5. render相关代码比较简单，可以直接看源码



__CodeParser/MarkDownParser.js__

```javascript
import Markdown from "markdown-it"
import hljs from 'highlight.js';
export default class MarkDownParser {
    ………… …………
    ………… …………
  
    constructor(codeCallback) {
        this.codeIndex = -1;
        var self = this;
        //1.创建Markdown对象
        this.md = Markdown({
            html: true,
            highlight: function (str, lang) {// 2
                if (codeCallback) {
                    codeCallback(str, lang);
                }
                self.codeIndex++;//3
                return `<div style="text-align:right"><span class="playCode" data-type="android" data-codeIndex="${self.codeIndex}">运行Android</span>|<span class="playCode" data-codeIndex="${self.codeIndex}">运行iOS</span></div>` + hljs.highlightAuto(str).value;
            }
        });

        this.md.use(plugin)
    }
  
		static parse(codeCallback) {
        return function (value) {
            // 4
            // var result = md.render(value);
            // 5
            var md = MarkDownParser.of(codeCallback).md;
            // parse出token
            let tokens = md.parse(value, {});
            var inlinePass = false;

            //6. 然后过滤token
            window.titleList = tokens.filter(({ type, tag }) => {
                if (type === "heading_open" && tag === "h2") {
                    inlinePass = true;
                    return false;
                } else if (inlinePass && type === "inline") {
                    return true;
                } else if (type === "heading_close") {
                    inlinePass = false;
                    return false;
                }
            })


            var result = md.renderer.render(tokens, md.options, {});
            return result;
        }
    }
  	………… ………… 
    ………… ………… 
}
```

1. 创建markdown对象，核心对象，负责转换文档，具体使用可以参考markdown-it的文档
2. 当解析文档碰到了代码块__```__就会回调，给外部使用者机会去format他的返回值，此处我添加了2个按钮，提供文档运行android和iOS，并且用highlightjs做了美化后作为最终内容
3. codeIndex用来标记当前是第几个代码块，这样运行时候才可以根据这个index来获取实际运行内容
4. 最直接的调用方式`md.render`就可以得到想要的结果，但是需求里需要提取h2的标签。
5. 其实源代码里render执行了2个步骤，一个是parse来获得token,然后根据tokens调用renderer.render方法来获取最终内容
6. 通过token，进一步去过滤出自己想要的，代码中我提取了h2的tag,你也可以根据你自己的需求去构建数据



App.js中使用

```xml
<CodeParser sourceCode={cursor} codeCallback={(code,lang)=>{console.log(code,lang)}} onComplete={(apis)=>{console.log(apis)}}></CodeParser>
```



### 打包发布

#### 选型electron-builder vs electron-forge

开始的时候使用electron-forge,但是发现引入静态文件不支持模糊匹配，官方文档说会排除devDep的node_modules，但是实际发现还是会引入一些。所以决定尝试使用electron-builder。

#### 打包步骤

__安装__

因为electron-builder最新版本对node有要求，所以降级安装了，可以根据自己node环境来决定

```js
yarn add electron-builder@21.2.0 --dev
```

__文件配置__

package.json下添加build配置

```json
  "scripts":{
    "electron-builder": "electron-builder",
    "pack": "electron-builder --dir", //不打dmg
    "dist": "electron-builder"
  },

	"build": {
    "appId": "com.mcp.doc", //类似bundleID
    "productName": "MCP文档", //产品名称
    "directories": {
      "output": "dist"       //打包后的输出路径
    },
    "files": [            //引入的文件白名单，包括你工程代码
      "./lib/**",
      "./lesson4/**",
      "./assets/**"
    ],
    "mac": {
      "category": "com.mcp.doc", 
      "icon": "assets/app.icns" //mac下的icon配置
    }
  }
```

__icon准备__

png转成icns，就是上面配置的assets/app.icns

1. 1024*1024图片一张（mac最大支持分辨率，可以缩小，但是比例尽量是1:1），假设名字为1.png
2. 创建文件夹pngpic.iconset
3. 执行命令转换尺寸,注意苹果支持的尺寸大小就这几个分辨率

```shell
sips -z 16 16 1.png --out pngpic.iconset/icon_16x16.png 
sips -z 32 32 1.png --out pngpic.iconset/icon_16x16@2x.png 
sips -z 32 32 1.png --out pngpic.iconset/icon_32x32.png 
sips -z 64 64 1.png --out pngpic.iconset/icon_32x32@2x.png 
sips -z 128 128 1.png --out pngpic.iconset/icon_128x128.png 
sips -z 256 256 1.png --out pngpic.iconset/icon_128x128@2x.png 
sips -z 256 256 1.png -- out pngpic.iconset/icon_256x256.png 
sips -z 512 512 1.png --out pngpic.iconset/icon_256x256@2x.png 
sips -z 512 512 1.png --out pngpic.iconset/icon_512x512.png 
sips -z 1024 1024 1.png --out pngpic.iconset/icon_512x512@2x.png
```

4. 生成后可以用“预览”打开相关图片

__执行命令__

```js
yarn run pack //打包
yarn run dist //打包dmg
```





[macOS下png生成icns格式图片](https://www.macappbox.com/a/400.html)

https://github.com/electron-userland/electron-builder

https://www.electron.build/configuration/configuration

https://blog.csdn.net/qq_35432904/article/details/107381278 asar

```js
"build": {
    "productName":"xxxx",		//项目名 这也是生成的exe文件的前缀名
    "appId": "com.xxx.xxxxx",	//包名  
    "copyright":"xxxx",			//版权信息
    "directories": { 			//输出文件夹
      "output": "build"
    }, 
    "nsis": {	//nsis相关配置，打包方式为nsis时生效
      "oneClick": false, 								// 是否一键安装
      "allowElevation": true, 							// 允许请求提升，如果为false，则用户必须使用提升的权限重新启动安装程序。
      "allowToChangeInstallationDirectory": true, 		// 允许修改安装目录
      "installerIcon": "./build/icons/aaa.ico",			// 安装图标
      "uninstallerIcon": "./build/icons/bbb.ico",		//卸载图标
      "installerHeaderIcon": "./build/icons/aaa.ico", 	// 安装时头部图标
      "createDesktopShortcut": true, 					// 创建桌面图标
      "createStartMenuShortcut": true,					// 创建开始菜单图标
      "shortcutName": "xxxx", 							// 图标名称
      "include": "build/script/installer.nsh", 			// 包含的自定义nsis脚本
    },
    "publish": [
      {
        "provider": "generic", 		// 服务器提供商，也可以是GitHub等等
        "url": "http://xxxxx/" 		// 服务器地址
      }
    ],
    "win": {
      "icon": "build/icons/aims.ico",
      "target": [
        {
          "target": "nsis",			//使用nsis打成安装包，"portable"打包成免安装版
          "arch": [
            "ia32",				//32位
            "x64" 				//64位
          ]
        }
      ]
    },
    "mac": {
      "icon": "build/icons/icon.icns"
    },
    "linux": {
      "icon": "build/icons"
    }
  }
```






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

























# 三、jQuery如何发消息给Vue事件

场景里有一个输入框，获取元素后$.val()塞入文案后，提交，始终显示"title未设置"，应该是遗漏了某个事件触发，经过dom分析，发现是input事件丢失，**我采用原始方式trigger,无效**

```javascript
var e = $.Event('keyup');
e.which = 65; 
e.keyCode = 65; 
$(".article-bar__input-box input").trigger(e);
```

继续分析源代码追踪，发现元素上有vue的痕迹。

**vue页面的事件是单独处理事件系统，所以猜测不能采用原始方法操作，换个代码**

```javascript
var evt = document.createEvent("HTMLEvents");
evt.initEvent("input", false, false);
$(".article-bar__input-box input")[0].dispatchEvent(evt);
//或者简易方式
$(".article-bar__input-box input")[0].dispatchEvent(new Event("input"))
```





## iOS模拟器操作

```shell
xcrun simctl list|grep -i 'iPhone.*Booted.*'//模拟器是否启动
xcrun instruments -w 'iPhone SE' //启动模拟器 
xcrun simctl install booted /Users/fengc16/Library/Developer/Xcode/DerivedData/mcphybrid-eoraxjpkegkrfoawwcnnicegpexd/Build/Products/Debug-iphonesimulator/mcphybrid-example.app //安装APP
xcrun simctl uninstall booted <bundle identifer> //卸载应用
xcrun simctl launch booted 'mcp.hybrid.ios.mcphybrid-example' //启动App
xcrun simctl shutdown all//关闭模拟器
xcrun simctl erase $UUID //重置模拟器
xcrun simctl terminate booted <bundle identifer> //关闭应用
```



## Android模拟器操作

```shell
adb install -r (APK路径)//安装apk -r 代表如果apk已安装，重新安装apk并保留数据和缓存文件。apk路径则可以直接将apk文件拖进cmd窗口，记得加空格
adb uninstall （apk包名）//卸载 app 但保留数据和缓存文件：
adb uninstall -k （apk包名） //卸载 app 但保留数据和缓存文件：
adb shell pm clear （apk包名）//清理数据
adb shell am start -n com.helloshan.demo/.MianActivity //启动应用，要知道具体的软件的包名及入口才可以打开。
adb shell am force-stop （apk包名） //停止应用

```







## 问题

### electron安装过慢

```shell
npm config set ELECTRON_MIRROR https://npm.taobao.org/mirrors/electron/
```



​      

# 参考

https://www.jianshu.com/p/5f9027722204  自定义事件的触发dispatchEvent

http://dushusir.com/electron-ipcmain-ipcrenderer/  主进程与渲染进程/主进程与webview通信

https://blog.csdn.net/weixin_46187747/article/details/105396764 //读写文件

https://blog.csdn.net/lb245557472/article/details/89493199/ iOS常用命令

https://www.jianshu.com/p/25b408d2361e iOS命令

https://blog.csdn.net/zhcswlp0625/article/details/53889187 Android常用命令











![image-20210915142455516](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915142455516.png)



![image-20210915142725416](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915142725416.png)



![image-20210915142843084](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915142843084.png)

森林不打狼





打狼打红法

![image-20210915143054719](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915143054719.png)

![image-20210915143118659](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915143118659.png)

![image-20210915143139672](/Users/fengc16/Library/Application Support/typora-user-images/image-20210915143139672.png)


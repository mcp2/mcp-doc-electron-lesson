/*! For license information please see mcp-bank-mp-bridge.dev.js.LICENSE.txt */
!function(e,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.MCPBankH5Bridge=n():e.MCPBankH5Bridge=n()}(self,(function(){return(()=>{"use strict";var __webpack_modules__={"./mcp-h5-bank-bridge/Bridge.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "WebBridge": () => (/* binding */ WebBridge),\n/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./mcp-h5-bank-bridge/utils.js");\n/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constant */ "./mcp-h5-bank-bridge/constant.js");\n/* harmony import */ var _Callback__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Callback */ "./mcp-h5-bank-bridge/Callback.js");\n\n\n\n\nclass WebBridge {\n\n  // var gethybridinfoJson ={\n  //   "moduleName":"basic",\n  //   "featureName": "hybridinfo",\n  //   "methodName":"getAllModuleFeatureMethod",\n  //   "requestData":{\n  //   },\n  //   "responseCallback": "callFromNativehybridlist" //响应方法名\n  //   }\n  //   SPDBHybrid.callNativeMethod(JSON.stringify(gethybridinfoJson));\n\n  static call(options) {\n    let { moduleName, featureName, methodName, requestData, responseCallback } = options;\n    if (!moduleName || !featureName || !methodName || !responseCallback) throw new Error("param is invalid");\n\n    \n    if ((0,_utils__WEBPACK_IMPORTED_MODULE_0__.getOS)() == _constant__WEBPACK_IMPORTED_MODULE_1__.PLATFORM.ANDROID) {\n      //Android\n      if (typeof responseCallback == "function") {\n        const callbackId = _Callback__WEBPACK_IMPORTED_MODULE_2__.Callback.getCallbackId();\n        options[\'callbackId\'] = callbackId;\n        (0,_Callback__WEBPACK_IMPORTED_MODULE_2__.AppCallbackWrap)(callbackId, responseCallback, requestData, false);\n      } else if (typeof responseCallback == "string") {\n        options[\'callbackId\'] = responseCallback;\n        (0,_Callback__WEBPACK_IMPORTED_MODULE_2__.AppCallbackWrap)(responseCallback, window[responseCallback], requestData, true);\n        // Callback.on(callbackId, window[responseCallback], true);\n      }\n\n      if (options.callbackId) {\n        options.responseCallback = options.callbackId;\n      }\n      try {\n        window.SPDBHybrid.callNativeMethod(JSON.stringify(options));\n      } catch (e) {\n        console.error(e)\n      }\n    } else if ((0,_utils__WEBPACK_IMPORTED_MODULE_0__.getOS)() == _constant__WEBPACK_IMPORTED_MODULE_1__.PLATFORM.IOS) {\n      //iOS\n      window.WebViewJavascriptBridge.callHandler(\'callNativeMethod\', options, responseCallback);\n    } else {\n      //其他\n      console.error("No Platform Params is ", options)\n    }\n\n  }\n\n  static register(callbackId, callback, always = false) {\n    _Callback__WEBPACK_IMPORTED_MODULE_2__.Callback.on(callbackId, callback, always);\n  }\n\n  static unregister(callbackId) {\n    _Callback__WEBPACK_IMPORTED_MODULE_2__.Callback.off(callbackId);\n  }\n\n  // static getInstance() {\n  //   if (!this.instance || !(this.instance instanceof WebBridge)) {\n  //     this.instance = new this();\n  //   }\n  //   return this.instance;\n  // }\n\n  static handleCommonCallback(baseReq, requestData) {\n\n    const { success, fail, complete, ...params } = requestData;\n    let responseCallback = (data) => {\n      if (data.responseCode === "mpaas_success") {\n        success && success(data.responseData || {});\n      } else {\n        fail && fail(data);\n      }\n      complete && complete(data);\n    }\n    baseReq.requestData = params;\n    baseReq.responseCallback = responseCallback;\n    WebBridge.call(baseReq);\n  }\n}\n\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (WebBridge);\n\n//# sourceURL=webpack://MCPBankH5Bridge/./mcp-h5-bank-bridge/Bridge.js?')},"./mcp-h5-bank-bridge/Callback.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "AppCallbackWrap": () => (/* binding */ AppCallbackWrap),\n/* harmony export */   "Callback": () => (/* binding */ Callback)\n/* harmony export */ });\nwindow.WebBridge = {};\nlet JSBridgeIndex = 0;\n\nclass Callback {\n\n  static on(callbackId, callback) {\n    window[callbackId] =callback;\n  }\n\n  static off(callbackId) {\n    delete window[callbackId];\n  }\n\n  static getCallbackId() {\n    let callbackId = `JSBRIDGE_CALLBACK_0_${JSBridgeIndex++}`;\n    return callbackId;\n  }\n}\n\n\nlet AppCallbackWrap=(callbackId,callbackFun, always = false) =>{\n\n  let innerCallback = (data={})=>{\n      callbackFun && callbackFun(data);\n      if (!always) {\n        Callback.off(callbackId);\n      }\n  };\n\n  Callback.on(callbackId,innerCallback);\n\n} \n\n\n\n//# sourceURL=webpack://MCPBankH5Bridge/./mcp-h5-bank-bridge/Callback.js?')},"./mcp-h5-bank-bridge/constant.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "PERMISSIONIDS": () => (/* binding */ PERMISSIONIDS),\n/* harmony export */   "PERMISSION_RESULT": () => (/* binding */ PERMISSION_RESULT),\n/* harmony export */   "PLATFORM": () => (/* binding */ PLATFORM)\n/* harmony export */ });\n\nconst PERMISSIONIDS = {\n    ADDRESS_BOOK: "ADDRESS_BOOK",\n    LOCATION: "LOCATION",\n    CAMERA: "CAMERA",\n    MICROPHONE: "MICROPHONE",\n    BLUE_TOOTH: "BLUE_TOOTH",\n    DEVICE_INFO: "DEVICE_INFO",\n    READ_STORAGE: "READ_STORAGE",\n    WRITE_STORAGE: "WRITE_STORAGE",\n    CALENDAR: "CALENDAR",\n    NOTIFICATION: "NOTIFICATION"//通知\n}\n\nconst PERMISSION_RESULT = {\n    NO_ASK: \'NO_ASK\',\n    PERMISSION_GRANTED: \'PERMISSION_GRANTED\',\n    PERMISSION_DENIED: \'PERMISSION_DENIED\'\n}\n\nconst PLATFORM = {\n    IOS: \'iOS\',\n    ANDROID: \'android\',\n    WEB: \'web\',\n}\n\n\n\n\n//# sourceURL=webpack://MCPBankH5Bridge/./mcp-h5-bank-bridge/constant.js?')},"./mcp-h5-bank-bridge/index.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _Bridge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Bridge */ "./mcp-h5-bank-bridge/Bridge.js");\n/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constant */ "./mcp-h5-bank-bridge/constant.js");\n\n\n\nconst handlePermission = (permissionIds) => {\n  return new Promise(async (resolve, reject) => {\n    try {\n      await checkPermissions(permissionIds);\n      resolve(1);\n    } catch (error) {\n      try {\n        await requestPermission(permissionIds);\n        resolve(1);\n      } catch (error) {\n        reject(error)\n      }\n    }\n  });\n}\n\nconst goAppSettings = () => {\n  const baseReq = {\n    "moduleName": "permission",\n    "featureName": "managePermission",\n    "methodName": "goAppSettings",\n  }\n\n  const requestData = {\n    success: function (data) {\n      console.log("goAppSettings success", JSON.stringify(data))\n    },\n    fail: function (data) {\n      console.log("goAppSettings fail", JSON.stringify(data))\n    },\n    complete: function (data) {\n      console.log("goAppSettings complete", JSON.stringify(data))\n    }\n  }\n\n  _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n}\n\nconst requestPermission = (permissionId) => {\n  return new Promise((resolve, reject) => {\n    const baseReq = {\n      "moduleName": "permission",\n      "featureName": "managePermission",\n      "methodName": "requestPermissions",\n    }\n\n    const requestData = {\n      "permissionIds": [permissionId],\n      success: function (data) {\n        const result = data;\n        if (result[permissionId] == _constant__WEBPACK_IMPORTED_MODULE_1__.PERMISSION_RESULT.PERMISSION_GRANTED) {\n          //授权成功\n          resolve({ errCode: 1, errMsg: \'获取权限成功\' });\n        } else if (result[permissionId] == _constant__WEBPACK_IMPORTED_MODULE_1__.PERMISSION_RESULT.NO_ASK) {\n          //授权失败，且下次不再询问\n          if (confirm(\'当前暂无相关权限，是否前往设置进行授权？\')) {\n            //跳转设置\n            goAppSettings()\n          } else {\n            reject({ errCode: 3, errMsg: \'获取权限失败：\' + _constant__WEBPACK_IMPORTED_MODULE_1__.PERMISSION_RESULT.NO_ASK })\n          }\n        } else {\n          //授权失败\n          reject({ errCode: 2, errMsg: \'获取权限失败：\' + _constant__WEBPACK_IMPORTED_MODULE_1__.PERMISSION_RESULT.PERMISSION_DENIED })\n        }\n      },\n      fail: function (data) {\n        console.log("requestPermission fail", JSON.stringify(data))\n        reject({ errCode: 0, errMsg: \'获取权限失败\' })\n      },\n      complete: function (data) {\n        console.log("requestPermission complete", JSON.stringify(data))\n      }\n    }\n\n    _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n  })\n}\n\nconst checkPermissions = (permissionId) => {\n  return new Promise((resolve, reject) => {\n    const baseReq = {\n      "moduleName": "permission",\n      "featureName": "managePermission",\n      "methodName": "checkPermissions",\n    }\n\n    const requestData = {\n      permissionIds: [permissionId],\n      success: function (data) {\n        const result = data;\n        if (result[permissionId] === \'true\' || result[permissionId] === true) {\n          //已授权\n          resolve({ errCode: 1, errMsg: \'已授权\' })\n        } else {\n          //无权限\n          reject({ errCode: 2, errMsg: \'无权限\' });\n        }\n      },\n      fail: function (data) {\n        //权限检测失败\n        console.log("checkPermissions fail", JSON.stringify(data))\n        reject({ errCode: 0, errMsg: \'权限检查失败\' });\n      },\n      complete: function (data) {\n        console.log("checkPermissions complete", JSON.stringify(data))\n      }\n    }\n\n    _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n  });\n}\n\nwindow.pf = {};\nwindow.pf.getLocation = async function (requestData) {\n\n  try {\n    await handlePermission(_constant__WEBPACK_IMPORTED_MODULE_1__.PERMISSIONIDS.LOCATION);\n  } catch (error) {\n    if (requestData && requestData.fail) {\n      requestData.fail({ responseCode: error.errCode, errorMsg: error.errMsg });\n    }\n    return;\n  }\n\n  const baseReq = {\n    "moduleName": "basic",\n    "featureName": "location",\n    "methodName": "getLocation",\n  }\n\n  _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n}\n\nwindow.pf.toastTest = function (requestData) {\n  const baseReq = {\n    moduleName: "UI",\n    featureName: "Toast",\n    methodName: "show",\n  }\n\n  _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n}\n\nwindow.pf.getToken = function (requestData) {\n  const baseReq = {\n    moduleName: "UserInfo",\n    featureName: "Token",\n    methodName: "getToken",\n  }\n\n  _Bridge__WEBPACK_IMPORTED_MODULE_0__.WebBridge.handleCommonCallback(baseReq, requestData)\n}\n\n//# sourceURL=webpack://MCPBankH5Bridge/./mcp-h5-bank-bridge/index.js?')},"./mcp-h5-bank-bridge/utils.js":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{eval('__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "getOS": () => (/* binding */ getOS)\n/* harmony export */ });\n/* harmony import */ var _constant__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constant */ "./mcp-h5-bank-bridge/constant.js");\n\n\n\n/**\n * @Desc 判断是什么客户端\n *\n * @return {string} 返回客户端类型\n */\nconst getOS = () => {\n    let client = \'\';\n    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {\n        //判断iPhone|iPad|iPod|iOS\n        client = _constant__WEBPACK_IMPORTED_MODULE_0__.PLATFORM.IOS;\n    } else if (/(Android)/i.test(navigator.userAgent)) {\n        //判断Android\n        client = _constant__WEBPACK_IMPORTED_MODULE_0__.PLATFORM.ANDROID;\n    } else {\n        client = _constant__WEBPACK_IMPORTED_MODULE_0__.PLATFORM.WEB;\n    }\n    return client;\n};\n\n//# sourceURL=webpack://MCPBankH5Bridge/./mcp-h5-bank-bridge/utils.js?')}},__webpack_module_cache__={};function __webpack_require__(e){var n=__webpack_module_cache__[e];if(void 0!==n)return n.exports;var a=__webpack_module_cache__[e]={exports:{}};return __webpack_modules__[e](a,a.exports,__webpack_require__),a.exports}__webpack_require__.d=(e,n)=>{for(var a in n)__webpack_require__.o(n,a)&&!__webpack_require__.o(e,a)&&Object.defineProperty(e,a,{enumerable:!0,get:n[a]})},__webpack_require__.o=(e,n)=>Object.prototype.hasOwnProperty.call(e,n),__webpack_require__.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})};var __webpack_exports__=__webpack_require__("./mcp-h5-bank-bridge/index.js");return __webpack_exports__})()}));
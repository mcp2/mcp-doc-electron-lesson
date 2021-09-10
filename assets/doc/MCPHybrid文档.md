# H5小程序开放接口文档



## 1、获取Token

### **pf.getToken(Object object)**

注册为Token方式获取用户信息的小程序，使用此API可以获取Token

### 参数

### Object object

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |



### object.success回调函数

### 参数

### Object.res

| 属性    | 类型     | 说明             |
|-------|--------|----------------|
| token | string | 用于换取用户信息的token |



### 示例代码

```javascript
MCPBridge.WebBridge.call("Location",
{},
function(data){
  console.log("hello response");
  console.error(data);
});
```



## 2、获取定位信息

### **pf.getLocation(Object object)**

获取定位信息

### 参数

### Object object

| 属性     | 类型     | 默认值 | 必填 | 说明                                             |
| -------- | -------- | ------ | ---- | ------------------------------------------------ |
| success  | function |        | 否   | 接口调用成功的回调函数                           |
| fail     | function |        | 否   | 接口调用失败的回调函数                           |
| complete | function |        | 否   | 接口调用结束的回调函数（调用成功、失败都会执行） |



### object.success回调函数

### 参数

### Object.res

| 属性        | 类型     | 说明 |
|-----------|--------|----|
| latitude  | string | 纬度 |
| longitude | string | 经度 |



### 示例代码

```javascript
MCPBridge.WebBridge.call("Location",
{},
function(data){
  console.log("hello response 222");
  console.error(data);
});
```



## 3、拨打电话

### **pf.dialPhoneNumber(Object object)**

拨打电话

### 参数

### Object object

| 属性        | 类型       | 默认值 | 必填 | 说明                       |
|-----------|----------|-----|----|--------------------------|
| phoneList | string   |     | 是  | 电话号码集合（电话号码用","分割）       |
| success   | function |     | 否  | 接口调用成功的回调函数              |
| fail      | function |     | 否  | 接口调用失败的回调函数              |
| complete  | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |

### 示例代码

```javascript
    MCPBridge.WebBridge.call("Location",
    {},
    function(data){
    console.log("hello response 2223333");
    console.error(data);
    });
```

### object.success回调函数

### 参数

### Object.res

| 属性        | 类型     | 说明                          |
|-----------|--------|-----------------------------|
| phoneNum  | string | 返回的用户选择的那个电话号码，未选择默认为‘‘-1’’ |



### 示例代码

```javascript
pf.dialPhoneNumber({
    success: function (data) { console.log("dialPhoneNumber success", JSON.stringify(data)) },
    fail: function (data) { console.log("dialPhoneNumber fail", JSON.stringify(data)) },
    complete: function (data) { console.log("dialPhoneNumber complete", JSON.stringify(data)) }
});
```



## 4、打开外部地图

### **pf.openExternalMap(Object object)**

打开外部地图

### 参数

### Object object

| 属性              | 类型       | 默认值 | 必填 | 说明                       |
|-----------------|----------|-----|----|--------------------------|
| destinationName | string   |     | 否  | 目的地名称                    |
| latitude        | string   |     | 否  | 纬度                       |
| longitude       | string   |     | 否  | 纬度                       |
| success         | function |     | 否  | 接口调用成功的回调函数              |
| fail            | function |     | 否  | 接口调用失败的回调函数              |
| complete        | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |



### 示例代码

```javascript
pf.openExternalMap({
	  destinationName: "中关村",
    latitude: "39.9761",
    longitude: "116.3282",
    success: function (data) { console.log("openExternalMap success", JSON.stringify(data)) },
    fail: function (data) { console.log("openExternalMap fail", JSON.stringify(data)) },
    complete: function (data) { console.log("openExternalMap complete", JSON.stringify(data)) }
});
```



## 5、保存图片到相册

### **pf.saveToAlbum(Object object)**

保存图片到相册

### 参数

### Object object

| 属性        | 类型       | 默认值 | 必填 | 说明                       |
|-----------|----------|-----|----|--------------------------|
| imgBase64 | string   |     | 否  | 图片的base64                |
| path      | string   |     | 否  | 相对路径                     |
| fileName  | string   |     | 否  | 文件名称包括后缀名                |
| success   | function |     | 否  | 接口调用成功的回调函数              |
| fail      | function |     | 否  | 接口调用失败的回调函数              |
| complete  | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |



### 示例代码

```javascript
pf.saveToAlbum({
    imgBase64: "iVBORw0KGgoA",
    path: "a/b/c",
    fileName: "logo.png",
    success: function (data) { console.log("saveToAlbum success", JSON.stringify(data)) },
    fail: function (data) { console.log("saveToAlbum fail", JSON.stringify(data)) },
    complete: function (data) { console.log("saveToAlbum complete", JSON.stringify(data)) }
});
```



## 6、从相册选择单张图片

### **pf.capturePhoto(Object object)**

拨打电话

### 参数

### Object object

| 属性        | 类型       | 默认值 | 必填 | 说明                       |
|-----------|----------|-----|----|--------------------------|
| success   | function |     | 否  | 接口调用成功的回调函数              |
| fail      | function |     | 否  | 接口调用失败的回调函数              |
| complete  | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |



### object.success回调函数

### 参数

### Object.res

| 属性    | 类型   | 说明               |
| ------- | ------ | ------------------ |
| imgBase | string | 相册图片的Base64值 |



### 示例代码

```javascript
pf.capturePhoto({
    success: function (data) { console.log("capturePhoto success", JSON.stringify(data)) },
    fail: function (data) { console.log("capturePhoto fail", JSON.stringify(data)) },
    complete: function (data) { console.log("capturePhoto complete", JSON.stringify(data)) }
});
```



## 7、从相册选择多张图片

### **pf.captureMultiPhotos(Object object)**

拨打电话

### 参数

### Object object

| 属性        | 类型       | 默认值 | 必填 | 说明                       |
|-----------|----------|-----|----|--------------------------|
| maxPhotos  | string   |     | 否  | 图片最大数量限制                |
| success   | function |     | 否  | 接口调用成功的回调函数              |
| fail      | function |     | 否  | 接口调用失败的回调函数              |
| complete  | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |



### object.success回调函数

### 参数

### Object.res

| 属性    | 类型   | 说明               |
| ------- | ------ | ------------------ |
| pathList | array | 多张图片的文件路径集合 |



### 示例代码

```javascript
pf.captureMultiPhotos({
    success: function (data) { console.log("captureMultiPhotos success", JSON.stringify(data)) },
    fail: function (data) { console.log("captureMultiPhotos fail", JSON.stringify(data)) },
    complete: function (data) { console.log("captureMultiPhotos complete", JSON.stringify(data)) }
});
```
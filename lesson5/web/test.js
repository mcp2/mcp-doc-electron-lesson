module.exports=`$$88888$$`;



var a = `# H5小程序开放接口文档
## 1、获取Token

### **pf.getToken(Object object)**

注册为Token方式获取用户信息的小程序，使用此API可以获取Token

### 参数

### Object object

| 属性        | 类型       | 默认值 | 必填 | 说明                       |
|-----------|----------|-----|----|--------------------------|
| phoneList | string   |     | 是  | 电话号码集合（电话号码用","分割）       |
| success   | function |     | 否  | 接口调用成功的回调函数              |
| fail      | function |     | 否  | 接口调用失败的回调函数              |
| complete  | function |     | 否  | 接口调用结束的回调函数（调用成功、失败都会执行） |


### 示例代码

\`\`\`javascript
pf.getToken({
    success: function (data) { console.log("getToken success", JSON.stringify(data)) },
    fail: function (data) { console.log("getToken fail", JSON.stringify(data)) },
    complete: function (data) { console.log("getToken complete", JSON.stringify(data)) }
});
\`\`\`

`;
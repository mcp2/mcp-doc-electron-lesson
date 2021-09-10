# 圆角组件 [基于iceButton](#effect)
## 参数说明
| 参数   | 说明                                                                      | 类型 | 默认值 |
| ------ | ------------------------------------------------------------------------- | ---- | ------ |
| data   | 按钮的尺寸 'small', 'medium', 'large' | data | data   |
| engine | engine to be used for processing templates. Handlebars is the default.    | data | data   |
| ext    | extension to be used for dest files.                                      | data | data   |



## 效果展示
``` javascript
<React.Fragment>
    <RoundedButton type="primary" size="small">Hello Small</RoundedButton>
    <RoundedButton type="secondary" size="medium">Hello Medium</RoundedButton>
    <RoundedButton type="normal" size="large">Hello Large</RoundedButton>
</React.Fragment>
```


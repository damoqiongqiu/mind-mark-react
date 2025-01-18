<p align="center">
    <img width="150" src="./src/assets/images/mmk.png">
</p>

<h1 align="center">MindMark-React</h1>

<p align="left">
🚀🚀🚀MindMark（心印）是一款基于 SpringAI 和 AIGC 的问答系统， 采用 RAG 架构，可以和基于 Spring 体系的业务系统进行无缝集成。
</p>

<p>
🚀🚀🚀请不要吝惜你的⭐️ Star ⭐️，星星越多，动力越足。🚀🚀🚀
</p>

## 1.说明

此项目是 MindMark（心印）的前端代码。

服务端位于： https://gitee.com/mumu-osc/mind-mark

**请先启动服务端项目，然后启动此项目。**

## 2.启动项目

修改 webpack.dev.js 中的配置，把 proxy 指向 MindMark 后台服务。

```javascript
    proxy: {
      "/mind-mark": {
        "target": "http://localhost:9090", //修改这里，指向你的 MindMark 服务端接口
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
      }
    },
```

启动项目：

```shell

npm install

npm start

```

与启动环境有关的配置项在 environment.\* 和 webpack.common.js 中。

## 3.屏幕截图

![mmk-1.gif](./src/assets/images/mmk-1.gif)

![mind-mark-react.png](./src/assets/images/mind-mark-react.png)

![11.png](./src/assets/images/11.png)

![12.png](./src/assets/images/12.png)

## 4.License

MIT

（补充声明：您可以随意使用此项目，但是本人不对您使用此项目造成的任何损失承担责任。）

## 5.联系我

VX: lanxinshuma

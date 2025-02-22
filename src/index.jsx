import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import store from 'src/app/shared/store'
import environment from "src/environments/environment";

//导入全局共用的 i18n 实例。
import "src/app/shared/i18n";

//导入全局共用的样式。
import 'src/index.scss';

//导入根组件。
import App from 'src/app/';
// 这里修改成你自己的应用名称 不是dev环境部署到线上的时候使用
const yourApp =  '/';
const basename = !environment.production ? '/' : yourApp;

const root = createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <BrowserRouter forceRefresh={false} basename={basename}>
      <App />
    </BrowserRouter>
  </Provider>
);

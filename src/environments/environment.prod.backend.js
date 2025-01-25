import { dataURL } from './data-url-config/backend-url';

//从服务端加载数据
const environment = {
    production: true,
    isMock: false,
    dataURL: dataURL
};

const backendUrl = process.env.BACKEND_URL;
// 使用 backendUrl 进行 API 请求

export default environment;
import { dataURL } from './data-url-config/backend-url';

//从服务端加载数据
const environment = {
    production: false,
    isMock: false,
    dataURL: dataURL
};

export default environment;
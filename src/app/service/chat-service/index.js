import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const chatStreamURL = environment.dataURL.chatStreamURL;
const chatURL = environment.dataURL.chatURL;
const embeddingURL = environment.dataURL.embeddingURL;

export default {
  chat: async (modelType, msg) => {
    let reqURL = _.template(chatURL)({ modelType, msg });
    return axiosService.get(reqURL);
  },
  chatStream: async (modelType, msg, buffer) => {
    return new Promise((resolve, reject) => {
      try {
        let reqURL = _.template(chatStreamURL)({ modelType, msg });
        const eventSource = new EventSource(reqURL);
        eventSource.onopen = () => {
          console.log('与服务器的连接已建立');
        };
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log("收到消息:", data);
          buffer.push(data.content);
          resolve(data.content);
        };
        eventSource.onerror = (error) => {
          console.error('连接发生错误:', error);
          eventSource.close();
          reject(error);
        };
      } catch (e) {
        console.error(e);
        reject(e);
      }
    })
  },
  embedding: async (modelType, param) => {
    let reqURL = _.template(embeddingURL)({ modelType });
    return axiosService.post(reqURL, param);
  }
}

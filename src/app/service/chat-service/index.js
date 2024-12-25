import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const chatURL = environment.dataURL.chatURL;
const embeddingURL = environment.dataURL.embeddingURL;

export default {
  chat: async (msg) => {
    let reqURL = _.template(chatURL)({ msg });
    return axiosService.get(reqURL);
  },
  embedding: async (msg) => {
    let reqURL = _.template(embeddingURL)({ msg });
    return axiosService.get(reqURL);
  }
}

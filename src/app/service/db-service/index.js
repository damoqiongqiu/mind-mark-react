import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const getDbConfigListURL = environment.dataURL.getDbConfigListURL;
const getDbConfigDetailURL = environment.dataURL.getDbConfigDetailURL;
const saveDbConfigURL = environment.dataURL.saveDbConfigURL;
const deleteDbConfigURL = environment.dataURL.deleteDbConfigURL;

export default {
  getDbConfigList: (userId, page) => {
    let reqURL = _.template(getDbConfigListURL)({ userId, page });
    return axiosService.get(reqURL);
  },
  getDbConfigDetail: (id) => {
    let reqURL = _.template(getDbConfigDetailURL)({ id });
    return axiosService.get(reqURL);
  },
  save: (dbEntity) => {
    let reqURL = _.template(saveDbConfigURL)();
    return axiosService.put(reqURL, dbEntity);
  },
  del: (id) => {
    let reqURL = _.template(deleteDbConfigURL)({ id });
    return axiosService.delete(reqURL);
  },
}
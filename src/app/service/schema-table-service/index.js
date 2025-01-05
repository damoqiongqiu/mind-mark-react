import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const getShemaTableListURL = environment.dataURL.getShemaTableListURL;
const getShemaTableDetailURL = environment.dataURL.getShemaTableDetailURL;
const saveShemaTableURL = environment.dataURL.saveShemaTableURL;
const deleteShemaTableURL = environment.dataURL.deleteShemaTableURL;


export default {
  getShemaTableList: (dbId, page) => {
    let reqURL = _.template(getShemaTableListURL)({ dbId, page });
    return axiosService.get(reqURL);
  },
  getShemaTableDetail: (id) => {
    let reqURL = _.template(getShemaTableDetailURL)({ id });
    return axiosService.get(reqURL);
  },
  save: (dbEntity) => {
    let reqURL = _.template(saveShemaTableURL)();
    return axiosService.put(reqURL, dbEntity);
  },
  del: (id) => {
    let reqURL = _.template(deleteShemaTableURL)({ id });
    return axiosService.delete(reqURL);
  },
}
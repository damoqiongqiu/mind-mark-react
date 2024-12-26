import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const fileUploadURL = environment.dataURL.fileUploadURL;
const fileListURL = environment.dataURL.fileListURL;
const delFileURL = environment.dataURL.delFileURL;

export default {
  /**
   * 同时上传多个文件
   * @param {*} files 
   * @returns 
   */
  uploadFiles: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const response = await axiosService.post(fileUploadURL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
  getFileList: (page) => {
    let reqURL = _.template(fileListURL)({ page });
    return axiosService.get(reqURL);
  },
  del: (id) => {
    let reqURL = _.template(delFileURL)({ id });
    return axiosService.delete(reqURL);
  },
}
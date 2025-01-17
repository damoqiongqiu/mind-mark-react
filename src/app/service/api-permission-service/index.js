import axiosService from "src/app/service/mmk-axios-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

const apiPermissionTableURL = environment.dataURL.apiPermissionTableURL;
const apiPermissionListAll = environment.dataURL.apiPermissionListAll;
const apiPermissionListAllByRole = environment.dataURL.apiPermissionListAllByRole;
const apiPermissionDetailURL = environment.dataURL.apiPermissionDetailURL;
const delApiPermissionURL = environment.dataURL.delApiPermissionURL;
const newApiPermissionURL = environment.dataURL.newApiPermissionURL;
const updateApiPermissionURL = environment.dataURL.updateApiPermissionURL;
const apiRoleListURL = environment.dataURL.apiRoleListURL;

export default {
    /**
     * 带分页
     * @param page 
     * @param searchStr 
     * @returns 
     */
    getApiPermissionTable: (page, searchStr) => {
        let reqURL = _.template(apiPermissionTableURL)({ page: page });
        return axiosService.post(reqURL, {
            apiName: searchStr
        });
    },

    /**
     * 获取所有的 API 权限，TODO:带分页？？？
     * @returns 
     */
    getApiPermissionListAll: () => {
        let reqURL = _.template(apiPermissionListAll)();
        return axiosService.post(reqURL, {});
    },

    /**
     * 获取角色对应的 API 权限，TODO:带分页？？？
     * @returns 
     */
    getApiPermissionListAllByRole: (roleEntity) => {
        let reqURL = _.template(apiPermissionListAllByRole)();
        return axiosService.post(reqURL, roleEntity);
    },

    /**
     * 获取角色对应的 API 权限，TODO:带分页？？？
     * @param {*} apiPermissionId 
     * @returns 
     */
    getRolesByApiId: (apiPermissionId) => {
        let reqURL = _.template(apiRoleListURL)({ id: apiPermissionId });
        return axiosService.get(reqURL);
    },

    /**
     * 获取角色对应的 API 权限，TODO:带分页？？？
     * @param {*} apiPermissionId 
     * @returns 
     */
    getApiPermDetails: (apiPermissionId) => {
        let reqURL = _.template(apiPermissionDetailURL)({ id: apiPermissionId });
        return axiosService.get(reqURL);
    },

    /**
     * 删除 API 权限
     * @param {*} id 
     * @returns 
     */
    deleteByApiId: (id) => {
        let reqURL = _.template(delApiPermissionURL)({ id: id });
        return axiosService.delete(reqURL);
    },

    /**
     * 新增 API 权限
     * @param {*} apiPermission 
     * @returns 
     */
    newApiPermission: (apiPermission) => {
        return axiosService.post(newApiPermissionURL, apiPermission);
    },

    /**
     * 更新 API 权限
     * @param {*} apiPermission 
     * @returns 
     */
    updateApiPermission: (apiPermission) => {
        return axiosService.post(updateApiPermissionURL, apiPermission);
    }
}
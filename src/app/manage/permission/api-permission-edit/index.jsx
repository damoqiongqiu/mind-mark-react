import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import apiPermissionService from "../../../service/api-permission-service";
import ajv from "../../../service/ajv-validate-service";

import './index.scss';

//TODO:提示消息需要国际化
// 表单输入项数据规格定义
const schema = {
  "type": "object",
  "properties": {
    "apiName": {
      "type": "string",
      "minLength": 2,
      "maxLength": 32,
      "errorMessage": "API 名称长度在 2 到 32 个字符之间。"
    },
    "url": {
      "anyOf": [
        {
          "type": "string",
          "maxLength": 1024,
          "errorMessage": "url 最大长度 1024 个字符。"
        },
        { "type": "null" },
        { "type": "string", "minLength": 0 } // 允许空字符串
      ]
    },
    "permission": {
      "type": "string",
      "minLength": 1,
      "maxLength": 64,
      "errorMessage": "权限字符串长度在 1 到 64 个字符之间。"
    },
    "remark": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 2,
          "maxLength": 200,
          "errorMessage": "备注长度在 8 到 16 个字符之间。"
        },
        { "type": "null" },
        { "type": "string", "minLength": 0 } // 允许空字符串
      ]
    },
  },
  "required": ["apiName", "permission"],
}
//ajv 的 compile 吃资源较多，这里放在组件外面，保证只执行一次。
const ajvValidate = ajv.compile(schema);

export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  //导航对象
  const navigate = useNavigate();

  //apiPermissionId，从路由参数中获取
  const { apiPermissionId } = useParams();

  //表单校验错误信息
  const [errors, setErrors] = useState({});

  //formValue 里面的 k-v 与服务端接口对应，方便提交和加载数据。
  const [formValue, setFormValue] = useState({
    apiPermissionId,
    apiName: "",
    url: "",
    permission: "",
    remark: "",
    createTime: new Date().toLocaleString(),
    updateTime: new Date().toLocaleString(),
  });

  /**
   * 所有 input 的 onChange 事件的处理函数，对于 checkbox/radio/select 这些组件，需要处理好 value 值再调用此函数。
   */
  const handleInputChange = (name, value) => {
    setFormValue({
      ...formValue,
      [name]: value
    });
  }

  /**
   * 保存数据到服务端
   * @returns 
   */
  const save = (e) => {
    e.preventDefault();

    const isValid = ajvValidate(formValue);
    setErrors({});

    if (!isValid) {
      const fieldErrors = {};
      ajvValidate?.errors.forEach((error) => {
        const field = error.instancePath.substring(1);
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      console.log(fieldErrors);
      return;
    }

    delete formValue.createTime;
    delete formValue.updateTime;

    if (apiPermissionId !== "-1") {
      apiPermissionService.updateApiPermission(formValue).then(
        response => {
          let data = response.data;
          if (data.success) {
            mmkToast({
              severity: 'success',
              summary: i18n.t('success'),
              detail: i18n.t('success'),
            });
            window.history.back();
          } else {
            mmkToast({
              severity: 'error',
              summary: i18n.t('error'),
              detail: i18n.t('fail'),
            });
          }
        },
        error => {
          mmkToast({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('fail'),
          });
        }
      );
    } else {
      apiPermissionService.newApiPermission(formValue).then(
        response => {
          let data = response.data;
          if (data.success) {
            mmkToast({
              severity: 'success',
              summary: i18n.t('success'),
              detail: i18n.t('success'),
            });
            window.history.back();
          } else {
            mmkToast({
              severity: 'error',
              summary: i18n.t('success'),
              detail: i18n.t('success'),
            });
          }
        },
        error => {
          mmkToast({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('fail'),
          });
        }
      );
    }
  }

  /**
   * 如果是编辑用户，加载用户信息。
   */
  useEffect(() => {
    if (apiPermissionId !== "-1") {
      apiPermissionService.getApiPermDetails(apiPermissionId).then(
        response => {
          let data = response.data.data;
          setFormValue({
            ...data,
          });
        },
        error => {
          mmkToast({
            severity: 'error',
            summary: i18n.t('error'),
            detail: i18n.t('fail'),
          });
        }
      );
    }
  }, []);

  return (
    <div className="role-edit-container">
      <Card>
        <Card.Header>
          <Card.Title as="h5">{i18n.t("apiPermission.edit.title")}</Card.Title>
        </Card.Header>
        <Card.Body>
          <form role="form" noValidate>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.apiName")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.apiName ? "has-error" : ""}`}
                  placeholder={i18n.t("apiPermission.edit.plsEnterApiName")}
                  name="apiName"
                  value={formValue.apiName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.apiName ? <div className="text-danger">{errors.apiName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.apiUrl")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.url ? "has-error" : ""}`}
                  placeholder={i18n.t("apiPermission.edit.plsEnterApiUrl")}
                  name="url"
                  value={formValue.url || ""}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.url ? <div className="text-danger">{errors.url}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.permissionWildCard")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.permission ? "has-error" : ""}`}
                  placeholder={i18n.t("apiPermission.edit.plsEnterPermissionWildCard")}
                  name="permission"
                  value={formValue.permission}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.permission ? <div className="text-danger">{errors.permission}</div> : <></>
                }
                <p className="bg-danger">
                  <a href="https://shiro.apache.org/permissions.html" target="_blank" rel="noreferrer">Apache Shiro Doc</a>
                </p>
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.createTime")}：</label>
              <div className="col-md-9">
                {formValue.createTime}
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.updateTime")}：</label>
              <div className="col-md-9">
                {formValue.updateTime}
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("apiPermission.remark")}：</label>
              <div className="col-md-9">
                <textarea
                  rows="5"
                  className={`form-control  ${errors.remark ? "has-error" : ""}`}
                  placeholder={i18n.t("apiPermission.edit.plsEnterRemark")}
                  name="remark"
                  value={formValue.remark}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                ></textarea>
                {
                  errors.remark ? <div className="text-danger">{errors.remark}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <div className="offset-md-3 col-md-9">
                <button type="button" className="btn btn-primary me-3" onClick={save}>
                  {i18n.t("save")}
                </button>
                <button type="button" className="btn btn-danger" onClick={() => { navigate(-1) }}>
                  {i18n.t("cancel")}
                </button>
              </div>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

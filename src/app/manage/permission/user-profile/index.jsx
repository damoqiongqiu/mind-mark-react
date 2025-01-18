import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import userService from '../../../service/user-service';
import defaultAvatar from '../../../../assets/images/react.svg';
import ajv from "../../../service/ajv-validate-service";
import CryptoJS from 'crypto-js';

import './index.scss';

//TODO:提示消息需要国际化
// 表单输入项数据规格定义
const schema = {
  "type": "object",
  "properties": {
    "userName": {
      "type": "string",
      "format": 'email',
      "errorMessage": "请输入正确的邮箱格式。"
    },
    "nickName": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 2,
          "maxLength": 32,
          "errorMessage": "昵称长度在 2 到 32 个字符之间"
        },
        { "type": "null" },
        { "type": "string", "minLength": 0 } // 允许空字符串
      ]
    },
    "email": {
      "anyOf": [
        {
          "type": "string",
          "format": 'email',
          "errorMessage": "请输入正确的邮箱格式。"
        },
        { "type": "null" },
        { "type": "string", "minLength": 0 } // 允许空字符串
      ]
    },
    "cellphone": {
      "anyOf": [
        {
          "type": "string",
          "format": "cellphone",
          "errorMessage": "请输入正确的手机号码。"
        },
        { "type": "null" },
        { "type": "string", "minLength": 0 } // 允许空字符串
      ]
    },
    "pwd": {
      "type": "string",
      "minLength": 8,
      "maxLength": 16,
      "errorMessage": "密码长度在 8 到 16 个字符之间。"
    },
    "confirmPwd": {
      "const": {
        "$data": "1/pwd"
      },
      "type": "string",
      "minLength": 8,
      "maxLength": 16,
      "errorMessage": "两次密码必须相同。"
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
  "required": ["userName", "pwd", "confirmPwd"],
}
//ajv 的 compile 吃资源较多，这里放在组件外面，保证只执行一次。
const ajvValidate = ajv.compile(schema);


/**
 * UserProfile 用户详情组件，创建和编辑用户都用这个组件。
 * @author 大漠穷秋
 */
export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  /**
   * 性别选项，静态数据。
   * value 必须是数值，与服务端的接口类型对应，否则无法选中。
   */
  const genderList = [
    { label: i18n.t("gender.female"), value: 0 },
    { label: i18n.t("gender.male"), value: 1 },
    { label: i18n.t("gender.unknown"), value: 2 }
  ];

  // 导航对象
  const navigate = useNavigate();

  // userId ，从路由参数中获取
  const { userId } = useParams();

  //表单校验错误信息
  const [errors, setErrors] = useState({});

  // formValue 里面的 k-v 与服务端接口对应，方便提交和加载数据。
  const [formValue, setFormValue] = useState({
    userId,
    avatarURL: "",
    userName: "",
    nickName: "",
    gender: 0,
    email: "",
    cellphone: "",
    pwd: "",
    confirmPwd: "",
    status: "",
    remark: "",
  });

  /**
   * 所有 input 的 onChange 事件的处理函数，对于 checkbox/radio/select 这些组件，需要处理好 value 值再调用此函数。
   */
  const handleInputChange = (name, value) => {
    const cleanValue = typeof value === 'string' ? value.trim() : value;
    setFormValue({
      ...formValue,
      [name]: cleanValue
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

    if (userId !== "-1") {
      delete formValue.confirmPwd;
      delete formValue.salt;

      formValue.password = CryptoJS.MD5(formValue.pwd).toString();
      userService.updateUser(formValue).then(
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
      userService.newUser(formValue).then(
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
    }
  }

  /**
   * 如果是编辑用户，加载用户信息。
   */
  useEffect(() => {
    if (userId !== "-1") {
      userService.getUserDetails(userId).then(
        response => {
          let data = response.data.data;
          setFormValue({
            ...data,
            pwd: "",
            confirmPwd: "",
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
    <div className="user-profile-container">
      <Card>
        <Card.Header>{i18n.t("user.edit.title")}</Card.Header>
        <Card.Body>
          <form role="form">
            <div className="row mb-3 text-end">
              <label className="col-md-3 col-form-label">{i18n.t("user.currentAvatar")}：</label>
              <div className="col-md-9 text-start">
                <img
                  src={formValue.avatarURL || defaultAvatar}
                  style={{ width: "64px" }}
                />
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.uploadAvatar")}：</label>
              <div className="col-md-9">
                <input
                  className="form-control"
                  type="file"
                  placeholder={i18n.t("user.edit.plsUploadAvatar")}
                />
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.userName")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control  ${errors.userName ? "has-error" : ""}`}
                  type="input"
                  placeholder={i18n.t("user.edit.plsEnterUserName")}
                  name="userName"
                  value={formValue.userName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.userName ? <div className="text-danger">{errors.userName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.nickName")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control  ${errors.nickName ? "has-error" : ""}`}
                  type="input"
                  placeholder={i18n.t("user.edit.plsEnterNickName")}
                  name="nickName"
                  value={formValue.nickName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.nickName ? <div className="text-danger">{errors.nickName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 align-items-center" >
              <label className="col-md-3 col-form-label text-right">{i18n.t("user.gender")}：</label>
              <div className="col-md-9">
                {
                  genderList.map((item, index) => {
                    return <label className="radio-inline" key={index}>
                      <input
                        type="radio"
                        name="gender"
                        value={item.value}
                        checked={(item.value == formValue.gender) ? true : false}
                        onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                      /> {item.label}
                    </label>
                  })
                }
              </div>
            </div>
            <div className="row mb-3 text-right" >
              <label className="col-md-3 col-form-label">{i18n.t("user.email")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control  ${errors.email ? "has-error" : ""}`}
                  type="input"
                  placeholder={i18n.t("user.edit.plsEnterEmail")}
                  name="email"
                  value={formValue.email}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.email ? <div className="text-danger">{errors.email}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.mobile")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control  ${errors.cellphone ? "has-error" : ""}`}
                  type="input"
                  placeholder={i18n.t("user.edit.plsEnterMobile")}
                  name="cellphone"
                  value={formValue.cellphone}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.cellphone ? <div className="text-danger">{errors.cellphone}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.password")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control ${errors.pwd ? "has-error" : ""}`}
                  type="pwd"
                  value={formValue.pwd}
                  autoComplete="off"
                  placeholder={i18n.t("user.edit.plsEnterPassword")}
                  onChange={(e) => handleInputChange('pwd', e.target.value)}
                />
                {
                  errors.pwd ? <div className="text-danger">{errors.pwd}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.confirmPassword")}：</label>
              <div className="col-md-9">
                <input
                  className={`form-control  ${errors.confirmPwd ? "has-error" : ""}`}
                  type="pwd"
                  value={formValue.confirmPwd}
                  autoComplete="off"
                  placeholder={i18n.t("user.edit.plsEnterConfirmPassword")}
                  onChange={(e) => handleInputChange('confirmPwd', e.target.value)}
                />
                {
                  errors.confirmPwd ? <div className="text-danger">{errors.confirmPwd}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 align-items-center">
              <label className="col-md-3 col-form-label text-right">{i18n.t("user.enabled")}：</label>
              <div className="col-md-9">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="status"
                  checked={(formValue.status === 1) ? true : false}
                  onChange={(e) => {
                    let status = e.target.checked ? 1 : 0;
                    handleInputChange(e.target.name, status);
                  }}
                />
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-3 col-form-label">{i18n.t("user.remark")}：</label>
              <div className="col-md-9">
                <textarea
                  rows="5"
                  className={`form-control  ${errors.remark ? "has-error" : ""}`}
                  placeholder={i18n.t("user.edit.plsEnterRemark")}
                  name="remark"
                  value={formValue.remark}
                  onChange={(e) => {
                    handleInputChange(e.target.name, e.target.value);
                  }}
                ></textarea>
                {
                  errors.remark ? <div className="text-danger">{errors.remark}</div> : <></>
                }
              </div>
            </div>
          </form>
          <div className="row mb-3 text-right">
            <div className="col-md-9 offset-md-3">
              <button type="button" className="btn btn-primary me-3" onClick={save}>
                {i18n.t("save")}
              </button>
              <button type="button" className="btn btn-danger" onClick={() => { navigate(-1) }}>
                {i18n.t("cancel")}
              </button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div >
  );
};
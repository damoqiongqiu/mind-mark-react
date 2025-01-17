import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from 'react-bootstrap/Card';
import userService from 'src/app/service/user-service';
import ajv from "src/app/service/ajv-validate-service";
import './index.scss';

// 表单输入项数据规格定义
const schema = {
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": 'email',
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "maxLength": 16,
    },
    "confirmPassword": {
      "const": {
        "$data": "1/password"
      },
      "type": "string",
      "minLength": 8,
      "maxLength": 16,
    },
  },
  "required": ["email", "password", "confirmPassword"],
}
//ajv 的 compile 吃资源较多，这里放在组件外面，保证只执行一次。
const ajvValidate = ajv.compile(schema);

export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  //导航对象
  const navigate = useNavigate();

  //表单校验错误信息
  const [errors, setErrors] = useState({});

  //userInfo Entity
  const [userInfo, setUserInfo] = useState({
    avatarURL: "",
    userName: "",
    nickName: "",
    gender: 0,
    email: "",
    cellphone: "",
    password: "",
    confirmPassword: "",
    status: "",
    remark: "",
  });

  /**
   * 所有 input 的 onChange 事件的处理函数
   * @param {*} key 
   * @param {*} value 
   */
  const handleInputChange = (key, value) => {
    const upRegister = {
      ...userInfo,
      [key]: value
    };
    setUserInfo(upRegister);
  }

  /**
   * 注册
   * @param {*} e 
   * @returns 
   */
  const doSignUp = (e) => {
    e.preventDefault();

    const isValid = ajvValidate(userInfo);
    setErrors({});

    if (!isValid) {
      const fieldErrors = {};

      ajvValidate.errors.forEach((error) => {
        const field = error.instancePath.substring(1);
        const keyword = error.keyword;
        // 获取 i8n 中的错误信息，如果没有则使用默认的错误信息。i18n 字符串定义在 src\app\shared\i18n\ 中。
        const errorMessage = i18n.t(`validation.${keyword}`, error.params);
        fieldErrors[field] = errorMessage || error.message;;
      });

      setErrors(fieldErrors);
      console.log(fieldErrors);
      return;
    }

    userInfo.userName = userInfo.email;
    userService.newUser(userInfo).then(
      response => {
        let data = response.data;
        if (data.success) {
          mmkToast({
            severity: 'success',
            summary: 'Success',
            detail: i18n.t("success"),
          });
          navigate('/sign-in');
        } else {
          mmkToast({
            severity: 'error',
            summary: 'Error',
            detail: data?.msg || i18n.t("fail"),
          });
        }
      },
      error => {
        mmkToast({
          severity: 'error',
          summary: 'Error',
          detail: i18n.t("fail"),
        });
      }
    );
  }

  return (
    <div className="user-register-container">
      <Card>
        <Card.Header>{i18n.t("signUp")}</Card.Header>
        <Card.Body>
          <form role="form" noValidate onSubmit={(e) => doRegister(e)}>
            <div className="row mb-3 text-right">
              <label className="col-md-2 col-form-label">{i18n.t("email")}：</label>
              <div className="col-md-10">
                <input
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  required
                  name="email"
                  value={userInfo.email}
                  autoComplete="off"
                  type="text"
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {
                  errors.email ? <div className="text-danger">{errors.email}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-2 col-form-label">{i18n.t("password")}：</label>
              <div className="col-md-10">
                <input
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  required
                  name="password"
                  value={userInfo.password}
                  autoComplete="off"
                  type="text"
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                {
                  errors.password ? <div className="text-danger">{errors.password}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <label className="col-md-2 col-form-label">{i18n.t("confirmPassword")}：</label>
              <div className="col-md-10">
                <input
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  required
                  name="confirmPassword"
                  value={userInfo.confirmPassword}
                  autoComplete="off"
                  type="text"
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
                {
                  errors.confirmPassword ? <div className="text-danger">{errors.confirmPassword}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-10 offset-md-2">
                <button type="button" onClick={doSignUp} className="btn btn-primary">{i18n.t("signUp")}</button>
              </div>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div >
  );
};
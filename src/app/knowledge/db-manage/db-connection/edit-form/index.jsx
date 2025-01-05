import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import ajv from "../../../../service/ajv-validate-service";
import dbService from '../../../../service/db-service';

import './index.scss';

export default () => {
  const { t } = useTranslation();

  const schema = {
    "type": "object",
    "properties": {
      "dbType": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.connection.plsEnterDbType')
      },
      "ip": {
        "type": "string",
        "pattern": "^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
        "errorMessage": t('database.connection.plsEnterIp')
      },
      "port": {
        "type": "string",
        "pattern": "^([0-9]{1,4}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$",
        "errorMessage": t('database.connection.plsEnterPort')
      },
      "charset": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.connection.plsEnterCharset')
      },
      "userName": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.connection.plsEnterUserName')
      },
      "password": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.connection.plsEnterPassword')
      }
    },
    "required": ["dbType", "ip", "port", "charset", "userName", "password"]
  };

  const ajvValidate = ajv.compile(schema);

  const navigate = useNavigate();
  const { id } = useParams();
  const [errors, setErrors] = useState({});
  const [formValue, setFormValue] = useState({
    dbType: "mysql",
    ip: "",
    port: "",
    charset: "utf8",
    userName: "",
    password: "",
    userId: 1 //TODO:FIXME 完成用户登录功能，取 session 中的 userId
  });

  const dbTypeOptions = [
    { label: 'MySQL', value: 'mysql' }
  ];

  const handleInputChange = (name, value) => {
    setFormValue({
      ...formValue,
      [name]: value
    });
  }

  const save = (e) => {
    e.preventDefault();

    const isValid = ajvValidate(formValue);
    setErrors({});

    if (!isValid) {
      const fieldErrors = {};
      ajvValidate.errors?.forEach((error) => {
        const field = error.instancePath.substring(1);
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const saveData = { ...formValue };
    if (id && !id.startsWith('TEMP_')) {
      saveData.id = id;
    }

    showGlobalSpin();
    dbService.save(saveData).then(() => {
      mmkToast({
        severity: 'success',
        summary: t('success'),
        detail: t('saveSuccess'),
      });
      hideGlobalSpin();
      navigate(-1);
    });
  }

  useEffect(() => {
    if (id && !id.startsWith('TEMP_')) {
      showGlobalSpin();
      dbService.getDbConfigDetail(id).then(response => {
        setFormValue(response.data);
        hideGlobalSpin();
      });
    }
  }, [id]);

  return (
    <div className="connection-edit-container">
      <Card>
        <Card.Header>
          <Card.Title as="h5">{id ? t('database.connection.edit') : t('database.connection.add')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <form role="form" noValidate>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.dbType")}：</label>
              <div className="col-md-9">
                <Dropdown
                  value={formValue.dbType}
                  options={dbTypeOptions}
                  onChange={(e) => handleInputChange('dbType', e.value)}
                  className={`w-100 ${errors.dbType ? "p-invalid" : ""}`}
                />
                {errors.dbType && <small className="p-error">{errors.dbType}</small>}
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.ip")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.ip ? "has-error" : ""}`}
                  placeholder={t("database.connection.plsEnterIp")}
                  name="ip"
                  value={formValue.ip}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.ip ? <div className="text-danger">{errors.ip}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.port")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.port ? "has-error" : ""}`}
                  placeholder={t("database.connection.plsEnterPort")}
                  name="port"
                  value={formValue.port}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.port ? <div className="text-danger">{errors.port}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.charset")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.charset ? "has-error" : ""}`}
                  placeholder={t("database.connection.plsEnterCharset")}
                  name="charset"
                  value={formValue.charset}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.charset ? <div className="text-danger">{errors.charset}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.userName")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.userName ? "has-error" : ""}`}
                  placeholder={t("database.connection.plsEnterUserName")}
                  name="userName"
                  value={formValue.userName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.userName ? <div className="text-danger">{errors.userName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.connection.password")}：</label>
              <div className="col-md-9">
                <input
                  type="password"
                  className={`form-control  ${errors.password ? "has-error" : ""}`}
                  placeholder={t("database.connection.plsEnterPassword")}
                  name="password"
                  value={formValue.password}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.password ? <div className="text-danger">{errors.password}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3 text-right">
              <div className="offset-md-3 col-md-9">
                <Button
                  type="button"
                  icon="fa fa-floppy-o"
                  className="p-button-primary p-button-sm me-3"
                  onClick={save}
                />
                <Button
                  type="button"
                  icon="fa fa-times"
                  className="p-button-danger p-button-sm"
                  onClick={() => { navigate(-1) }}
                />
              </div>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
};

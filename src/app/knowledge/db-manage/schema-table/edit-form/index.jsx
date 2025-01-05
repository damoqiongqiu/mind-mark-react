import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import Card from 'react-bootstrap/Card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import ajv from "../../../../service/ajv-validate-service";
import schemaTableService from '../../../../service/schema-table-service';

import './index.scss';

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dbId, id } = useParams();
  const [errors, setErrors] = useState({});
  const [formValue, setFormValue] = useState({
    schemaName: "",
    tableName: "",
    idColumn: ""
  });

  const schema = {
    "type": "object",
    "properties": {
      "schemaName": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.plsEnterSchemaName')
      },
      "tableName": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.plsEnterTableName')
      },
      "idColumn": {
        "type": "string",
        "minLength": 1,
        "errorMessage": t('database.plsEnterIdColumn')
      }
    },
    "required": ["schemaName", "tableName", "idColumn"]
  };

  const ajvValidate = ajv.compile(schema);

  const handleInputChange = (name, value) => {
    setFormValue({
      ...formValue,
      [name]: value
    });
  }

  const save = (e) => {
    e.preventDefault(); // 阻止表单默认提交行为

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
    saveData.dbId = dbId;
    schemaTableService.save(saveData).then(() => {
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
      schemaTableService.getShemaTableDetail(id).then(response => {
        setFormValue(response.data);
        hideGlobalSpin();
      });
    }
  }, [id]);

  return (
    <div className="schema-table-edit-container">
      <Card>
        <Card.Header>
          <Card.Title as="h5">{id ? t('database.editSchemaTable') : t('database.addSchemaTable')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Message severity="warn" text="注意：在 MindMark 当前的实现中，被监控的表必须带有自增主键，否则 MindMark 无法把表中的数据进行向量化，因为不能记录已经处理了哪些数据行，在后续的版本中再考虑改进。" />
          <form role="form" noValidate className='mt-3'>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.schemaName")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.schemaName ? "has-error" : ""}`}
                  placeholder={t("database.plsEnterSchemaName")}
                  name="schemaName"
                  value={formValue.schemaName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.schemaName ? <div className="text-danger">{errors.schemaName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.tableName")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.tableName ? "has-error" : ""}`}
                  placeholder={t("database.plsEnterTableName")}
                  name="tableName"
                  value={formValue.tableName}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.tableName ? <div className="text-danger">{errors.tableName}</div> : <></>
                }
              </div>
            </div>
            <div className="row mb-3">
              <label className="col-md-3 col-form-label text-end">{t("database.idColumn")}：</label>
              <div className="col-md-9">
                <input
                  type="text"
                  className={`form-control  ${errors.idColumn ? "has-error" : ""}`}
                  placeholder={t("database.plsEnterIdColumn")}
                  name="idColumn"
                  value={formValue.idColumn}
                  onChange={(e) => handleInputChange(e.target.name, e.target.value)}
                />
                {
                  errors.idColumn ? <div className="text-danger">{errors.idColumn}</div> : <></>
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

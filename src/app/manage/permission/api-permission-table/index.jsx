import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import { confirmDialog } from 'primereact/confirmdialog';
import apiPermissionService from "../../../service/api-permission-service";

import './index.scss';

export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  //导航对象
  const navigate = useNavigate();

  //API 权限列表
  const [apiList, setApiList] = useState([]);

  //分页参数
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  /**
   * 分页事件
   * @param {*} event 
   */
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setPage(event.page + 1);
  };

  /**
   * 加载 API 权限列表
   */
  const loadData = () => {
    apiPermissionService.getApiPermissionTable(page, "").then(response => {
      let data = response.data;
      setTotalElements(data.totalElements);

      data = data?.content || [];
      setApiList(data);
    });
  };

  useEffect(loadData, []);

  /**
   * 删除 API 权限
   * @param {*} rowData 
   * @param {*} ri 
   */
  const delApiPermission = (rowData, ri) => {
    confirmDialog({
      message: i18n.t('confirmDelete'),
      header: i18n.t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        apiPermissionService.deleteByApiId(rowData.apiPermissionId)
          .then(
            response => {
              mmkToast({
                severity: 'success',
                summary: i18n.t('success'),
                detail: i18n.t('success'),
              });
            },
            error => {
              mmkToast({
                severity: 'error',
                summary: i18n.t('error'),
                detail: i18n.t('fail'),
              });
            }
          )
          .finally(loadData);
      },
      reject: () => {
        console.log("reject");
      }
    });
  };

  /**
   * 角色列表模板
   * @param {*} item 
   * @returns 
   */
  const roleListTemplate = (item) => {
    return (
      item?.roleEntities?.map(role => (
        <h5 key={role.roleId}>
          <span className="badge bg-success">{role.roleName}</span>
        </h5>
      ))
    );
  };

  /**
   * 操作按钮模板
   * @param {*} item 
   * @returns 
   */
  const operationTemplate = (item) => {
    return (
      <>
        <Button icon="pi pi-pencil" className="p-button-success" onClick={() => { navigate("/manage/api-permission-edit/" + item.apiPermissionId) }} />&nbsp;&nbsp;
        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => { delApiPermission(item) }} />
      </>
    );
  };

  return (<div className="api-permission-table-container">
    <form role="form">
      <div className="input-group">
        <input name="searchStr" className="form-control" type="text" />
        <button className="btn btn-success" type="button">
          <i className="fa fa-search"></i>
        </button>
        <button className="btn btn-danger" type="button" onClick={() => { navigate("/manage/api-permission-edit/-1") }}>
          <i className="fa fa-plus"></i>
        </button>
      </div>
    </form>
    <div className="row">
      <div className="col-md-12">
        <div className="permission-item-container">
          <DataTable
            showGridlines
            stripedRows
            tableStyle={{ width: "100%" }}
            value={apiList}
            rows={rows}
            first={first}
            paginator={{
              totalRecords: totalElements,
              onPageChange: onPageChange
            }}
          >
            <Column field="apiName" header={i18n.t("apiPermission.apiName")}></Column>
            <Column field="url" header={i18n.t("apiPermission.apiUrl")}></Column>
            <Column field="permission" header={i18n.t("apiPermission.permissionWildCard")}></Column>
            <Column field="remark" header={i18n.t("apiPermission.remark")} style={{ maxWidth: "120px" }}></Column>
            <Column field="roleEntities" body={roleListTemplate} header={i18n.t("apiPermission.table.associatedRoles")}></Column>
            <Column field="" header={i18n.t("operation")} body={operationTemplate}></Column>
          </DataTable>
        </div>
      </div>
    </div>
  </div>
  );
};

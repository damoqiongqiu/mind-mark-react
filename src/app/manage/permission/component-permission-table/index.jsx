import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import * as _ from 'lodash';

import compPermService from "../../../service/component-permission-service";
import './index.scss';

export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  // 导航对象
  const navigate = useNavigate();

  // tree 形的数据，服务端接口已经整理好
  const [compPermList, setCompPermList] = useState([]);

  //TODO: tree 目前没有带分页，这些分页参数目前没有作用，后续需要修改。
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // 表格列以及数据格式化方法定义
  const cols = [
    { field: "componentName", header: i18n.t("componentPermission.componentName"), expander: true },
    { field: "url", header: i18n.t("componentPermission.componentUrl") },
    { field: "displayOrder", header: i18n.t("componentPermission.displayOrder") },
    { field: "permission", header: i18n.t("componentPermission.permissionWildCard") },
    {
      field: "visiable", header: i18n.t("componentPermission.table.visiable"), body: (item) => {
        return (
          item.visiable === 1 ?
            <i className="fa fa-check" aria-hidden="true" style={{ color: 'green' }}></i> :
            <i className="fa fa-times" aria-hidden="true" style={{ color: 'red' }}></i>
        );
      }
    },
    {
      field: "", header: i18n.t("operation"), body: (item) => {
        return (
          <>
            <Button icon="pi pi-pencil" className="p-button-success" onClick={() => {
              let pId = item.parentEntity ? item.parentEntity.compPermId : "-1";
              navigate("/manage/component-permission-edit/" + item.compPermId + "/" + pId)
            }} />&nbsp;&nbsp;
            <Button icon="pi pi-plus" className="p-button-warning" onClick={() => {
              navigate("/manage/component-permission-edit/-1/ " + item.compPermId)
            }}></Button>&nbsp;&nbsp;
            <Button icon="pi pi-trash" className="p-button-danger" onClick={() => { delComponentPermission(item); }} />
          </>
        );
      }
    }
  ];

  /**
   * PrimeReact 组件需要的数据格式与服务端返回的数据格式不一致。
   * 这里 tree 递归，整理成 PrimeReact 组件需要的数据格式
   * @param node 
   * @returns 
   */
  const treeDataTransformer = (node) => {
    let data = {};
    cols.forEach((col) => {
      data[col.field] = node[col.field];
    });
    // 为了方便接口调用，将 compPermId 和父层的 compPermId 保存在 data 中
    data.compPermId = node.compPermId;
    let pId = -1;
    if (_.isNumber(node.parentEntity)) {
      pId = node.parentEntity;
    } else if (_.isObject(node.parentEntity)) {
      pId = node.parentEntity.compPermId;
    }
    data.parentEntity = { compPermId: pId };
    node.data = data;
    node.expanded = true;
    if (node.children) {
      node.children.forEach((child) => {
        treeDataTransformer(child);
      });
    }
    return node;
  }

  /**
   * 加载组件权限列表
   * @returns 
   */
  const getCompPermListByPage = () => {
    return compPermService
      .getCompPermTable(page, "")
      .then((response) => {
        let data = response.data;
        data.content.forEach((node) => {
          treeDataTransformer(node);
        });
        setCompPermList(data.content);
        setTotalElements(data.totalElements);
      });
  }

  /**
   * 删除组件权限
   * @param {*} rowData 
   */
  const delComponentPermission = (rowData) => {
    confirmDialog({
      message: i18n.t("confirmDelete"),
      header: i18n.t("confirm"),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let compPermId = rowData.compPermId;
        compPermService
          .deleteByCompPermId(compPermId)
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
          .finally(getCompPermListByPage);
      },
    });
  }

  useEffect(() => {
    getCompPermListByPage();
  }, []);


  return (
    <div className="component-permission-table-container">
      <form role="form">
        <div className="input-group">
          <input name="searchStr" className="form-control" type="text" />
          <button className="btn btn-success" type="button">
            <i className="fa fa-search"></i>
          </button>
          <button className="btn btn-danger" type="button" onClick={() => { navigate("/manage/component-permission-edit/-1/-1") }}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </form>
      <div className="row">
        <div className="col-md-12">
          <div className="permission-item-container">
            {/* TODO:默认展开所有节点 */}
            <TreeTable
              value={compPermList}
              tableStyle={{ minWidth: '100' }}>
              {
                cols.map((col) => {
                  return <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    expander={col.expander}
                    body={col.body}
                  >
                  </Column>
                })
              }
            </TreeTable>
          </div>
        </div>
      </div>
    </div >
  );
};

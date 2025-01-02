import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import fileService from "../../service/file-service";
import { setSelectedFiles } from '../../shared/store';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';

import "./index.scss";

export default props => {
  //i18n hooks
  const { i18n } = useTranslation();

  //导航对象
  const navigate = useNavigate();

  //文件列表
  const [fileList, setFileList] = useState([]);

  //选中的文件
  const selectedFiles = useSelector((state) => state.selectedFiles.value);
  const dispatch = useDispatch();
  const handleChange = (e) => {
    dispatch(setSelectedFiles(e.value));
  };

  //上传的文件
  const uploadedFile = useSelector((state) => state.uploadedFile.value);
  useEffect(() => { uploadedFile && loadData(); }, [uploadedFile]);

  //分页参数
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);//需要和服务端保持一致
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /**
   * 分页事件
   * @param {*} event 
   */
  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setPage(event.page);
  };

  /**
   * 加载文件列表，分页
   */
  const loadData = (page = 0, rows = 15) => {
    fileService.getFileList(page, rows).then(response => {
      let data = response.data;
      setTotalElements(data.totalElements);
      setFileList(data?.content || []);
    });
  };

  useEffect(() => {
    loadData(page, rows);
  }, [page, rows]);

  /**
   * 删除文件
   * @param {*} rowData 
   * @param {*} ri 
   */
  const delFile = (rowData, ri) => {
    confirmDialog({
      message: i18n.t('confirmDelete'),
      header: i18n.t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        fileService.del(rowData.id)
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
  }

  /**
   * 格式化文件大小
   * @param {number} size 
   * @returns {string}
   */
  const formatFileSize = (size) => {
    if (size < 1024) return size + ' B';
    let i = Math.floor(Math.log(size) / Math.log(1024));
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  /**
   * 表格中的文件大小模板
   * @param {*} rowData 
   * @returns 
   */
  const fileSizeTemplate = (rowData) => {
    return formatFileSize(rowData.fileSize);
  };

  /**
   * 表格中的操作按钮模板
   * @param {*} item
   * @returns
   */
  const operationTemplate = (item) => {
    return (
      <>
        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => { delFile(item) }} />
      </>
    );
  };

  /**
   * 表格中的序号模板
   * @param {*} rowData 
   * @param {*} column 
   * @returns 
   */
  const indexTemplate = (rowData, column) => {
    return column.rowIndex + 1;
  };

  const footerTemplate = (options) => {
    const className = `${options.className} flex flex-wrap align-items-center justify-content-between gap-3`;
    return (
      <div className={className}>
        <div className="flex align-items-center">
          {
            totalElements ?
              <Paginator
                pageLinkSize={3}
                first={first}
                rows={rows}
                totalRecords={totalElements}
                onPageChange={onPageChange}
                style={{ padding: 0 }}
              />
              :
              <></>
          }
        </div>
      </div>
    );
  };

  return (
    <DataTable
      showGridlines
      stripedRows
      tableStyle={{ width: "100%" }}
      value={fileList}
      // rows={rows}
      // first={first}
      // paginator
      // totalRecords={totalElements}
      // onPageChange={onPageChange}
      footer={footerTemplate}
      scrollable
      scrollHeight="600px"
    >
      <Column header="#" body={indexTemplate}></Column>
      <Column field="displayName" header="文件名"></Column>
      <Column field="fileSuffix" header="文件类型"></Column>
      <Column field="fileSize" header="文件大小" body={fileSizeTemplate}></Column>
      <Column field="" header={i18n.t('operation')} body={operationTemplate}></Column>
    </DataTable>
  )
};

import React, { useState, useEffect, useRef } from 'react';
import { Panel } from 'primereact/panel';
import { MultiSelect } from 'primereact/multiselect';
import { Menu } from 'primereact/Menu';
import { useTranslation } from 'react-i18next';
import { confirmDialog } from 'primereact/confirmdialog';
import { Paginator } from 'primereact/paginator';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import fileService from "../../service/file-service";
import { setSelectedFiles } from '../../shared/store';

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
  const loadData = () => {
    fileService.getFileList(page).then(response => {
      let data = response.data;
      setTotalElements(data.totalElements);

      data = data?.content || [];
      setFileList(data);
    });
  };

  useEffect(loadData, [page]);

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


  const configMenu = useRef(null);
  const items = [
    {
      label: 'Refresh',
      icon: 'pi pi-refresh'
    },
    {
      label: 'Search',
      icon: 'pi pi-search'
    },
    {
      separator: true
    },
    {
      label: 'Delete',
      icon: 'pi pi-times'
    }
  ];

  const headerTemplate = (options) => {
    const className = `${options.className} justify-content-space-between`;

    return (
      <div className={className}>
        <div className="flex align-items-center gap-2">
          <span className="font-bold">Select File(s)</span>
        </div>
        <div>
          <Menu model={items} popup ref={configMenu} id="config_menu" />
          {options.togglerElement}
        </div>
      </div>
    );
  };

  const footerTemplate = (options) => {
    const className = `${options.className} flex flex-wrap align-items-center justify-content-between gap-3`;
    return (
      <div className={className}>
        <div className="flex align-items-center">
          <Paginator
            pageLinkSize={3}
            first={first}
            rows={rows}
            totalRecords={totalElements}
            onPageChange={onPageChange}
            style={{ padding: 0 }}
          />
        </div>
      </div>
    );
  };

  return (
    <Panel
      toggleable
      className="custom-panel h-100"
      headerTemplate={headerTemplate}
      footerTemplate={footerTemplate}
    >
      <MultiSelect
        value={selectedFiles}
        onChange={handleChange}
        options={fileList}
        optionLabel="displayName"
        placeholder="Select Files"
        maxSelectedLabels={3}
        inline
        className="w-full"
      />
    </Panel>
  )
};

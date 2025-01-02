import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { confirmDialog } from 'primereact/confirmdialog';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import fileService from "../../service/file-service";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Paginator } from 'primereact/paginator';

import "./index.scss";

const FileManager = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Supported file formats
  const supportedFormats = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ];

  // State variables
  const [files, setFiles] = useState([]);
  const uploadedFile = useSelector((state) => state.uploadedFile.value);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch files when uploadedFile changes
  useEffect(() => {
    if (uploadedFile) {
      fetchFiles();
    }
  }, [uploadedFile]);

  // Fetch files when page or rows change
  useEffect(() => {
    fetchFiles(page, rows);
  }, [page, rows]);

  // Fetch files from the server
  const fetchFiles = (page = 0, rows = 15) => {
    fileService.getFileList(page, rows).then(response => {
      const data = response.data;
      setTotalRecords(data.totalElements);
      setFiles(data?.content || []);
    });
  };

  // Handle page change
  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setPage(event.page);
  };

  // Handle file deletion
  const handleDeleteFile = (file) => {
    confirmDialog({
      message: t('confirmDelete'),
      header: t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        fileService.del(file.id)
          .then(
            () => {
              mmkToast({
                severity: 'success',
                summary: t('success'),
                detail: t('success'),
              });
              fetchFiles();
            },
            () => {
              mmkToast({
                severity: 'error',
                summary: t('error'),
                detail: t('fail'),
              });
            }
          );
      },
      reject: () => {
        console.log("reject");
      }
    });
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      mmkToast({
        severity: 'error',
        summary: t('error'),
        detail: t('selectFile'),
      });
      return;
    }

    if (!supportedFormats.includes(selectedFile.type)) {
      mmkToast({
        severity: 'error',
        summary: t('error'),
        detail: t('unsupportedFormat'),
      });
      return;
    }

    showGlobalSpin();

    fileService.uploadFiles([selectedFile]).then(
      () => {
        mmkToast({
          severity: 'success',
          summary: t('success'),
          sticky: false,
          life: 5000,
          detail: t('uploadSuccess'),
        });
        fetchFiles();
      },
      (error) => {
        console.error(error);
        mmkToast({
          severity: 'error',
          summary: t('error'),
          detail: t('error'),
        });
      }
    ).finally(() => {
      hideGlobalSpin();
      event.target.value = null;
    });
  };

  // Format file size
  const formatFileSize = (size) => {
    if (size < 1024) return size + ' B';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
  };

  // File size template for DataTable
  const fileSizeTemplate = (rowData) => formatFileSize(rowData.fileSize);

  // Operation template for DataTable
  const operationTemplate = (file) => (
    <Button icon="pi pi-trash" className="p-button-danger" onClick={() => handleDeleteFile(file)} />
  );

  // Index template for DataTable
  const indexTemplate = (rowData, column) => column.rowIndex + 1;

  // Footer template for DataTable
  const footerTemplate = () => (
    <div className="d-flex align-items-center justify-content-between gap-3 w-100">
      <div className="d-flex align-items-center">
        <label
          className="btn btn-secondary me-2"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title={t("upload")}
        >
          <i className="fa fa-upload"></i>
          <span className="d-none text-hover">{t("upload")}</span>
          <input
            id="file-input"
            type="file"
            className="d-none"
            accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.json"
            onChange={handleFileUpload}
          />
        </label>
      </div>
      <div className="d-flex align-items-center">
        {totalRecords ? (
          <Paginator
            pageLinkSize={3}
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
            style={{ padding: 0 }}
          />
        ) : null}
      </div>
    </div>
  );

  return (
    <DataTable
      showGridlines
      stripedRows
      tableStyle={{ width: "100%"}}
      value={files}
      footer={footerTemplate}
      scrollable
      scrollHeight="600px"
      className="p-datatable-sm custom-scrollbar"
      emptyMessage={t('No files found')}
    >
      <Column header="#" body={indexTemplate}></Column>
      <Column field="displayName" header={t("fileName")}></Column>
      <Column field="fileSuffix" header={t("fileType")}></Column>
      <Column field="fileSize" header={t("fileSize")} body={fileSizeTemplate}></Column>
      <Column field="" header={t('operation')} body={operationTemplate}></Column>
    </DataTable>
  );
};

export default FileManager;

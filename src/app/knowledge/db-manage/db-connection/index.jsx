import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Paginator } from 'primereact/paginator';
import { useTranslation } from 'react-i18next';
import dbService from '../../../service/db-service';

import "./index.scss";

export default props => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dbConnections, setDbConnections] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchDbConnections = () => {
    //TODO:FIXME 完成用户登录功能，取 session 中的 userId
    dbService.getDbConfigList(1, page).then(response => {
      const data = response.data;
      setTotalRecords(data.totalElements);
      setDbConnections(data?.content || []);
    });
  };

  useEffect(fetchDbConnections, []);

  const handleAdd = () => {
    navigate('/knowledge/db-connection');
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: t('confirmDelete'),
      header: t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      style: { width: '400px' },
      accept: () => {
        dbService.del(rowData.id).then(() => {
          mmkToast({
            severity: 'success',
            summary: t('success'),
            detail: t('deleteSuccess'),
          });
          fetchDbConnections();
        });
      },
      reject: () => { }
    });
  };

  const handlePageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);
    setPage(event.page);
  };

  useEffect(() => {
    fetchDbConnections(page, rows);
  }, [page, rows]);

  const footerTemplate = () => (
    <div className="d-flex align-items-center justify-content-between gap-3 w-100">
      <div className="d-flex align-items-center gap-3">
        <Button
          type="button"
          icon="pi pi-plus"
          className="p-button-primary p-button-sm"
          onClick={handleAdd}
        />
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

  const headerTemplate = () => (
    <div className="d-flex align-items-center">
      <h5 className="mb-0 fw-bold">{t('database.connection.title')}</h5>
    </div>
  );

  const handleTestConnection = (rowData) => {
    showGlobalSpin();
    dbService.testConnection(rowData).then(
      () => {
        mmkToast({
          severity: 'success',
          summary: t('success'),
          detail: t('database.connectionSuccess'),
        });
      },
      (error) => {
        mmkToast({
          severity: 'error',
          summary: t('error'),
          detail: error.message || t('database.connectionFailed'),
        });
      }
    ).finally(() => {
      hideGlobalSpin();
    });
  };

  const operationTemplate = (rowData) => {
    const isEditing = editingRows[rowData.id];

    if (isEditing) {
      return (
        <div className="d-flex gap-2 justify-content-center">
          <Button
            icon="pi pi-check"
            className="p-button-success p-button-sm"
            onClick={() => {
              const index = dbConnections.findIndex(item => item.id === rowData.id);
              onRowEditComplete({
                newData: { ...rowData },
                index: index
              });
            }}
          />
          <Button
            icon="pi pi-times"
            className="p-button-danger p-button-sm"
            onClick={() => {
              setEditingRows({});
            }}
          />
        </div>
      );
    }

    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button
          type="button"
          icon="pi pi-pencil"
          className="p-button-primary p-button-sm"
          onClick={() => navigate(`/knowledge/db-connection/${rowData.id}`)}
        />
        <Button
          type="button"
          icon="pi pi-wrench"
          className="p-button-info p-button-sm"
          onClick={() => handleTestConnection(rowData)}
        />
        <Button
          type="button"
          icon="pi pi-list"
          className="p-button-info p-button-sm"
          onClick={() => navigate(`/knowledge/schema-table/${rowData.id}`)}
        />
        <Button
          type="button"
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
        />
      </div>
    );
  };

  return (
    <div className="d-flex flex-column gap-2">
      <DataTable
        value={dbConnections}
        dataKey="id"
        className="p-datatable-sm custom-scrollbar"
        scrollable
        scrollHeight="600px"
        header={headerTemplate}
        footer={footerTemplate}
        showGridlines
        stripedRows
        tableStyle={{ width: "100%" }}
        emptyMessage={t('noData')}
      >
        <Column
          field="index"
          header="#"
          body={(rowData, { rowIndex }) => rowIndex + 1}
          style={{ width: '70px' }}
        />
        <Column
          field="dbType"
          header={t('database.type')}
          style={{ width: '150px' }}
        />
        <Column
          field="ip"
          header={t('database.ip')}
          style={{ width: '150px' }}
        ></Column>
        <Column field="port" header={t('database.port')} style={{ width: '100px' }}></Column>
        <Column
          field="charset"
          header={t('database.charset')}
          style={{ width: '100px' }}
        ></Column>
        <Column field="userName" header={t('database.username')} style={{ width: '150px' }}></Column>
        <Column field="password" header={t('database.password')} style={{ width: '150px' }}></Column>
        <Column
          header={t('operation')}
          body={operationTemplate}
          style={{ width: '150px' }}
        />
      </DataTable>
    </div>
  );
};
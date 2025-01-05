import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { Paginator } from 'primereact/paginator';
import { useTranslation } from 'react-i18next';
import shemaTableService from '../../../service/schema-table-service';

const SchemaTable = props => {
  const navigate = useNavigate();
  const { dbId } = useParams();
  const { t } = useTranslation();
  const [schemas, setSchemas] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(15);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSchemaTable = () => {
    shemaTableService.getShemaTableList(dbId, page).then(response => {
      const data = response.data;
      setTotalRecords(data.totalElements);
      setSchemas(data?.content || []);
    });
  };

  useEffect(fetchSchemaTable, []);

  const handleAdd = () => {
    navigate(`/knowledge/schema-table/${dbId}/new`);
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: t('confirmDelete'),
      header: t('confirm'),
      icon: 'pi pi-exclamation-triangle',
      style: { width: '400px' },
      accept: () => {
        shemaTableService.del(rowData.id).then(() => {
          fetchSchemaTable();
          mmkToast({
            severity: 'success',
            summary: t('success'),
            detail: t('deleteSuccess'),
          });
        });
      }
    });
  };

  const textEditor = (options) => {
    return <InputText
      type="text"
      value={options.value}
      onChange={(e) => options.editorCallback(e.target.value)}
      className="w-100"
    />;
  };

  const operationTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-primary p-button-sm"
          onClick={() => navigate(`/knowledge/schema-table/${dbId}/edit/${rowData.id}`)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData)}
        />
      </div>
    );
  };

  const footerTemplate = () => (
    <div className="d-flex align-items-center justify-content-between gap-3 w-100">
      <div className="d-flex align-items-center gap-3">
        <Button
          type="button"
          icon="pi pi-plus"
          className="p-button-primary p-button-sm"
          onClick={handleAdd}
        />
        <Button
          type="button"
          icon="fa fa-times"
          className="p-button-danger p-button-sm"
          onClick={() => { navigate(-1) }}
        />
      </div>
      <div className="d-flex align-items-center">
        {totalRecords ? (
          <Paginator
            pageLinkSize={3}
            first={first}
            rows={rows}
            totalRecords={totalRecords}
            onPageChange={(e) => {
              setFirst(e.first);
              setRows(e.rows);
              setPage(e.page);
            }}
            style={{ padding: 0 }}
          />
        ) : null}
      </div>
    </div>
  );

  const headerTemplate = () => (
    <div className="d-flex align-items-center">
      <h5 className="mb-0 fw-bold">
        {t('database.selectTable')}
        {/* {t('database.selectTable')} {connection.dbType} {connection.ip}:{connection.port} */}
      </h5>
    </div>
  );

  return (
    <DataTable
      value={schemas}
      editMode="row"
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
        field="schemaName"
        header={t('database.schemaName')}
        editor={textEditor}
        style={{ width: '200px' }}
      />
      <Column
        field="tableName"
        header={t('database.tableName')}
        editor={textEditor}
        style={{ width: '200px' }}
      />
      <Column
        field="idColumn"
        header={t('database.idColumn')}
        editor={textEditor}
        style={{ width: '200px' }}
      />
      <Column
        header={t('operation')}
        body={operationTemplate}
        style={{ width: '150px' }}
      />
    </DataTable>
  );
};

export default SchemaTable;

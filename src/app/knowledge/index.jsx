import React from 'react';
import FileManage from './file-manage';
import DbManage from './db-manage';
import "./index.scss";

export default props => {
  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <FileManage></FileManage>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <DbManage></DbManage>
        </div>
      </div>
    </>
  );
};

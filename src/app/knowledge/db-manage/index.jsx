import React, { useState } from 'react';
import DbConnection from './db-connection';
import "./index.scss";

export default props => { 
  return (
    <div className="d-flex flex-column gap-3">
      <DbConnection/>
    </div>
  );
};

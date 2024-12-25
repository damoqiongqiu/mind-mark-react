import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import "./index.scss";

export default props => {
  return (
    <div className="row">
      <div className="col-md-12">
        Coming soon...
        <Outlet />
      </div>
    </div>
  );
};

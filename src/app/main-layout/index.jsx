import React from 'react';
import { Outlet } from 'react-router-dom';
import FileList from '../file-list';
import "./index.scss";

/**
 * 中间主体内容区域的布局
 *  
 * @author 大漠穷秋
 */
export default props => {
  return (
    <div className="row h-100">
      <div className="col-md-8 h-100">
        <Outlet />
      </div>
      <div className="col-md-4 h-100">
        <FileList />
      </div>
    </div>
  );
};

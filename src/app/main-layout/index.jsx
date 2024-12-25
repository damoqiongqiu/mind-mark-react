import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import "./index.scss";

/**
 * 中间主体内容区域的布局
 * 动态内容
 * 
 * @author 大漠穷秋
 */
export default props => {
  return (
    <>
      <Outlet />
    </>
  );
};

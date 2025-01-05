import React from 'react';
import { Outlet } from 'react-router-dom';

import "./index.scss";

export default props => {
  return (
    <Outlet />
  );
};

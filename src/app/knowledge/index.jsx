import React from 'react';
import PropTypes from 'prop-types';
import FileManage from './file-manage';
import DbManage from './db-manage';
import { TabView, TabPanel } from 'primereact/tabview';
import "./index.scss";

const TABS = [
  {
    header: <span><i className="fa fa-file me-2"></i>File</span>,
    component: FileManage
  },
  {
    header: <span><i className="fa fa-database me-2"></i>Database</span>,
    component: DbManage
  }
];

export const Knowledge = ({ activeIndex = 0 }) => {
  return (
    <TabView activeIndex={activeIndex}>
      {TABS.map(({ header, component: Component }, index) => (
        <TabPanel key={index} header={header}>
          <Component />
        </TabPanel>
      ))}
    </TabView>
  );
};

Knowledge.propTypes = {
  activeIndex: PropTypes.number
};

export default Knowledge;

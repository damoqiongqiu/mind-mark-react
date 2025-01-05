import React from 'react';
import FileManage from '../file-manage';
import DbManage from '../db-manage';
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

export default ({ activeIndex = 0 }) => {
  return (
    <TabView activeIndex={activeIndex} className='knowledge-tabview'>
      {TABS.map(({ header, component: Component }, index) => (
        <TabPanel key={index} header={header}>
          <Component />
        </TabPanel>
      ))}
    </TabView>
  );
};

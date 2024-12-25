import React, { Suspense, useEffect, useState, useRef } from 'react';

import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { BlockUI } from 'primereact/blockui';
import { ProgressSpinner } from 'primereact/progressspinner';

import ErrorBoundary from 'src/app/shared/ErrorBoundary';
import NavBar from 'src/app/shared/nav-bar';
import Footer from 'src/app/shared/footer';
import MindMarkRoutes from 'src/app/routes';

import './index.scss';

const App = props => {
  // 全局公用的弹出消息
  const toast = useRef(null);

  // 全局遮罩
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    //FIXME:全局公用方法有更好的封装？？？
    window.mmkToast = (params) => {
      toast.current.show(params);
    };
    window.showGlobalSpin = () => {
      setBlocked(true);
    }
    window.hideGlobalSpin = () => {
      setBlocked(false);
    }
  }, []);

  return (
    <>
      {/* 全局公用的弹出消息 */}
      <Toast ref={toast} position="top-center" />

      {/* 全局公用的确认框 */}
      <ConfirmDialog dismissableMask />

      {/* 全局遮罩 */}
      <>
        <ProgressSpinner style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          zIndex: 10000000,
          marginLeft: "-50px",
          marginTop: "-50px",
          display: blocked ? "block" : "none"
        }}></ProgressSpinner>
        <BlockUI blocked={blocked} fullScreen >
        </BlockUI >
      </>

      {/* 顶部一级导航条 */}
      <NavBar></NavBar>

      {/* 主体内容区域 */}
      <div className="container main-container">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="loading-container d-flex align-items-center justify-content-center">
              </div>
            }
          >
            <MindMarkRoutes />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 页面底部区域 */}
      <Footer></Footer>
    </>
  );
}

export default App;
import React from 'react';
import FileList from './file-list';
import ChatBox from './chat-box';
import "./index.scss";

/**
 * AI 对话界面布局
 * @author 大漠穷秋
 */
export default props => {
  return (
    <div className="row h-100">
      <div className="col-md-8 h-100">
        <ChatBox />
      </div>
      <div className="col-md-4 h-100">
        <FileList />
      </div>
    </div>
  );
};

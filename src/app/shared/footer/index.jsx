import React from 'react';
import { Container } from 'react-bootstrap';
import './index.scss';

export default props => {
  return (
    <div className="footer bg-body-tertiary position-fixed bottom-0 w-100">
      <Container fluid="md">
        <div className="row">
          <div className="col-md-12 d-flex align-items-center gap-3 text-start">
            <p className="mb-0">
              Powered by <a href="https://gitee.com/mumu-osc/MindMark-React" target="_blank" rel="noopener noreferrer">MindMark-React</a>
            </p>
            <a href='https://gitee.com/mumu-osc/MindMark-React'>
              <img src='https://gitee.com/mumu-osc/MindMark-React/badge/star.svg?theme=dark' alt='star'></img>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

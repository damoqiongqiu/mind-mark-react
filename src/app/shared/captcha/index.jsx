import React from 'react';
import { withTranslation } from 'react-i18next';
import environment from "src/environments/environment";

/**
 * 验证码组件，点击刷新验证码。
 */

class Captcha extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      capchaURL: environment.dataURL.capchaURL
    };
    this.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.setState({ capchaURL: `${this.state.capchaURL}&kill_cache=${new Date().getTime()}` });
  }

  render() {
    const { t } = this.props;
    return (
      <>
        <img src={this.state.capchaURL} style={{ cursor: "pointer", width: "160px", height: "60px" }} onClick={this.refresh} />
        <p>{t('refreshCaptcha')}</p>
      </>
    );
  }
}

export default withTranslation()(Captcha);
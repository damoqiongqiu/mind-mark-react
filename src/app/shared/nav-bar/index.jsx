import React, { useState } from 'react';
import { Tag } from 'primereact/tag';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import signService from '../../service/sign-in-service';
import { signOut } from '../../shared/session';
import './index.scss';

const languages = [
  { name: '汉语', value: 'zh' },
  { name: 'English', value: 'en' }
];

const NavBar = props => {

  //导航对象
  const navigate = useNavigate();

  //redux hooks
  const dispatch = useDispatch();

  //sessionUser，从 redux 中获取
  const sessionUser = useSelector((state) => state.session.user);

  //i18n hooks
  const { i18n } = useTranslation();

  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const toggleNav = () => {
    setIsNavExpanded(prevState => !prevState);
  };

  //当前选中的语言
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => {
      let lng = i18n.language;
      let result = languages.filter(item => lng.indexOf(item.value) !== -1)[0];
      result = result || languages[0];
      return result;
    }
  );

  /**
   * 退出登录
   */
  const doSignOut = () => {
    console.log("退出登录");
    signService.signOut().then(response => {
      dispatch(signOut());
      navigate('/chat');
    }, error => {
      console.error(error);
    });
  }

  const menus = [
    {
      label: i18n.t("chat"),
      icon: "fa-comment-o",
      url: "/chat"
    },
    {
      label: i18n.t("knowledge"),
      icon: "fa-cog",
      url: "/knowledge"
    }
  ];

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary main-nav" fixed="top">
      <Container fluid="md">
        <Navbar.Brand href="/chat">
          <Tag severity="danger" value="M" className='brand-logo'></Tag>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {
              menus.map((item, index) => {
                return (
                  <Nav.Link
                    key={index}
                    as={NavLink}
                    to={item.url}
                  >
                    <i className={`fa ${item.icon}`}></i>&nbsp;
                    {item.label}
                  </Nav.Link>
                );
              })
            }
          </Nav>
          <Nav>
            <NavDropdown title={selectedLanguage.name}>
              {
                languages.map((item, index) => {
                  return (
                    <NavDropdown.Item
                      href="#"
                      key={index}
                      onClick={e => {
                        setSelectedLanguage(item);
                        i18n.changeLanguage(item.value);
                      }}
                    >
                      {item.name}
                    </NavDropdown.Item>
                  );
                })
              }
            </NavDropdown>
            <Nav.Link href="https://gitee.com/mumu-osc/mind-mark-react" target="_blank">
              <i className="fa fa-github"></i>
            </Nav.Link>
            {
              sessionUser ?
                <>
                  <Nav.Link
                    as={NavLink}
                    to="/manage/chart"
                  >
                    <i className="fa fa-cog" />
                  </Nav.Link>
                  <Nav.Link href="#" onClick={doSignOut}>
                    <i className="fa fa-sign-out"></i>
                  </Nav.Link>
                </>
                :
                <>
                  <Nav.Link
                    as={NavLink}
                    to="/sign-in"
                  >
                    <i className="fa fa-sign-in" />
                  </Nav.Link>
                  <Nav.Link
                    as={NavLink}
                    to="/sign-up">
                    <i className="fa fa-user-plus" />
                  </Nav.Link>
                </>
            }
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
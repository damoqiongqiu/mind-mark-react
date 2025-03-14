import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as _ from 'lodash';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { Nav } from 'react-bootstrap';
import LoadingDot from "../../shared/loading-dot";
import { setUploadedFile } from '../../shared/store';
import fileService from '../../service/file-service';
import chatService from "../../service/chat-service";
import ajv from "../../service/ajv-validate-service";

import "highlight.js/styles/github-dark.css";
import "./index.scss";

const schema = {
  "type": "object",
  "properties": {
    "msg": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
    },
    "modelType": {
      "type": "string",
      "enum": ["openai", "zhipuai", "ollama"]
    }
  },
  "required": ["msg", "modelType"],
}
const ajvValidate = ajv.compile(schema);

export default props => {

  //sessionUser，从 redux 中获取
  const sessionUser = useSelector((state) => state.session.user);

  //i18n hooks
  const { i18n } = useTranslation();

  //表单校验状态
  const [errors, setErrors] = useState({});

  //是否正在加载
  const [isLoading, setIsLoading] = useState(false);

  //内容 markdown
  const [markdownContent, setMarkdownContent] = useState('');

  //欢迎消息
  const [welcomeMsg, setWelcomeMsg] = useState('');

  //当前选中的文件
  const selectedFiles = useSelector((state) => state.selectedFiles.value);

  //Redux hooks
  const dispatch = useDispatch();
  const handleFileUploadSuccess = (selectedFile) => {
    const fileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      lastModified: selectedFile.lastModified,
    };
    dispatch(setUploadedFile(fileData));
  };

  // 支持的文件格式
  const supportedFormats = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json'
  ];

  const [formData, setFormData] = useState({
    msg: "",
    modelType: "openai"
  });

  const modelOptions = [
    { label: '模力方舟', value: 'openai' },
    { label: 'Deepseek-r1', value: 'ollama' },
    { label: 'ZhipuAI', value: 'zhipuai' }
  ];

  const handleInputChange = (key, value) => {
    const temp = {
      ...formData,
      [key]: value
    };
    setFormData(temp);
  }

  const onSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);
    const isValid = ajvValidate(formData);
    setErrors({});

    if (!isValid) {
      const fieldErrors = {};

      ajvValidate.errors.forEach((error) => {
        const field = error.instancePath.substring(1);
        const keyword = error.keyword;
        // 获取 i8n 中的错误信息，如果没有则使用默认的错误信息。i18n 字符串定义在 src\app\shared\i18n\ 中。
        const errorMessage = i18n.t(`validation.${keyword}`, error.params);
        fieldErrors[field] = errorMessage || error.message;
      });

      setErrors(fieldErrors);
      console.log(fieldErrors);
      mmkToast({
        severity: 'error',
        summary: 'Error',
        detail: fieldErrors.msg,
      });
      setIsLoading(false);
      return;
    }

    console.log(formData);
    setWelcomeMsg("");
    setMarkdownContent("");

    if (selectedFiles && selectedFiles.length) {
      requestEmbeddingData();
    } else {
      requestChatStream();
    }
  }

  /**
   * 流式响应
   */
  const bufferRef = useRef([]);
  useEffect(() => {
    bufferRef.current = [];
    const timer = setInterval(() => {
      console.log("buffer", bufferRef.current);
      if (bufferRef.current.length) {
        let data = bufferRef.current.shift();
        console.log("Processed:", data);
        setMarkdownContent((prev) => prev + data);
      }
    }, 50);
    return () => {
      clearInterval(timer);
      console.log(i18n.t('timer.cleanup'));
    };
  }, []);
  const requestChatStream = () => {
    chatService
      .chatStream(formData.modelType, formData.msg, bufferRef.current)
      .then((response) => {
        console.log(response);
      })
      .finally(() => {
        setFormData({ ...formData, msg: "" });
        setIsLoading(false);
      });
  };

  /**
   * 一次性全部返回的请求
   */
  const requestChatData = () => {
    chatService
      .chat(formData.modelType, formData.msg)
      .then(response => {
        let data = response.data;
        console.log(data);
        setMarkdownContent(data);
      }).finally(() => {
        setFormData({ ...formData, ...{ msg: "" } });
        setIsLoading(false);
      });
  }

  /**
   * 带有嵌入文件的请求
   */
  const requestEmbeddingData = () => {
    chatService
      .embedding(formData.modelType, { msg: formData.msg, fileIds: selectedFiles.map(file => file.id) })
      .then(response => {
        let data = response.data;
        console.log(data);
        setMarkdownContent(data);
      })
      .finally(() => {
        setFormData({ ...formData, ...{ msg: "" } });
        setIsLoading(false);
      });
  }

  /**
   * 欢迎消息
   */
  useEffect(() => {
    let text = i18n.t("welcomeMsg") || "";
    let index = 0;
    let len = text.length;
    let prev = "";
    let timer = setInterval(() => {
      if (index < len) {
        prev = prev + text[index];
        setWelcomeMsg(prev);
      } else {
        clearInterval(timer);
      }
      index += 1;
    }, 100);
    return () => clearInterval(timer);
  }, []);


  /**
   * 处理文件上传
   * @param {*} event
   */
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      mmkToast({
        severity: 'error',
        summary: 'Error',
        detail: i18n.t('fileUpload.selectFile'),
      });
      return;
    }

    if (!supportedFormats.includes(selectedFile.type)) {
      mmkToast({
        severity: 'error',
        summary: 'Error',
        detail: i18n.t('fileUpload.unsupportedFormat'),
      });
      return;
    }

    showGlobalSpin();

    fileService.uploadFiles([selectedFile]).then(
      response => {
        mmkToast({
          severity: 'success',
          summary: 'Success',
          sticky: false,
          life: 5000,
          detail: i18n.t('fileUpload.uploadSuccess'),
        });
        console.log(response);
        handleFileUploadSuccess(selectedFile);
      },
      error => {
        console.error(error);
        mmkToast({
          severity: 'error',
          summary: 'Error',
          detail: i18n.t('error'),
        });
      }
    ).finally(() => {
      console.log("---");
      hideGlobalSpin();
      event.target.value = null;
    });
  };

  return (
    <div className="chat-box h-100 d-flex flex-column">
      <div className="content-area flex-grow-1">
        {isLoading ?
          (<LoadingDot />)
          :
          markdownContent ?
            (
              <div className="bootstrap-markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {markdownContent}
                </ReactMarkdown>
              </div>
            )
            :
            (
              <div className="d-flex justify-content-center align-items-center h-100">
                <p className="fw-bold fs-4 text-center">{welcomeMsg}</p>
              </div>
            )}
      </div>
      {
        sessionUser ?
          <div className="input-area mt-2">
            <form onSubmit={onSubmit}>
              <textarea
                rows="5"
                name="msg"
                className={`form-control ${errors.msg ? "has-error" : ""}`}
                value={formData.msg}
                onChange={(e) => handleInputChange('msg', e.target.value)}
                placeholder={i18n.t("pleaseInputSomeContent")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    onSubmit(event);
                  }
                }}
              />
              <div className="pt-2 ps-2 pe-2 pb-2">
                <label
                  className="btn btn-secondary me-2"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={i18n.t("upload")}
                >
                  <i className="fa fa-upload"></i>
                  <span className="d-none text-hover">{i18n.t("upload")}</span>
                  <input
                    id="file-input"
                    type="file"
                    className="d-none"
                    accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.json"
                    onChange={handleFileUpload}
                  />
                </label>
                <Dropdown
                  value={formData.modelType}
                  onChange={(e) => handleInputChange('modelType', e.value)}
                  options={modelOptions}
                  className="me-2"
                  style={{ width: '150px' }}
                />
                <label className='text-warning'>
                  {
                    (selectedFiles.length) ?
                      <Tag severity="warning">
                        <div className="flex align-items-center gap-3">
                          <span className="text-base">
                            {i18n.t('fileUpload.selectedFiles', { count: selectedFiles.length })}
                          </span>
                        </div>
                      </Tag>
                      :
                      i18n.t("knowledgeMsg")
                  }
                </label>
                <button
                  type="submit"
                  className="btn btn-secondary pull-right"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title={i18n.t("send")}
                  onClick={onSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa fa-spinner fa-spin"></i>
                    </>
                  ) : (
                    <>
                      <i className="fa fa-paper-plane"></i>
                      <span className="d-none text-hover">{i18n.t("send")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          :
          <div className="p-3 text-center bottom-login-btn" >
            <Nav.Link
              as={NavLink}
              to="/sign-in"
              className="btn btn-secondary"
              style={{ width: 'fit-content', margin: '0 auto' }}
            >
              <i className="fa fa-sign-in me-2" />
              {i18n.t("signIn")}
            </Nav.Link>
          </div>
      }
    </div>
  );
}

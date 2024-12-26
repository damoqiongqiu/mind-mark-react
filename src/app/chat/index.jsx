import React, { useState, useEffect, useRef } from 'react';
import { Tag } from 'primereact/tag';
import LoadingDot from "../shared/loading-dot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ajv from "../service/ajv-validate-service";
import { useTranslation } from 'react-i18next';
import * as _ from 'lodash';
import fileUploadService from 'src/app/service/file-upload-service';
import chatService from "src/app/service/chat-service";

import "highlight.js/styles/github-dark.css";
import "./index.scss";

const schema = {
  "type": "object",
  "properties": {
    "msg": {
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
    }
  },
  "required": ["msg"],
}
const ajvValidate = ajv.compile(schema);

export default function MarkdownRenderer() {
  //i18n hooks
  const { i18n } = useTranslation();

  //表单校验状态
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  //内容 markdown
  const [markdownContent, setMarkdownContent] = useState('');
  const contentRef = useRef('');

  //欢迎消息
  const [welcomeMsg, setWelcomeMsg] = useState('');

  const [currentFile, setCurrentFile] = useState(null);

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
  });

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

    //TODO:接受流式数据
    if (currentFile) {
      requestEmbeddingData();
    } else {
      requestChatData();
    }
  }

  const requestChatData = () => {
    chatService
      .chat(formData.msg)
      .then(response => {
        let data = response.data;
        console.log(data);
        setMarkdownContent(data);
      }).finally(() => {
        setFormData({ ...formData, ...{ msg: "" } });
        setIsLoading(false);
      });
  }

  const requestEmbeddingData = () => {
    chatService
      // .embedding({ msg: formData.msg, fileIds: ["23"] })  //TODO:让用户在页面上选择文件，把文件的 ID 传递给服务端。
      .embedding({ msg: formData.msg })
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
   * 打字机效果
   * @param {*} text 
   * @param {*} setterFn 
   * @param {*} speed 
   * @returns 
   */
  const typeWriter = (text, setterFn, speed = 100) => {
    text = text || "";
    let index = 0;
    let len = text.length;
    let prev = "";

    const timer = setInterval(() => {
      if (index < len) {
        prev = prev + text[index];
        setterFn(prev);
      } else {
        clearInterval(timer);
      }
      index += 1;
    }, speed);

    return timer;
  }

  useEffect(() => {
    let text = i18n.t("welcomeMsg");
    let timer = typeWriter(text, setWelcomeMsg);
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
        detail: "请选择一个文件",
      });
      return;
    }

    if (!supportedFormats.includes(selectedFile.type)) {
      mmkToast({
        severity: 'error',
        summary: 'Error',
        detail: "不支持的文件格式，请上传 pdf、txt、markdown、doc、docx、ppt、pptx、xls、xlsx 或 json 格式的文件。",
      });
      return;
    }

    showGlobalSpin();

    fileUploadService.uploadFiles([selectedFile]).then(
      response => {
        mmkToast({
          severity: 'success',
          summary: 'Success',
          sticky: false,
          life: 5000,
          detail: "文件上传成功，服务端正在解析文件内容，速度取决于文件的大小和服务器性能。",
        });
        setCurrentFile(selectedFile);
        console.log(response);
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
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
      <div className="input-area mt-2">
        <form onSubmit={onSubmit}>
          <textarea
            rows="5"
            name="msg"
            className={`form-control ${errors.msg ? "has-error" : ""}`}
            value={formData.msg}
            onChange={(e) => handleInputChange('msg', e.target.value)}
            placeholder={i18n.t("pleaseInputSomeContent")}
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
            {/* <button
              type="button"
              className="btn btn-secondary me-2 "
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title={i18n.t("knowledge")}
            >
              <i className="pi pi-book"></i>
              <span className="d-none text-hover">{i18n.t("knowledge")}</span>
            </button> */}
            <label className='text-warning'>
              {
                (currentFile && currentFile.name) ?
                  <Tag severity="warning">
                    <div className="flex align-items-center gap-3">
                      <span className="text-base">{currentFile.name}</span>
                      <i
                        className="pi pi-times text-xs"
                        style={{ cursor: "pointer" }}
                        onClick={() => setCurrentFile(null)}>
                      </i>
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
    </div>
  );
}

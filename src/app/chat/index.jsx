import React, { useState, useEffect, useRef } from 'react';
import { Tag } from 'primereact/tag';
import LoadingDot from "../shared/loading-dot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ajv from "../service/ajv-validate-service";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setUploadedFile } from '../shared/store';
import fileService from 'src/app/service/file-service';
import chatService from "src/app/service/chat-service";
import * as _ from 'lodash';
import environment from "src/environments/environment";

import "highlight.js/styles/github-dark.css";
import "./index.scss";

const chatStreamURL = environment.dataURL.chatStreamURL;

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
    setMarkdownContent("");

    //TODO:接受流式数据
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
      console.log("清理定时器");
    };
  }, []);
  const requestChatStream = () => {
    chatService
      .chatStream(formData.msg, bufferRef.current)
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

  /**
   * 带有嵌入文件的请求
   */
  const requestEmbeddingData = () => {
    chatService
      .embedding({ msg: formData.msg, fileIds: selectedFiles.map(file => file.id) })
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

    fileService.uploadFiles([selectedFile]).then(
      response => {
        mmkToast({
          severity: 'success',
          summary: 'Success',
          sticky: false,
          life: 5000,
          detail: "文件上传成功，服务端正在解析文件内容，速度取决于文件的大小和服务器性能。",
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
            <label className='text-warning'>
              {
                (selectedFiles.length) ?
                  <Tag severity="warning">
                    <div className="flex align-items-center gap-3">
                      <span className="text-base">选中了 {selectedFiles.length} 个文件。</span>
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

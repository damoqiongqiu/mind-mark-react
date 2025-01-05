/**
 * 服务端接口路径配置。
 * lodash 提供的模板字符串工具方法，可以将字符串中的 <%= %> 替换为指定的值，与传统的 JSP 标签用法非常类似。
 * @see https://lodash.com/docs/4.17.15#template
 * back-end-url.ts 与 mock-data-url.ts 中的配置项 key 必须完全一致。
 * 这些配置项会被 environment.* 中的 dataURL 属性引用。所有 *.service.ts 文件中的请求路径都会从 environment.* 中的 dataURL 属性中获取。
 */
export const dataURL = {
  chatURL: "/mind-mark/chat?msg=<%= msg %>",                     //直接对话，不预先查询向量数据库
  chatStreamURL: "/mind-mark/chatStream?msg=<%= msg %>",         //流式对话，直接对话，不预先查询向量数据库
  embeddingURL: "/mind-mark/embedding",                          //首先查询向量库，然后根据向量库返回的上下文生成答案
  fileUploadURL: "/mind-mark/file/upload",
  fileListURL: "/mind-mark/file/list/<%= page %>",
  delFileURL: "/mind-mark/file/delete/<%= id %>",
  getDbConfigListURL: "/mind-mark/db/list/<%= userId %>/<%= page %>",
  getDbConfigDetailURL: "/mind-mark/db/<%= id %>",
  saveDbConfigURL: "/mind-mark/db/save",
  deleteDbConfigURL: "/mind-mark/db/delete/<%= id %>",
  getShemaTableListURL: "/mind-mark/schema-table/list/<%= dbId %>/<%= page %>",
  getShemaTableDetailURL: "/mind-mark/schema-table/<%= id %>",
  saveShemaTableURL: "/mind-mark/schema-table/save",
  deleteShemaTableURL: "/mind-mark/schema-table/delete/<%= id %>",
};
/**
 * 静态的 Mock 数据，方便开发的时候使用。
 * 关于此配置项的功能细节，请参考 base-url-config.ts 中的注释。
 */
export const dataURL = {
  chatURL: "mock-data/chat.json",                 //直接对话，不预先查询向量数据库
  chatStreamURL: "mock-data/chat-stream.json",    //流式对话，直接对话，不预先查询向量数据库
  embeddingURL: "mock-data/embedding.json",       //首先查询向量库，然后根据向量库返回的上下文生成答案
  fileUploadURL: "",
};
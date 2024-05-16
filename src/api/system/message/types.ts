export interface MessageVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 消息 id
   */
  messageId: string | number;

  /**
   * 父级消息 id
   */
  parentMessageId: string | number;

  /**
   * 父级回答消息 id
   */
  parentAnswerMessageId: string | number;

  /**
   * 父级问题消息 id
   */
  parentQuestionMessageId: string | number;

  /**
   * 上下文数量
   */
  contextCount: number;

  /**
   * 问题上下文数量
   */
  questionContextCount: number;

  /**
   * 消息类型枚举
   */
  messageType: number;

  /**
   * 聊天室 id
   */
  chatRoomId: string | number;

  /**
   * 对话 id
   */
  conversationId: string | number;

  /**
   * API 类型
   */
  apiType: string;

  /**
   * ApiKey
   */
  apiKey: string;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 消息的原始请求或响应数据
   */
  originalData: string;

  /**
   * 错误的响应数据
   */
  responseErrorData: string;

  /**
   * 输入消息的 tokens
   */
  promptTokens: number;

  /**
   * 输出消息的 tokens
   */
  completionTokens: number;

  /**
   * 累计 Tokens
   */
  totalTokens: number;

  /**
   * 模型名称
   */
  modelName: string;

  /**
   * 聊天记录状态
   */
  status: number;

  /**
   * 是否隐藏 0 否 1 是
   */
  isHide: string | number;

  /**
   * 备注
   */
  remark: string;

}

export interface MessageForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 消息 id
   */
  messageId?: string | number;

  /**
   * 父级消息 id
   */
  parentMessageId?: string | number;

  /**
   * 父级回答消息 id
   */
  parentAnswerMessageId?: string | number;

  /**
   * 父级问题消息 id
   */
  parentQuestionMessageId?: string | number;

  /**
   * 上下文数量
   */
  contextCount?: number;

  /**
   * 问题上下文数量
   */
  questionContextCount?: number;

  /**
   * 消息类型枚举
   */
  messageType?: number;

  /**
   * 聊天室 id
   */
  chatRoomId?: string | number;

  /**
   * 对话 id
   */
  conversationId?: string | number;

  /**
   * API 类型
   */
  apiType?: string;

  /**
   * ApiKey
   */
  apiKey?: string;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 消息的原始请求或响应数据
   */
  originalData?: string;

  /**
   * 错误的响应数据
   */
  responseErrorData?: string;

  /**
   * 输入消息的 tokens
   */
  promptTokens?: number;

  /**
   * 输出消息的 tokens
   */
  completionTokens?: number;

  /**
   * 累计 Tokens
   */
  totalTokens?: number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 聊天记录状态
   */
  status?: number;

  /**
   * 是否隐藏 0 否 1 是
   */
  isHide?: string | number;

  /**
   * 备注
   */
  remark?: string;

}

export interface MessageQuery extends PageQuery {
  /**
   * 消息 id
   */
  messageId?: string | number;

  /**
   * 父级消息 id
   */
  parentMessageId?: string | number;

  /**
   * 父级回答消息 id
   */
  parentAnswerMessageId?: string | number;

  /**
   * 父级问题消息 id
   */
  parentQuestionMessageId?: string | number;

  /**
   * 上下文数量
   */
  contextCount?: number;

  /**
   * 问题上下文数量
   */
  questionContextCount?: number;

  /**
   * 消息类型枚举
   */
  messageType?: number;

  /**
   * 聊天室 id
   */
  chatRoomId?: string | number;

  /**
   * 对话 id
   */
  conversationId?: string | number;

  /**
   * API 类型
   */
  apiType?: string;

  /**
   * ApiKey
   */
  apiKey?: string;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 消息的原始请求或响应数据
   */
  originalData?: string;

  /**
   * 错误的响应数据
   */
  responseErrorData?: string;

  /**
   * 输入消息的 tokens
   */
  promptTokens?: number;

  /**
   * 输出消息的 tokens
   */
  completionTokens?: number;

  /**
   * 累计 Tokens
   */
  totalTokens?: number;

  /**
   * 模型名称
   */
  modelName?: string;

  /**
   * 聊天记录状态
   */
  status?: number;

  /**
   * 是否隐藏 0 否 1 是
   */
  isHide?: string | number;

}

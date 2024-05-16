import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import {MessageForm, MessageQuery, MessageVO} from '@/api/system/message/types';

/**
 * 查询聊天消息列表
 * @param query
 * @returns {*}
 */

export const listMessage = (query?: MessageQuery): AxiosPromise<MessageVO[]> => {
  return request({
    url: '/system/message/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询聊天消息详细
 * @param id
 */
export const getMessage = (id: string | number): AxiosPromise<MessageVO> => {
  return request({
    url: '/system/message/' + id,
    method: 'get'
  });
};

/**
 * 新增聊天消息
 * @param data
 */
export const addMessage = (data: MessageForm) => {
  return request({
    url: '/system/message',
    method: 'post',
    data: data
  });
};

/**
 * 修改聊天消息
 * @param data
 */
export const updateMessage = (data: MessageForm) => {
  return request({
    url: '/system/message',
    method: 'put',
    data: data
  });
};

/**
 * 删除聊天消息
 * @param id
 */
export const delMessage = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/message/' + id,
    method: 'delete'
  });
};

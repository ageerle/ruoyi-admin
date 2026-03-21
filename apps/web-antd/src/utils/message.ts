import { useAppConfig } from '@vben/hooks';
import { useAccessStore } from '@vben/stores';

import { useEventSource, useWebSocket } from '@vueuse/core';

const { apiURL, clientId, sseEnable, websocketEnable } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

export function useSseMessage() {
  /**
   * 未开启 不监听
   */
  if (!sseEnable) {
    console.warn('当前未开启sse.');
    return;
  }
  const accessStore = useAccessStore();
  const token = accessStore.accessToken;

  const sseAddr = `${apiURL}/resource/sse?clientid=${clientId}&Authorization=Bearer ${token}`;

  const sseReturnData = useEventSource(sseAddr, [], {
    autoReconnect: {
      delay: 1000,
      onFailed() {
        console.error('sse重连失败.');
      },
      retries: 3,
    },
  });

  return sseReturnData;
}

function isUrl(path?: string) {
  return /^https?:\/\//.test(path || '');
}

export function useWebSocketMessage() {
  if (!websocketEnable) {
    console.warn('当前未开启websocket.');
    return;
  }
  let apiUrlStr = String(apiURL);
  /**
   * 这里可能有两种情况 兼容dev模式的proxy或者prod模式但是没有用全路径比如http://xxx/xxx
   * 1. apiUrl为https://xxx.com/xxx
   * 2. apiUrl为/xxx
   * 转换后为http链接形式
   */
  if (!isUrl(apiURL)) {
    // 协议+域名
    apiUrlStr = `${window.location.protocol}//${window.location.host}${apiURL}`;
  }
  const accessStore = useAccessStore();
  const token = accessStore.accessToken;
  // 这里是http链接形式
  let websocketAddr = `${apiUrlStr}/resource/websocket?clientid=${clientId}&Authorization=Bearer ${token}`;
  // http/https处理
  websocketAddr = window.location.protocol.includes('https')
    ? websocketAddr.replace('https://', 'wss://')
    : websocketAddr.replace('http://', 'ws://');
  // console.log('websocketUrl: ' + websocketAddr);

  const websocketResponse = useWebSocket(websocketAddr, {
    autoReconnect: {
      // 重连最大次数
      retries: 3,
      // 重连间隔
      delay: 1000,
      onFailed() {
        console.error('websocket重连失败.');
      },
    },
    heartbeat: {
      message: JSON.stringify({ type: 'ping' }),
      // 发送心跳的间隔
      interval: 10_000,
      // 接收到心跳response的超时时间
      pongTimeout: 2000,
    },
    onConnected() {
      console.info('websocket已经连接');
    },
    onDisconnected() {
      console.warn('websocket已经断开');
    },
  });

  return websocketResponse;
}

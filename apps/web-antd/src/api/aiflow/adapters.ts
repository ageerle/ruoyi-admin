import { requestClient } from '#/api/request'

export const adapters = {
  httpGet<T = any>(url: string, config?: any) {
    return requestClient.get<T>(url, config)
  },

  httpPost<T = any>(url: string, data?: any, config?: any) {
    return requestClient.post<T>(url, data, config)
  },

  httpPut<T = any>(url: string, data?: any, config?: any) {
    return requestClient.put<T>(url, data, config)
  },

  httpDelete<T = any>(url: string, config?: any) {
    return requestClient.delete<T>(url, config)
  }
}

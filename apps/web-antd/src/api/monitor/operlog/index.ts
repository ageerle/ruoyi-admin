import type { OperationLog } from './model';

import type { IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { requestClient } from '#/api/request';

enum Api {
  operLogClean = '/monitor/operlog/clean',
  operLogExport = '/monitor/operlog/export',
  operLogList = '/monitor/operlog/list',
  root = '/monitor/operlog',
}

export function operLogList(params?: PageQuery) {
  return requestClient.get<PageResult<OperationLog>>(Api.operLogList, {
    params,
  });
}

export function operLogDelete(operIds: IDS) {
  return requestClient.deleteWithMsg<void>(`${Api.root}/${operIds}`);
}

export function operLogClean() {
  return requestClient.deleteWithMsg<void>(Api.operLogClean);
}

export function operLogExport(data: any) {
  return commonExport(Api.operLogExport, data);
}

export interface Flow {
  id: string;
  createTime: string;
  updateTime: string;
  tenantId: string;
  delFlag: string;
  definitionId: string;
  flowName?: any;
  instanceId: string;
  taskId: string;
  cooperateType: number;
  cooperateTypeName: string;
  businessId?: any;
  nodeCode: string;
  nodeName: string;
  nodeType: number;
  targetNodeCode: string;
  targetNodeName: string;
  approver: string;
  approveName: string;
  collaborator?: any;
  permissionList?: any;
  skipType: string;
  flowStatus: string;
  flowTaskStatus?: any;
  flowStatusName?: any;
  message: string;
  ext: null | string;
  createBy?: any;
  formCustom: string;
  formPath: string;
  flowCode?: any;
  version?: any;
  runDuration: string;
  nickName?: any;
}

export interface FlowInfoResponse {
  image: string;
  list: Flow[];
}

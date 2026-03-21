export interface OperationLog {
  operId: string;
  tenantId: string;
  title: string;
  businessType: string;
  businessTypes?: any;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName: string;
  operUrl: string;
  operIp: string;
  operLocation: string;
  operParam: string;
  jsonResult: string;
  status: string;
  errorMsg: string;
  operTime: string;
  costTime: number;
}

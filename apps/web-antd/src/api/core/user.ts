import { requestClient } from '#/api/request';

export interface Role {
  dataScope: string;
  flag: boolean;
  roleId: number;
  roleKey: string;
  roleName: string;
  roleSort: number;
  status: string;
  superAdmin: boolean;
}

export interface User {
  avatar: string;
  createTime: string;
  deptId: number;
  deptName: string;
  email: string;
  loginDate: string;
  loginIp: string;
  nickName: string;
  phonenumber: string;
  remark: string;
  roles: Role[];
  sex: string;
  status: string;
  tenantId: string;
  userId: number;
  userName: string;
  userType: string;
}

export interface UserInfoResp {
  permissions: string[];
  roles: string[];
  user: User;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfoResp>('/system/user/getInfo');
}

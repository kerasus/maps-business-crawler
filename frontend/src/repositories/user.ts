import BaseAPI from './BaseAPI'
import type { AxiosResponse } from 'axios'

export type UserRolesType = 'admin' | 'manager' | 'user'

export const userRoleOptions = [
  { label: 'مدیر سیستم', value: 'admin' },
  { label: 'مدیر', value: 'manager' },
  { label: 'کاربر', value: 'user' }
]

export type RoleType = {
  id: number | null;
  name: string | null;
  guard_name: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export type UserType = {
  id: number | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
  username: string | null;
  employee_code: string | null;
  mobile: string | null;
  roles_list: string[];
  permissions_list: string[];
  roles: RoleType[];
  email_verified_at: string | null;
  mobile_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export function getUserRoleLabel (roleName: string): string {
  const targetRole = userRoleOptions.find((item) => item.value === roleName)
  return targetRole?.label ?? roleName
}

export default class UserAPI extends BaseAPI<UserType> {
  constructor () {
    super('/users')
    this.defaultObject = {
      id: null,
      firstname: null,
      lastname: null,
      email: null,
      username: null,
      employee_code: null,
      mobile: null,
      roles: [],
      roles_list: [],
      permissions_list: [],
      email_verified_at: null,
      mobile_verified_at: null,
      created_at: null,
      updated_at: null
    }
    this.endpoints = {
      ...this.endpoints,
      assignRole: (userId: number) => `${this.baseEndpoint}/${userId}/assign-role`,
      removeRole: (userId: number) => `${this.baseEndpoint}/${userId}/remove-role`
    }
  }

  async assignRole (userId: number, role: string): Promise<{ message: string, data: { user: UserType } }> {
    const response: AxiosResponse<{ message: string, data: { user: UserType } }> =
      await this.getAxiosInstanceWithToken().post(this.endpoints.assignRole(userId), { role })
    return response.data
  }

  async removeRole (userId: number, role: string): Promise<{ message: string, data: { user: UserType } }> {
    const response: AxiosResponse<{ message: string, data: { user: UserType } }> =
      await this.getAxiosInstanceWithToken().post(this.endpoints.removeRole(userId), { role })
    return response.data
  }
}

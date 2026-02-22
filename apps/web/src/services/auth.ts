import { gql } from './api'
import type { AuthResponse, LoginCredentials } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await gql<{
      login: { token: string; account: { account_id: string; account: string; account_role: string } }
    }>(
      `mutation Login($account: String!, $password: String!) {
        login(account: $account, password: $password) {
          token
          account { account_id account account_role }
        }
      }`,
      { account: credentials.account, password: credentials.password },
    )
    return {
      token: data.login.token,
      user: {
        id: String(data.login.account.account_id),
        account: data.login.account.account,
        account_role: data.login.account.account_role,
      },
    }
  },
}

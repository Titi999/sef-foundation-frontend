export interface UserLoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRoles;
  permissions: string[] | null;
  remember_token: string | null;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  deactivated_at: Date;
  status: string;
  firstLogin: boolean;
}

export interface VerifyLogin {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export type ForgotPasswordData = Pick<UserLoginData, 'email'>;

export type ResetPasswordData = {
  confirmPassword: string;
} & Pick<UserLoginData, 'password'>;

export enum UserRoles {
  SUPER_ADMIN = 'super admin',
  ADMIN = 'admin',
  BENEFICIARY = 'beneficiary',
}

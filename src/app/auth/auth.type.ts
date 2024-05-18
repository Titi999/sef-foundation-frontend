export interface UserLoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[] | null;
  remember_token: string | null;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface VerifyLogin {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export type ForgotPasswordData = Pick<UserLoginData, 'email'>;

export type ResetPasswordData = {
  confirmPassword: string;
} & Pick<UserLoginData, 'password'>;

export interface UserLoginResponse {
  message: string;
  data: {
    user: User;
  };
}

export interface UserData {
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
}

export interface VerifyLogin {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Response<T> {
  message: string;
  data: T;
}

export type ForgotPasswordData = Pick<UserData, 'email'>;

export type ResetPasswordData = {
  confirmPassword: string;
} & Pick<UserData, 'password'>;

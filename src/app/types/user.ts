export interface UserLoginResponse {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      permissions: string[] | null;
      remember_token: string | null;
      email_verified_at: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface UserData {
  email: string;
  password: string;
}

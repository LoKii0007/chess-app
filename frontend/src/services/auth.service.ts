import api from './api';

export interface RegisterData {
  fName: string;
  lName: string;
  username: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      fName: string;
      lName: string;
      username: string;
    };
    token: string;
  };
}

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
  return response.data;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/v1/auth/login', data);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/users/me');
  return response.data;
};





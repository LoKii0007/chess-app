import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login as loginService, register as registerService, getCurrentUser } from '../services/auth.service';
import type { LoginData, RegisterData } from '../services/auth.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Query key factory
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Get current user query
export const useCurrentUser = () => {
  const token = localStorage.getItem('token');

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response: any = await getCurrentUser();
      return response.data;
    },
    enabled: !!token, // Only run if token exists
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginData) => loginService(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Update query cache
        queryClient.setQueryData(authKeys.user(), response.data.user);

        toast.success('Login successful!');
        navigate('/');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterData) => registerService(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Update query cache
        queryClient.setQueryData(authKeys.user(), response.data.user);

        toast.success('Registration successful!');
        navigate('/');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        errors.forEach((err: any) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      } else {
        toast.error(message);
      }
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear query cache
      queryClient.removeQueries({ queryKey: authKeys.all });

      toast.success('Logged out successfully');
    },
  });
};


import { Request, Response } from 'express';
import { registerUser, loginUser } from '../../../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message === 'Username already exists' ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to register user',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.message === 'Invalid username or password' ? 401 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to login',
    });
  }
};


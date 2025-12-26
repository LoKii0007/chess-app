import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../config/db';
import { RegisterInput, LoginInput } from '../api/v1/validators/auth.validator';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 12;

export interface AuthResponse {
  user: {
    id: string;
    fName: string;
    lName: string;
    username: string;
  };
  token: string;
}

export const registerUser = async (payload: RegisterInput): Promise<AuthResponse> => {
  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        fName: payload.fName,
        lName: payload.lName,
        username: payload.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        fName: true,
        lName: true,
        username: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    return {
      user,
      token,
    };
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      throw error;
    }
    console.error('Error registering user:', error);
    throw new Error('Failed to register user');
  }
};

export const loginUser = async (payload: LoginInput): Promise<AuthResponse> => {
  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
      select: {
        id: true,
        fName: true,
        lName: true,
        username: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  } catch (error: any) {
    if (error.message === 'Invalid username or password') {
      throw error;
    }
    console.error('Error logging in user:', error);
    throw new Error('Failed to login user');
  }
};

export const verifyToken = (token: string): { userId: string; username: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};


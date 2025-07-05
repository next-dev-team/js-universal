import axios from 'axios';

const API_BASE_URL = 'https://gorest.co.in/public/v2/users';
const API_TOKEN =
  '0b4c0fa225e4e432de7e51fe13691e86e27ac12a360ca251bf714eeb00942325';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

interface User {
  id: number;
  name: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
}

export interface CreateUserParams {
  name: string;
  email: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  gender?: 'male' | 'female';
  status?: 'active' | 'inactive';
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await axiosInstance.get('/');
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  },

  async createUser(params: CreateUserParams): Promise<User> {
    const response = await axiosInstance.post('/', params);
    return response.data;
  },

  async updateUser(id: number, params: UpdateUserParams): Promise<User> {
    const response = await axiosInstance.patch(`/${id}`, params);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await axiosInstance.delete(`/${id}`);
  },
};

import axios from 'axios';
import { Member, MemberCreate, MemberUpdate, Book, BookCreate, Borrowing, BorrowingWithDetails, BorrowingCreate, BorrowingReturn } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('library_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('library_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const membersAPI = {
  getAll: () => api.get<Member[]>('/members'),
  getById: (id: number) => api.get<Member>(`/members/${id}`),
  create: (data: MemberCreate) => api.post<Member>('/members', data),
  update: (id: number, data: MemberUpdate) => api.put<Member>(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
};

export const booksAPI = {
  getAll: () => api.get<Book[]>('/books'),
  getById: (id: number) => api.get<Book>(`/books/${id}`),
  create: (data: BookCreate) => api.post<Book>('/books', data),
  update: (id: number, data: Partial<BookCreate>) => api.put<Book>(`/books/${id}`, data),
  delete: (id: number) => api.delete(`/books/${id}`),
};

export const borrowingsAPI = {
  getAll: (status?: string) => api.get<BorrowingWithDetails[]>('/borrowings', { params: { status } }),
  getById: (id: number) => api.get<BorrowingWithDetails>(`/borrowings/${id}`),
  getByMember: (memberId: number) => api.get<BorrowingWithDetails[]>(`/borrowings/member/${memberId}`),
  getByBook: (bookId: number) => api.get<BorrowingWithDetails[]>(`/borrowings/book/${bookId}`),
  borrow: (data: BorrowingCreate) => api.post<Borrowing>('/borrowings', data),
  return: (id: number, data: BorrowingReturn) => api.post<Borrowing>(`/borrowings/${id}/return`, data),
};

export default api;

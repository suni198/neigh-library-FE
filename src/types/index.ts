export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name?: string;
  password: string;
}

export interface UserLogin {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  membership_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface MemberUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  genre?: string;
  total_copies: number;
  available_copies: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookCreate {
  isbn?: string;
  title: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  genre?: string;
  total_copies: number;
  description?: string;
}

export interface Borrowing {
  id: number;
  member_id: number;
  book_id: number;
  borrowed_date: string;
  due_date: string;
  return_date?: string;
  fine_amount: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BorrowingWithDetails extends Borrowing {
  member: Member;
  book: Book;
}

export interface BorrowingCreate {
  member_id: number;
  book_id: number;
  due_date: string;
  notes?: string;
}

export interface BorrowingReturn {
  fine_amount?: number;
  notes?: string;
}

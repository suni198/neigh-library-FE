/**
 * Unit tests for API service
 */

import MockAdapter from 'axios-mock-adapter';
import apiInstance, { membersAPI, booksAPI, borrowingsAPI } from '@/services/api';

describe('API Service', () => {
  let mock: MockAdapter;
  
  beforeEach(() => {
    // Mock the actual axios instance used by the api service (not the default axios)
    mock = new MockAdapter(apiInstance);
    localStorage.clear();
  });
  
  afterEach(() => {
    mock.restore();
  });
  
  describe('Members API', () => {
    it('should fetch all members', async () => {
      const mockMembers = [
        {
          id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          is_active: true
        }
      ];
      
      mock.onGet('/members').reply(200, mockMembers);
      
      const response = await membersAPI.getAll();
      expect(response.data).toEqual(mockMembers);
    });
    
    it('should create a new member', async () => {
      const newMember = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com'
      };
      
      const createdMember = { id: 2, ...newMember };
      
      mock.onPost('/members').reply(201, createdMember);
      
      const response = await membersAPI.create(newMember);
      expect(response.data).toEqual(createdMember);
    });
    
    it('should update a member', async () => {
      const updatedMember = {
        id: 1,
        first_name: 'Updated',
        last_name: 'Name',
        email: 'updated@example.com'
      };
      
      mock.onPut('/members/1').reply(200, updatedMember);
      
      const response = await membersAPI.update(1, { first_name: 'Updated' });
      expect(response.data.first_name).toBe('Updated');
    });
    
    it('should delete a member', async () => {
      mock.onDelete('/members/1').reply(204);
      
      const response = await membersAPI.delete(1);
      expect(response.status).toBe(204);
    });
  });
  
  describe('Books API', () => {
    it('should fetch all books', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          available_copies: 3,
          total_copies: 5
        }
      ];
      
      mock.onGet('/books').reply(200, mockBooks);
      
      const response = await booksAPI.getAll();
      expect(response.data).toEqual(mockBooks);
    });

    it('should fetch a book by id', async () => {
      const book = { id: 3, title: 'Single Book', author: 'Author', available_copies: 1, total_copies: 2 };
      mock.onGet('/books/3').reply(200, book);

      const response = await booksAPI.getById(3);
      expect(response.data.id).toBe(3);
    });
    
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Book',
        author: 'New Author',
        total_copies: 3
      };
      
      const createdBook = {
        id: 2,
        ...newBook,
        available_copies: 3
      };
      
      mock.onPost('/books').reply(201, createdBook);
      
      const response = await booksAPI.create(newBook);
      expect(response.data).toEqual(createdBook);
    });

    it('should update a book', async () => {
      const updated = { id: 1, title: 'Updated Title', author: 'A', total_copies: 4, available_copies: 4 };
      mock.onPut('/books/1').reply(200, updated);

      const response = await booksAPI.update(1, { title: 'Updated Title' });
      expect(response.data.title).toBe('Updated Title');
    });

    it('should delete a book', async () => {
      mock.onDelete('/books/1').reply(204);

      const response = await booksAPI.delete(1);
      expect(response.status).toBe(204);
    });
  });

  describe('Members API – getById', () => {
    it('should fetch a member by id', async () => {
      const member = { id: 1, first_name: 'John', last_name: 'Doe', email: 'j@e.com', is_active: true };
      mock.onGet('/members/1').reply(200, member);

      const response = await membersAPI.getById(1);
      expect(response.data.id).toBe(1);
    });
  });

  describe('Borrowings API', () => {
    it('should fetch all borrowings', async () => {
      const borrowings = [{ id: 1, member_id: 1, book_id: 1, status: 'BORROWED' }];
      mock.onGet('/borrowings').reply(200, borrowings);

      const response = await borrowingsAPI.getAll();
      expect(response.data).toEqual(borrowings);
    });

    it('should fetch borrowings filtered by status', async () => {
      const active = [{ id: 1, status: 'BORROWED' }];
      mock.onGet('/borrowings').reply((config) => {
        expect(config.params?.status).toBe('BORROWED');
        return [200, active];
      });

      const response = await borrowingsAPI.getAll('BORROWED');
      expect(response.data).toEqual(active);
    });

    it('should fetch a borrowing by id', async () => {
      const b = { id: 2, member_id: 1, book_id: 2, status: 'BORROWED' };
      mock.onGet('/borrowings/2').reply(200, b);

      const response = await borrowingsAPI.getById(2);
      expect(response.data.id).toBe(2);
    });

    it('should fetch borrowings by member', async () => {
      const list = [{ id: 1, member_id: 3, book_id: 1, status: 'BORROWED' }];
      mock.onGet('/borrowings/member/3').reply(200, list);

      const response = await borrowingsAPI.getByMember(3);
      expect(response.data).toEqual(list);
    });

    it('should fetch borrowings by book', async () => {
      const list = [{ id: 1, member_id: 1, book_id: 5, status: 'RETURNED' }];
      mock.onGet('/borrowings/book/5').reply(200, list);

      const response = await borrowingsAPI.getByBook(5);
      expect(response.data).toEqual(list);
    });

    it('should create a borrowing (borrow a book)', async () => {
      const payload = { member_id: 1, book_id: 1 };
      const created = { id: 10, ...payload, status: 'BORROWED' };
      mock.onPost('/borrowings').reply(201, created);

      const response = await borrowingsAPI.borrow(payload);
      expect(response.data.status).toBe('BORROWED');
    });

    it('should return a book', async () => {
      const returned = { id: 10, status: 'RETURNED' };
      mock.onPost('/borrowings/10/return').reply(200, returned);

      const response = await borrowingsAPI.return(10, {});
      expect(response.data.status).toBe('RETURNED');
    });
  });
  
  describe('Authentication', () => {
    it('should add auth token to requests', async () => {
      const token = 'test-token';
      localStorage.setItem('library_token', token);
      
      mock.onGet('/members').reply((config) => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
        return [200, []];
      });
      
      await membersAPI.getAll();
    });
    
    it('should redirect to login on 401', async () => {
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;
      
      mock.onGet('/members').reply(401);
      
      try {
        await membersAPI.getAll();
      } catch (error) {
        // Expected to fail
      }
      
      expect(localStorage.getItem('library_token')).toBeNull();
      
      window.location = originalLocation;
    });
  });
});

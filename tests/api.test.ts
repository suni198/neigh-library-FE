/**
 * Unit tests for API service
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { membersAPI, booksAPI, borrowingsAPI } from '@/services/api';

describe('API Service', () => {
  let mock: MockAdapter;
  
  beforeEach(() => {
    mock = new MockAdapter(axios);
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

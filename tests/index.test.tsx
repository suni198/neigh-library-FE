/**
 * Unit tests for Home page (main application)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import Home from '@/pages/index';
import { membersAPI, booksAPI, borrowingsAPI } from '@/services/api';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/api');

describe('Home Page', () => {
  const mockPush = jest.fn();
  const mockMembers = [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-0101',
      is_active: true,
      membership_date: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@example.com',
      phone: '555-0102',
      is_active: true,
      membership_date: '2024-01-02T00:00:00Z',
    },
  ];

  const mockBooks = [
    {
      id: 1,
      title: 'Test Book 1',
      author: 'Author 1',
      isbn: 'ISBN-001',
      genre: 'Fiction',
      publication_year: 2020,
      total_copies: 5,
      available_copies: 3,
      is_active: true,
    },
    {
      id: 2,
      title: 'Test Book 2',
      author: 'Author 2',
      isbn: 'ISBN-002',
      genre: 'Non-Fiction',
      publication_year: 2021,
      total_copies: 3,
      available_copies: 0,
      is_active: true,
    },
  ];

  const mockBorrowings = [
    {
      id: 1,
      member_id: 1,
      book_id: 1,
      borrowed_date: '2024-01-10T00:00:00Z',
      due_date: '2024-01-24T00:00:00Z',
      status: 'BORROWED',
      member: mockMembers[0],
      book: mockBooks[0],
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    localStorage.setItem('library_token', 'test-token');
    jest.clearAllMocks();

    // Default mock implementations
    (membersAPI.getAll as jest.Mock).mockResolvedValue({ data: mockMembers });
    (booksAPI.getAll as jest.Mock).mockResolvedValue({ data: mockBooks });
    (borrowingsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockBorrowings });
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should redirect to login if no token', () => {
      localStorage.clear();
      render(<Home />);
      
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should load data when authenticated', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(booksAPI.getAll).toHaveBeenCalled();
      });
    });
  });

  describe('Custom Confirmation Modal', () => {
    it('should show custom confirmation modal on delete member', async () => {
      render(<Home />);
      
      // Wait for data to load and switch to Members tab
      await waitFor(() => expect(membersAPI.getAll).toHaveBeenCalled());
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Find and click delete button
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      // Should show custom modal, not native confirm
      await waitFor(() => {
        expect(screen.getByText(/Delete Member/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should show member name in confirmation message', async () => {
      render(<Home />);
      
      await waitFor(() => expect(membersAPI.getAll).toHaveBeenCalled());
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      });
    });

    it('should close modal on cancel', async () => {
      render(<Home />);
      
      await waitFor(() => expect(membersAPI.getAll).toHaveBeenCalled());
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Delete Member/i)).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByText(/Delete Member/i)).not.toBeInTheDocument();
      });
    });

    it('should delete member on confirm', async () => {
      (membersAPI.delete as jest.Mock).mockResolvedValue({ status: 204 });
      
      render(<Home />);
      
      await waitFor(() => expect(membersAPI.getAll).toHaveBeenCalled());
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Delete Member/i)).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(membersAPI.delete).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Delete with Active Borrowings', () => {
    it('should show error when deleting member with active borrowings', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Cannot delete member. Member has 1 active borrowing(s). Please return all borrowed books first.',
          },
        },
      };
      (membersAPI.delete as jest.Mock).mockRejectedValue(mockError);
      
      // Mock window.alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<Home />);
      
      await waitFor(() => expect(membersAPI.getAll).toHaveBeenCalled());
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('active borrowing')
        );
      });
      
      alertMock.mockRestore();
    });

    it('should show error when deleting book with active borrowings', async () => {
      const mockError = {
        response: {
          data: {
            detail: 'Cannot delete book. This book has 1 active borrowing(s). Please wait for all copies to be returned first.',
          },
        },
      };
      (booksAPI.delete as jest.Mock).mockRejectedValue(mockError);
      
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      // Books tab is default
      await waitFor(() => {
        expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      });
      
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm')).toBeInTheDocument();
      });
      
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('active borrowing')
        );
      });
      
      alertMock.mockRestore();
    });
  });

  describe('Borrow Modal - Load All Data', () => {
    it('should load all data when opening borrow modal', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      // Click "Borrow Book" button
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      // Should call all APIs to load fresh data
      await waitFor(() => {
        expect(membersAPI.getAll).toHaveBeenCalled();
        expect(booksAPI.getAll).toHaveBeenCalled();
        expect(borrowingsAPI.getAll).toHaveBeenCalled();
      });
    });

    it('should show members list in borrow modal', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Select Member/i)).toBeInTheDocument();
        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      });
    });

    it('should show books list in borrow modal', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Select Book/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Book 1/i)).toBeInTheDocument();
      });
    });

    it('should filter out books with no available copies', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Test Book 1/i)).toBeInTheDocument();
        // Test Book 2 has 0 available, should not appear
        expect(screen.queryByText(/Test Book 2.*0 available/i)).not.toBeInTheDocument();
      });
    });

    it('should pre-select book when clicking Borrow on book card', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      });
      
      // Click the "Borrow" button on a book card
      const borrowButtons = screen.getAllByText('Borrow');
      fireEvent.click(borrowButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText(/Borrow Book/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Refresh After Operations', () => {
    it('should refresh all data after borrowing', async () => {
      (borrowingsAPI.borrow as jest.Mock).mockResolvedValue({
        data: { id: 2, member_id: 1, book_id: 1, status: 'BORROWED' },
      });
      
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Borrow Book/i)).toBeInTheDocument();
      });
      
      // Select member and book, then submit
      const submitButton = screen.getByRole('button', { name: /Borrow Book/i });
      
      // Clear previous calls
      jest.clearAllMocks();
      
      fireEvent.click(submitButton);
      
      // Should refresh all data after successful borrow
      await waitFor(() => {
        expect(membersAPI.getAll).toHaveBeenCalled();
        expect(booksAPI.getAll).toHaveBeenCalled();
        expect(borrowingsAPI.getAll).toHaveBeenCalled();
      });
    });

    it('should refresh all data after return', async () => {
      (borrowingsAPI.return as jest.Mock).mockResolvedValue({
        data: { id: 1, status: 'RETURNED' },
      });
      
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      // Switch to Borrowings tab
      const borrowingsTab = screen.getByText('Borrowings');
      fireEvent.click(borrowingsTab);
      
      await waitFor(() => {
        expect(screen.getByText('Test Book 1')).toBeInTheDocument();
      });
      
      // Click Return button
      const returnButton = screen.getByText('Return');
      fireEvent.click(returnButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Mark.*returned/i)).toBeInTheDocument();
      });
      
      // Confirm return
      const confirmButton = screen.getByText('Confirm');
      
      // Clear previous calls
      jest.clearAllMocks();
      
      fireEvent.click(confirmButton);
      
      // Should refresh all data after successful return
      await waitFor(() => {
        expect(membersAPI.getAll).toHaveBeenCalled();
        expect(booksAPI.getAll).toHaveBeenCalled();
        expect(borrowingsAPI.getAll).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when borrowing without selecting member', async () => {
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      const borrowButton = screen.getByText(/Borrow Book/i);
      fireEvent.click(borrowButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Borrow Book/i)).toBeInTheDocument();
      });
      
      // Try to submit without selecting
      const submitButton = screen.getByRole('button', { name: /Borrow Book/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('select both')
        );
      });
      
      alertMock.mockRestore();
    });
  });

  describe('Tab Navigation', () => {
    it('should load members when switching to Members tab', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      jest.clearAllMocks();
      
      const membersTab = screen.getByText('Members');
      fireEvent.click(membersTab);
      
      await waitFor(() => {
        expect(membersAPI.getAll).toHaveBeenCalled();
      });
    });

    it('should load borrowings when switching to Borrowings tab', async () => {
      render(<Home />);
      
      await waitFor(() => expect(booksAPI.getAll).toHaveBeenCalled());
      
      jest.clearAllMocks();
      
      const borrowingsTab = screen.getByText('Borrowings');
      fireEvent.click(borrowingsTab);
      
      await waitFor(() => {
        expect(borrowingsAPI.getAll).toHaveBeenCalled();
      });
    });
  });
});

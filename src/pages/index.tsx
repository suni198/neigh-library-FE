import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { membersAPI, booksAPI, borrowingsAPI } from '@/services/api';
import { Member, Book, BorrowingWithDetails, MemberCreate, MemberUpdate, BookCreate } from '@/types';

type ModalType = 'member' | 'book' | 'borrow' | null;

interface ConfirmationDialog {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'books' | 'members' | 'borrowings'>('books');
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {},
  });
  
  // Form state for Member
  const [memberForm, setMemberForm] = useState<MemberCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [memberIsActive, setMemberIsActive] = useState<boolean>(true);
  
  // Form state for Book
  const [bookForm, setBookForm] = useState<BookCreate>({
    title: '',
    author: '',
    isbn: '',
    publication_year: undefined,
    genre: '',
    total_copies: 1,
  });
  
  // Borrow form state
  const [borrowForm, setBorrowForm] = useState({
    member_id: 0,
    book_id: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('library_token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'books') {
        const response = await booksAPI.getAll();
        setBooks(response.data);
      } else if (activeTab === 'members') {
        const response = await membersAPI.getAll();
        setMembers(response.data);
      } else if (activeTab === 'borrowings') {
        const response = await borrowingsAPI.getAll();
        setBorrowings(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    try {
      const [membersRes, booksRes, borrowingsRes] = await Promise.all([
        membersAPI.getAll(),
        booksAPI.getAll(),
        borrowingsAPI.getAll(),
      ]);
      setMembers(membersRes.data);
      setBooks(booksRes.data);
      setBorrowings(borrowingsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load data');
    }
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        onConfirm();
      },
      onCancel: () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // Member CRUD
  const openMemberModal = (member?: Member) => {
    if (member) {
      setEditingId(member.id);
      setMemberForm({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone || '',
        address: member.address || '',
      });
      setMemberIsActive(member.is_active);
    } else {
      setEditingId(null);
      setMemberForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
      });
      setMemberIsActive(true);
    }
    setModalType('member');
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updateData: MemberUpdate = { ...memberForm, is_active: memberIsActive };
        await membersAPI.update(editingId, updateData);
      } else {
        await membersAPI.create(memberForm);
      }
      setModalType(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save member');
    }
  };

  const handleDeleteMember = async (id: number) => {
    const member = members.find(m => m.id === id);
    const memberName = member ? `${member.first_name} ${member.last_name}` : 'this member';
    
    showConfirmDialog(
      'Delete Member',
      `Are you sure you want to delete ${memberName}? This action cannot be undone.`,
      async () => {
        try {
          await membersAPI.delete(id);
          loadData();
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to delete member');
        }
      }
    );
  };

  // Book CRUD
  const openBookModal = (book?: Book) => {
    if (book) {
      setEditingId(book.id);
      setBookForm({
        title: book.title,
        author: book.author,
        isbn: book.isbn || '',
        publication_year: book.publication_year,
        genre: book.genre || '',
        total_copies: book.total_copies,
      });
    } else {
      setEditingId(null);
      setBookForm({
        title: '',
        author: '',
        isbn: '',
        publication_year: undefined,
        genre: '',
        total_copies: 1,
      });
    }
    setModalType('book');
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await booksAPI.update(editingId, bookForm);
      } else {
        await booksAPI.create(bookForm);
      }
      setModalType(null);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save book');
    }
  };

  const handleDeleteBook = async (id: number) => {
    const book = books.find(b => b.id === id);
    const bookTitle = book ? book.title : 'this book';
    
    showConfirmDialog(
      'Delete Book',
      `Are you sure you want to delete "${bookTitle}"? This action cannot be undone.`,
      async () => {
        try {
          await booksAPI.delete(id);
          loadData();
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to delete book');
        }
      }
    );
  };

  // Borrowing operations
  const openBorrowModal = async (bookId?: number) => {
    await loadAllData();
    setBorrowForm({
      member_id: 0,
      book_id: bookId || 0,
    });
    setModalType('borrow');
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowForm.member_id || !borrowForm.book_id) {
      alert('Please select both a member and a book');
      return;
    }
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      await borrowingsAPI.borrow({
        member_id: borrowForm.member_id,
        book_id: borrowForm.book_id,
        due_date: dueDate.toISOString(),
      });
      setModalType(null);
      await loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to borrow book');
    }
  };

  const handleReturn = async (borrowingId: number) => {
    const borrowing = borrowings.find(b => b.id === borrowingId);
    const bookTitle = borrowing ? borrowing.book.title : 'this book';
    
    showConfirmDialog(
      'Return Book',
      `Mark "${bookTitle}" as returned?`,
      async () => {
        try {
          await borrowingsAPI.return(borrowingId, {});
          await loadAllData();
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to return book');
        }
      }
    );
  };

  return (
    <>
      <Head>
        <title>Neighborhood Library</title>
        <meta name="description" content="Library Management System" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container">
        <header className="header">
          <h1>📚 Neighborhood Library</h1>
          <p>Library Management System</p>
          <button 
            className="btn-logout"
            onClick={() => {
              localStorage.removeItem('library_token');
              router.push('/login');
            }}
          >
            Logout
          </button>
        </header>

        <nav className="tabs">
          <button
            className={activeTab === 'books' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('books')}
          >
            Books
          </button>
          <button
            className={activeTab === 'members' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button
            className={activeTab === 'borrowings' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('borrowings')}
          >
            Borrowings
          </button>
        </nav>

        <div className="action-bar">
          {activeTab === 'books' && (
            <>
              <button className="btn-primary" onClick={() => openBookModal()}>
                + Add Book
              </button>
              <button className="btn-secondary" onClick={() => openBorrowModal()}>
                📖 Borrow Book
              </button>
            </>
          )}
          {activeTab === 'members' && (
            <button className="btn-primary" onClick={() => openMemberModal()}>
              + Add Member
            </button>
          )}
        </div>

        <div className="content">
          {!isAuthenticated && <div className="loading">Checking authentication...</div>}
          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error">{error}</div>}

          {!loading && !error && activeTab === 'books' && (
            <div className="grid">
              {books.map((book) => (
                <div key={book.id} className="card">
                  <div className="card-actions">
                    <button className="btn-icon" onClick={() => openBookModal(book)} title="Edit">
                      ✏️
                    </button>
                    <button className="btn-icon" onClick={() => handleDeleteBook(book.id)} title="Delete">
                      🗑️
                    </button>
                  </div>
                  <h3>{book.title}</h3>
                  <p className="author">by {book.author}</p>
                  {book.isbn && <p className="meta">ISBN: {book.isbn}</p>}
                  {book.genre && <p className="meta">Genre: {book.genre}</p>}
                  {book.publication_year && (
                    <p className="meta">Published: {book.publication_year}</p>
                  )}
                  <div className="availability">
                    <span className={book.available_copies > 0 ? 'badge available' : 'badge unavailable'}>
                      {book.available_copies} / {book.total_copies} available
                    </span>
                  </div>
                  {book.available_copies > 0 && (
                    <button 
                      className="btn-small btn-borrow" 
                      onClick={() => openBorrowModal(book.id)}
                    >
                      Borrow
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === 'members' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Member Since</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.filter(m => m.is_active).map((member) => (
                    <tr key={member.id}>
                      <td>{member.first_name} {member.last_name}</td>
                      <td>{member.email}</td>
                      <td>{member.phone || '-'}</td>
                      <td>{new Date(member.membership_date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge active">Active</span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button className="btn-icon" onClick={() => openMemberModal(member)} title="Edit">
                            ✏️
                          </button>
                          <button className="btn-icon" onClick={() => handleDeleteMember(member.id)} title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && activeTab === 'borrowings' && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Member</th>
                    <th>Borrowed</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowings.map((borrowing) => (
                    <tr key={borrowing.id}>
                      <td>{borrowing.book.title}</td>
                      <td>{borrowing.member.first_name} {borrowing.member.last_name}</td>
                      <td>{new Date(borrowing.borrowed_date).toLocaleDateString()}</td>
                      <td>{new Date(borrowing.due_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${borrowing.status.toLowerCase()}`}>
                          {borrowing.status}
                        </span>
                      </td>
                      <td>
                        {borrowing.status === 'BORROWED' && (
                          <button
                            className="btn-small"
                            onClick={() => handleReturn(borrowing.id)}
                          >
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Member Modal */}
        {modalType === 'member' && (
          <div className="modal-overlay" onClick={() => setModalType(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Member' : 'Add New Member'}</h2>
                <button className="btn-close" onClick={() => setModalType(null)}>×</button>
              </div>
              <form onSubmit={handleSaveMember} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.first_name}
                      onChange={(e) => setMemberForm({...memberForm, first_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.last_name}
                      onChange={(e) => setMemberForm({...memberForm, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={memberForm.phone}
                    onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows={3}
                    value={memberForm.address}
                    onChange={(e) => setMemberForm({...memberForm, address: e.target.value})}
                  />
                </div>
                {editingId && (
                  <div className="form-group form-group-inline">
                    <label htmlFor="member-is-active">Active Member</label>
                    <input
                      id="member-is-active"
                      type="checkbox"
                      checked={memberIsActive}
                      onChange={(e) => setMemberIsActive(e.target.checked)}
                    />
                  </div>
                )}
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Book Modal */}
        {modalType === 'book' && (
          <div className="modal-overlay" onClick={() => setModalType(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Edit Book' : 'Add New Book'}</h2>
                <button className="btn-close" onClick={() => setModalType(null)}>×</button>
              </div>
              <form onSubmit={handleSaveBook} className="modal-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Genre</label>
                    <input
                      type="text"
                      value={bookForm.genre}
                      onChange={(e) => setBookForm({...bookForm, genre: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Publication Year</label>
                    <input
                      type="number"
                      min="1000"
                      max="9999"
                      value={bookForm.publication_year || ''}
                      onChange={(e) => setBookForm({...bookForm, publication_year: e.target.value ? parseInt(e.target.value) : undefined})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Copies *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={bookForm.total_copies}
                      onChange={(e) => setBookForm({...bookForm, total_copies: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Borrow Modal */}
        {modalType === 'borrow' && (
          <div className="modal-overlay" onClick={() => setModalType(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Borrow Book</h2>
                <button className="btn-close" onClick={() => setModalType(null)}>×</button>
              </div>
              <form onSubmit={handleBorrow} className="modal-form">
                <div className="form-group">
                  <label>Select Member *</label>
                  <select
                    required
                    value={borrowForm.member_id}
                    onChange={(e) => setBorrowForm({...borrowForm, member_id: parseInt(e.target.value)})}
                  >
                    <option value="0">Choose a member...</option>
                    {members.filter(m => m.is_active).map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.first_name} {member.last_name} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Book *</label>
                  <select
                    required
                    value={borrowForm.book_id}
                    onChange={(e) => setBorrowForm({...borrowForm, book_id: parseInt(e.target.value)})}
                  >
                    <option value="0">Choose a book...</option>
                    {books.filter(b => b.available_copies > 0).map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title} by {book.author} ({book.available_copies} available)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="form-hint">Due date will be set to 14 days from today.</p>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Borrow Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="modal-overlay" onClick={confirmDialog.onCancel}>
            <div className="modal confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{confirmDialog.title}</h2>
              </div>
              <div className="confirm-message">
                <p>{confirmDialog.message}</p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={confirmDialog.onCancel}>
                  Cancel
                </button>
                <button type="button" className="btn-danger" onClick={confirmDialog.onConfirm}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

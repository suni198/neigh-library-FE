# Neighborhood Library App - Frontend

This is the frontend application for the Neighborhood Library Management System, built with Next.js and React.

## Location

This frontend code is located at:
```
/Users/sunitasahu/Documents/interview assignment/neigh-library-FE/frontend
```

The backend and docker-compose files are located at:
```
/Users/sunitasahu/Documents/interview assignment/senior arcitect role/
```

## Quick Start

### Run with Docker Compose (Recommended)

From the backend directory:
```bash
cd "/Users/sunitasahu/Documents/interview assignment/senior arcitect role"
docker-compose up -d
```

The frontend will be available at: http://localhost:3001

### Run Standalone (Development)

```bash
cd "/Users/sunitasahu/Documents/interview assignment/neigh-library-FE/frontend"

# Install dependencies
npm install

# Set environment variable
export NEXT_PUBLIC_API_URL=http://localhost:8001

# Run development server
npm run dev
```

## Features

### Authentication
- Login page with JWT token authentication
- Automatic redirect to login if not authenticated
- Token stored in localStorage
- Auto-logout on token expiration

### Full CRUD Operations

#### Members
- ✅ Create new members (modal form)
- ✅ View all members (table view)
- ✅ Edit members (✏️ icon)
- ✅ Delete members (🗑️ icon)

#### Books
- ✅ Create new books (modal form)
- ✅ View all books (card view)
- ✅ Edit books (✏️ icon)
- ✅ Delete books (🗑️ icon)
- ✅ Borrow books (button on each card)

#### Borrowings
- ✅ Borrow books (with member and book selection)
- ✅ View all borrowings
- ✅ Return books
- ✅ View borrowing history

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: CSS Modules
- **Testing**: Jest + React Testing Library

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Next.js pages (routes)
│   │   ├── index.tsx    # Main app with tabs
│   │   ├── login.tsx    # Login page
│   │   ├── _app.tsx     # App wrapper
│   │   └── _document.tsx
│   ├── services/        # API client
│   │   └── api.ts       # Axios configuration
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   └── styles/          # CSS styles
│       └── globals.css
├── tests/               # Unit tests
│   ├── api.test.ts
│   └── login.test.tsx
├── jest.config.js       # Jest configuration
├── jest.setup.js        # Test setup
├── package.json
├── tsconfig.json
└── Dockerfile
```

## API Integration

The frontend connects to the backend API at `http://localhost:8001` (configurable via `NEXT_PUBLIC_API_URL`).

### API Endpoints Used

| Resource | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| Auth | POST | `/auth/login` | Login |
| Auth | POST | `/auth/register` | Register |
| Auth | GET | `/auth/me` | Get current user |
| Members | GET | `/members/` | List members |
| Members | POST | `/members/` | Create member |
| Members | PUT | `/members/{id}/` | Update member |
| Members | DELETE | `/members/{id}/` | Delete member |
| Books | GET | `/books/` | List books |
| Books | POST | `/books/` | Create book |
| Books | PUT | `/books/{id}/` | Update book |
| Books | DELETE | `/books/{id}/` | Delete book |
| Borrowings | GET | `/borrowings/` | List borrowings |
| Borrowings | POST | `/borrowings/` | Borrow book |
| Borrowings | POST | `/borrowings/{id}/return/` | Return book |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

## Testing

### Run Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:ci

# Run with coverage
npm run test:ci -- --coverage
```

### Test Coverage

- API service methods
- Authentication flow
- Login component
- Form validation
- Error handling

## Building for Production

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Features Demonstrated

1. **Authentication**: JWT token-based auth with login/logout
2. **CRUD Operations**: Complete create, read, update, delete for all resources
3. **Modal Forms**: User-friendly data entry
4. **Error Handling**: Display API errors to users
5. **Loading States**: Show loading indicators
6. **Responsive Design**: Works on mobile and desktop
7. **TypeScript**: Full type safety
8. **Modern UI**: Clean, professional interface

## Troubleshooting

### Port Already in Use
If port 3001 is already in use, modify `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3002:3000"  # Change host port
```

### API Connection Issues
1. Verify backend is running: `curl http://localhost:8001/health`
2. Check CORS settings in backend
3. Verify `NEXT_PUBLIC_API_URL` environment variable

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

## Documentation

Full documentation available in the main project directory:
- `README.md` - Main project overview
- `CRUD_IMPLEMENTATION.md` - CRUD features guide
- `TESTING_GUIDE.md` - Testing documentation
- `COMPLETE_IMPLEMENTATION.md` - Full implementation summary

## Support

For issues or questions about the frontend implementation, refer to the main project documentation at:
```
/Users/sunitasahu/Documents/interview assignment/senior arcitect role/
```

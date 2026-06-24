# Neighborhood Library App — Frontend

React/Next.js frontend for the Neighborhood Library Management System.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 |
| Language | TypeScript |
| HTTP Client | Axios |
| Styling | CSS Modules |
| Testing | Jest + React Testing Library |
| Container | Docker |

---

## Bug Fixes Implemented

This assignment required identifying and fixing **4 bugs**. The frontend was responsible for Bugs 1, 3, and 4:

### Bug 1 — No Confirmation Before Delete
**Problem:** Clicking the delete icon instantly deleted a member or book with no confirmation.  
**Fix:** Added a reusable `ConfirmationModal` component rendered before any delete API call. Shows the item name and action, requires explicit confirmation, and handles cancellation cleanly.

```tsx
// Before (no guard)
await api.delete(`/members/${id}/`);

// After (custom modal)
setDeleteTarget({ id, name });
setShowConfirmModal(true);
// Modal calls handleConfirmDelete() on confirm
```

### Bug 3 — Borrow Modal Member List Was Empty
**Problem:** The borrow modal showed an empty members dropdown because the API call used `.then()` but the result wasn't properly awaited before state was set.  
**Fix:** Corrected the async/await pattern in the data-fetching function so the members list populates correctly when the modal opens.

### Bug 4 — Data Not Refreshed After Operations
**Problem:** After create / update / delete operations the table or card grid showed stale data — the user had to manually refresh the page.  
**Fix:** Added an explicit `fetchData()` call inside every mutation handler's success path so the UI re-renders with fresh server data automatically.

---

## Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
# Clone all three repos into one directory
git clone https://github.com/suni198/neigh-library-BE.git
git clone https://github.com/suni198/neigh-library-FE.git
git clone https://github.com/suni198/neigh-library-deployment.git

cp neigh-library-deployment/docker-compose.yml .
docker-compose up -d
```

Frontend: http://localhost:3001  
Login: `admin` / `admin123`

### Option 2 — Standalone Development

```bash
cd neigh-library-FE

npm install

export NEXT_PUBLIC_API_URL=http://localhost:8001

npm run dev
```

---

## Project Structure

```
neigh-library-FE/
├── src/
│   ├── pages/
│   │   ├── index.tsx        # Main app: Books, Members, Borrowings tabs
│   │   ├── login.tsx        # JWT login page
│   │   ├── _app.tsx         # App wrapper + global auth check
│   │   └── _document.tsx
│   ├── services/
│   │   └── api.ts           # Axios instance + typed API methods
│   ├── types/
│   │   └── index.ts         # TypeScript interfaces (Book, Member, Borrowing)
│   └── styles/
│       └── globals.css
├── tests/
│   ├── api.test.ts          # API service unit tests
│   └── login.test.tsx       # Login component tests
├── jest.config.js
├── jest.setup.js
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## Features

### Authentication
- JWT token login/logout
- Token stored in `localStorage`
- Auto-redirect to `/login` if unauthenticated
- Axios interceptor attaches `Authorization: Bearer <token>` to every request

### Members
- List all members (table view)
- Create / edit via modal form
- Delete with confirmation modal (Bug 1 fix)
- Blocked by API if member has active borrowings (Bug 2 — backend fix)

### Books
- List all books (card view)
- Create / edit via modal form
- Delete with confirmation modal (Bug 1 fix)
- Borrow button opens borrow modal with correct member list (Bug 3 fix)
- Available copies tracked and displayed

### Borrowings
- List all borrowings with status badges
- Return a book (one-click with confirmation)
- Filters by status (BORROWED / RETURNED)

### Data Freshness
All mutation operations (create, update, delete, borrow, return) trigger an automatic data refresh so the UI is always in sync (Bug 4 fix).

---

## API Integration

The frontend calls the backend at `NEXT_PUBLIC_API_URL` (default `http://localhost:8001`).

| Resource | Endpoints used |
|---|---|
| Auth | `POST /auth/login`, `GET /auth/me` |
| Members | `GET/POST/PUT/DELETE /members/` |
| Books | `GET/POST/PUT/DELETE /books/` |
| Borrowings | `GET /borrowings/`, `POST /borrowings/`, `POST /borrowings/{id}/return/` |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Testing

```bash
# Run all tests
npm test

# CI mode (no watch)
npm run test:ci

# With coverage
npm run test:ci -- --coverage
```

Test files cover API service methods, authentication flow, login form validation, and error handling.

---

## Repository

https://github.com/suni198/neigh-library-FE

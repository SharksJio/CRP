# Kitties powered by Droidminnds Management - Web Admin

Web-based administration panel for the Kitties powered by Droidminnds Management System.

## Features

- **Authentication**: Login with JWT tokens
- **Dashboard**: Overview of key metrics
- **Communication Module**: Manage notifications and announcements
- **Expense Management**: Track expenses, categories, and remittances
- **Fee Management**: Create invoices, record payments, and generate receipts

## Tech Stack

- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Inline styles (can be upgraded to Tailwind/CSS modules)
- **HTTP Client**: Axios
- **State Management**: React hooks (useState, useEffect)

## Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
npm start
```

## Docker

### Build Image

```bash
docker build -t crp-web-admin .
```

### Run Container

```bash
docker run -p 8080:8080 -e NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3004/api/v1 crp-web-admin
```

## Environment Variables

The following environment variables can be configured:

- `NEXT_PUBLIC_API_URL`: Base URL for API gateway (default: http://localhost:3000/api/v1)
- `NEXT_PUBLIC_AUTH_SERVICE_URL`: Auth service URL (default: http://localhost:3004/api/v1)
- `NEXT_PUBLIC_COMMUNICATION_SERVICE_URL`: Communication service URL (default: http://localhost:3001/api/v1)
- `NEXT_PUBLIC_EXPENSE_SERVICE_URL`: Expense service URL (default: http://localhost:3002/api/v1)
- `NEXT_PUBLIC_FEE_SERVICE_URL`: Fee service URL (default: http://localhost:3003/api/v1)

## Default Credentials

For demo purposes:

- **Email**: admin@demopreschool.com
- **Password**: Admin@123

⚠️ **Important**: Change these credentials in production!

## Pages

- `/` - Home (redirects to dashboard or login)
- `/login` - Login page
- `/dashboard` - Main dashboard
- `/dashboard/communication` - Communication module
- `/dashboard/expenses` - Expense management
- `/dashboard/fees` - Fee management

## API Integration

The application uses a centralized API client (`src/lib/api.ts`) that handles:

- JWT token management
- Request/response interceptors
- Automatic token refresh
- Error handling
- Local storage for user session

## Future Enhancements

- Add form validation library (e.g., React Hook Form + Zod)
- Implement proper UI component library (e.g., Material-UI, Ant Design, or shadcn/ui)
- Add charts and analytics (e.g., Chart.js, Recharts)
- Implement file upload for receipts and documents
- Add real-time notifications using WebSockets
- Implement pagination for large datasets
- Add search and filter functionality
- Implement role-based access control (RBAC) UI

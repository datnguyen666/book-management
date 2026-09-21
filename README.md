# Book Management System

A full-stack library management system for managing books, categories, staff accounts, borrowing records, and library asset values.

## Features

- Authentication with JWT
- Role-based access control with `ADMIN` and `STAFF`
- Forgot Password / Reset Password via email
- Staff account management
- Activate / Deactivate staff accounts
- Book management
- Book cover image upload
- Category management
- Borrow and return book management
- Overdue tracking
- Search and pagination
- Dashboard with library statistics
- Library asset management
- Collection value, borrowed value, and available value tracking
- Dockerized PostgreSQL database

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Zustand
- Axios
- React Hook Form
- Zod
- Lucide React

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Passport
- Nodemailer
- Swagger
- bcrypt

### Infrastructure

- Docker
- Docker Compose

## Architecture

```text
                    ┌────────────────────┐
                    │      Frontend      │
                    │ React + TypeScript │
                    │       + Vite       │
                    └─────────┬──────────┘
                              │
                              │ REST API
                              ▼
                    ┌────────────────────┐
                    │      Backend       │
                    │      NestJS        │
                    │ JWT + Prisma ORM   │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │     PostgreSQL     │
                    │      Database      │
                    └────────────────────┘

                         SMTP / Email
                              │
                              ▼
                         Nodemailer
```

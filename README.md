# Hospital Management System

A comprehensive full-stack application for managing hospital operations, including patient records, doctor appointments, billing, and real-time analytics.

## Features
- **Dashboard**: Overview of hospital operations.
- **Patient Management**: Manage patient profiles and medical records.
- **Doctor Management**: Track doctor schedules and specialties.
- **Appointments**: Schedule and manage patient appointments.
- **Billing**: Handle invoicing and payments.
- **Analytics**: Visualize hospital data and trends.

## Tech Stack
- **Frontend**: React, Vite, TypeScript
- **Backend**: Node.js, Express, TypeScript, Prisma

## Getting Started

### Prerequisites
- Node.js installed

### Installation
1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```bash
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Set up the database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

### Running the App
Use the provided `run.sh` script or start both servers manually:
```bash
./run.sh
```

# Circuit Jam Lite

## Overview

Circuit Jam Lite is an educational web application for learning electronics through interactive circuit simulation. Built as a React + TypeScript application with a custom Modified Nodal Analysis (MNA) solver, it provides a gamified approach to understanding electrical engineering concepts including Ohm's Law, Kirchhoff's Laws, and basic circuit analysis.

The application features a sandbox environment where users can drag and drop components (resistors, capacitors, voltage sources, etc.), connect them with wires, and simulate circuit behavior in real-time. Users progress through structured levels with specific goals, making complex electrical concepts accessible through hands-on experimentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React architecture with TypeScript, leveraging several key design patterns:

- **Component-based UI**: Built with shadcn/ui components providing a consistent design system
- **State Management**: Zustand store for circuit state management, providing a lightweight alternative to Redux
- **Routing**: Wouter for client-side routing between level selection and simulator views
- **Styling**: Tailwind CSS with custom CSS variables for theming, including circuit-specific color schemes

### Backend Architecture
The backend follows a simple Express.js pattern:

- **Minimal API**: Currently uses placeholder routes with in-memory storage
- **Database Layer**: Configured for PostgreSQL with Drizzle ORM, supporting users, circuits, and progress tracking
- **Development Setup**: Vite integration for hot module replacement and development tooling

### Core Simulation Engine
The heart of the application is a custom-built circuit simulation system:

- **MNA Solver**: Dense matrix solver using Gaussian elimination for small circuit systems (≤100 unknowns)
- **Component Factory**: Modular component creation system supporting resistors, capacitors, voltage/current sources, and measurement probes
- **Real-time Simulation**: 50ms update loop for continuous circuit analysis
- **Manhattan Routing**: Automatic wire routing with orthogonal connections and hub-based net topology

### Data Storage Solutions
The application uses a hybrid storage approach:

- **In-memory Storage**: Current implementation uses Map-based storage for development
- **PostgreSQL Schema**: Designed schema supports user accounts, saved circuits, and learning progress
- **Drizzle ORM**: Type-safe database operations with automatic schema generation

### Authentication and Authorization
Basic user management infrastructure is in place:

- **User Schema**: Username/password authentication system
- **Session Management**: Uses connect-pg-simple for PostgreSQL session storage
- **Circuit Ownership**: Database schema supports user-owned circuits with public/private visibility

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web framework for API routes and static serving
- **TypeScript**: Type safety across frontend and backend code

### Database and ORM
- **PostgreSQL**: Primary database (configured via DATABASE_URL)
- **Drizzle ORM**: Type-safe database toolkit with schema-first approach
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon database

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI components via shadcn/ui
- **Lucide React**: Icon library for consistent iconography

### Development and Build Tools
- **Vite**: Build tool and development server with HMR
- **ESBuild**: Fast TypeScript/JavaScript bundler for production
- **Replit Integration**: Special development environment plugins for Replit platform

### State Management and Utilities
- **Zustand**: Lightweight state management for circuit state
- **TanStack Query**: Server state management and caching
- **Wouter**: Minimal client-side routing
- **Class Variance Authority**: Utility for component variant management

### Session and Authentication
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Crypto**: Node.js built-in for UUID generation and security

The application is designed to run as a Progressive Web App (PWA) with plans for offline capability and local storage of circuit designs and user progress.
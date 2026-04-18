# TenderScope

A comprehensive tender management system that automates the discovery, analysis, and tracking of tender opportunities. Built with modern web technologies and AI-powered analysis to help businesses stay competitive in the procurement landscape.

## Overview

TenderScope is a full-stack application that scrapes tender opportunities from various sources, analyzes them using AI, and provides a user-friendly dashboard for managing applications and tracking deadlines. The system features automated web scraping, intelligent classification, and real-time notifications.

## Table of Contents

- [Key Features](#key-features)
  - [Core Functionality](#core-functionality)
  - [Technical Features](#technical-features)
- [Technology Stack](#technology-stack)
  - [Frontend Technologies](#frontend-technologies)
  - [Backend Technologies](#backend-technologies)
  - [Web Scraping Tools](#web-scraping-tools)
  - [Development Tools](#development-tools)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Start the Development Servers](#start-the-development-servers)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
  - [Dashboard](#dashboard)
  - [Tender Management](#tender-management)
  - [Scraping System](#scraping-system)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-apiauth)
  - [Tender Management](#tender-management-apitenders)
  - [Scraping System](#scraping-system-apiscrape-tenders)
  - [AI Processing](#ai-processing-apiai)
  - [Applications](#applications-apiapplications)
  - [Email Notifications](#email-notifications-apiemail)
  - [System Health](#system-health)
- [Architecture](#architecture)
  - [System Components](#system-components)
  - [Data Flow](#data-flow)
  - [Queue System](#queue-system)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Roadmap](#roadmap)

## Key Features

### Core Functionality
- **Automated Tender Scraping**: Multi-layer scraping system using Axios, Puppeteer, and Playwright
- **AI-Powered Analysis**: OpenAI integration for tender classification, scoring, and data cleaning
- **Smart Dashboard**: Real-time KPIs, metrics, and tender overview
- **Application Management**: Track application status and deadlines
- **Company Intelligence**: Extract and analyze company information from tender sources
- **Email Notifications**: Automated deadline reminders and new tender alerts

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live data synchronization
- **Queue Management**: Background job processing with BullMQ and Redis
- **Anti-blocking System**: Advanced techniques to avoid detection during scraping
- **Error Handling**: Robust fallback mechanisms and retry logic
- **Secure Authentication**: Supabase-based user management

## Technology Stack

### Frontend Technologies
- **Next.js 16.2.0**: React framework with App Router and Server Components
- **TypeScript 5.7.3**: Type-safe development with strict mode
- **React 19.2.4**: Modern React with concurrent features
- **Tailwind CSS 4.2.0**: Utility-first CSS framework with custom components
- **shadcn/ui**: Comprehensive component library built on Radix UI
- **Lucide React**: Modern icon library with consistent design

### Backend Technologies
- **Node.js**: JavaScript runtime with ES modules
- **Express 4.19.2**: Web framework with middleware support
- **Supabase**: PostgreSQL database with real-time features and authentication
- **OpenAI GPT-3.5-turbo**: AI-powered text analysis and classification
- **BullMQ 5.74.1**: Advanced job queue system with Redis backend
- **IoRedis 5.10.1**: Redis client for queue management

### Web Scraping Tools
- **Cheerio 1.2.0**: Server-side HTML parsing and manipulation
- **Puppeteer 24.41.0**: Headless Chrome automation
- **Playwright 1.59.1**: Cross-browser automation and scraping
- **Axios**: HTTP client with retry capabilities

### Development Tools
- **pnpm**: Fast, disk space efficient package manager
- **ESLint**: Code quality and style enforcement
- **PostCSS**: CSS processing and optimization
- **Node-cron**: Scheduled task management
- **Nodemailer**: Email sending capabilities

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, or pnpm
- OpenAI API key
- Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tender-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your actual values:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   NODE_ENV=development
   PORT=3001
   ```

4. **Database Setup**
   - Run the SQL scripts in the `scripts/` directory in order:
     - `001_create_tables.sql`
     - `002_seed_data.sql`
     - `003_user_profiles.sql`

5. **Start the development servers**
   
   **Frontend** (port 3000):
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   
   **Backend** (port 3001):
   ```bash
   cd backend
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
tender-system/
|-- app/                    # Next.js app router pages
|   |-- (dashboard)/       # Dashboard layout and pages
|   |-- auth/              # Authentication pages
|   |-- api/               # API routes
|   `-- globals.css        # Global styles
|-- backend/               # Node.js backend
|   |-- routes/           # API endpoints
|   |-- services/         # Business logic
|   |-- jobs/             # Background jobs
|   `-- queue/            # Job queue management
|-- components/            # React components
|   |-- auth/             # Authentication components
|   |-- ui/               # UI components
|   `-- *.tsx             # Custom components
|-- lib/                  # Utility libraries
|-- hooks/                # Custom React hooks
|-- scripts/              # Database scripts
|-- styles/               # Additional styles
`-- public/               # Static assets
```

## Key Components

### Dashboard
- **KPI Cards**: Display key metrics and statistics
- **Recent Tenders**: Latest tender opportunities
- **Quick Actions**: Fast access to common tasks

### Tender Management
- **Tender List**: Browse and filter tenders
- **Tender Details**: View comprehensive tender information
- **AI Analysis**: Automated scoring and classification

### Scraping System
- **Multi-layer Scraping**: Axios, Puppeteer, and Playwright strategies
- **Anti-blocking**: Random delays and user agents
- **Error Handling**: Robust fallback mechanisms

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Tender Management (`/api/tenders`)
- `GET /api/tenders` - List all tenders with pagination
- `GET /api/tenders/[id]` - Get detailed tender information
- `POST /api/tenders` - Create new tender entry
- `PUT /api/tenders/[id]` - Update tender details
- `DELETE /api/tenders/[id]` - Remove tender

### Scraping System (`/api/scrape-tenders`)
- `POST /api/scrape-tenders` - Scrape single tender source
- `POST /api/scrape-tenders/batch` - Batch scrape multiple sources
- `GET /api/scrape-tenders/status/:jobId` - Get scraping job status
- `GET /api/scrape-tenders/queue-stats` - Get queue statistics
- `GET /api/scrape-tenders/history` - Get job history
- `POST /api/scrape-tenders/emergency` - Emergency high-priority scraping
- `POST /api/scrape-tenders/company` - Scrape company information
- `GET /api/scrape-tenders/stats` - Get scraping statistics
- `POST /api/scrape-tenders/cleanup` - Clean up old logs

### AI Processing (`/api/ai`)
- `POST /api/ai/analyze` - Analyze tender content with AI
- `POST /api/ai/classify` - Classify tender category and priority
- `POST /api/ai/clean-data` - Clean and structure scraped data
- `POST /api/ai/extract-companies` - Extract company information

### Applications (`/api/applications`)
- `GET /api/applications` - List user applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/[id]` - Update application status
- `GET /api/applications/stats` - Get application statistics

### Email Notifications (`/api/email`)
- `POST /api/email/deadline-reminder` - Send deadline reminders
- `POST /api/email/new-tender` - Notify about new tenders
- `POST /api/email/application-update` - Application status updates

### System Health
- `GET /health` - System health check
- `GET /api/version` - Application version info

## Architecture

### System Components
```
Frontend (Next.js)     Backend (Node.js)     Database (Supabase)
     |                        |                      |
     |-- API Requests -------->|                      |
     |<-- JSON Responses -----|                      |
     |                        |-- Database Queries -->|
     |                        |<-- Data Responses ----|
```

### Data Flow
1. **Scraping Pipeline**: Automated jobs fetch tender data from external sources
2. **AI Processing**: OpenAI analyzes and classifies tender information
3. **Database Storage**: Cleaned data stored in Supabase PostgreSQL
4. **Real-time Updates**: Frontend receives live updates via Supabase subscriptions
5. **Notification System**: Email alerts sent for deadlines and new opportunities

### Queue System
- **Redis**: In-memory data store for job queues
- **BullMQ**: Advanced job processing with priority and retry logic
- **Scheduler**: Automated scraping at configurable intervals

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI analysis | Yes | `sk-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | `eyJ...` |
| `NODE_ENV` | Environment (development/production) | No | `development` |
| `PORT` | Backend server port | No | `3001` |
| `REDIS_URL` | Redis connection string | Yes | `redis://localhost:6379` |
| `EMAIL_HOST` | SMTP server for notifications | Yes | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | Yes | `587` |
| `EMAIL_USER` | Email username | Yes | `user@gmail.com` |
| `EMAIL_PASS` | Email password/app password | Yes | `app_password` |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the FAQ section

## Roadmap

- [ ] Advanced filtering and search
- [ ] Mobile app development
- [ ] Integration with more tender sources
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Team collaboration features

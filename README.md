# Dashboard Application

A modern dashboard application for analyzing permit data with interactive charts and reports.

## Features

- **Interactive Charts**: Plotly-based visualizations for data analysis
- **Multiple Report Types**: Annual, quarterly, and monthly permit analysis
- **Responsive Design**: Modern UI with Tailwind CSS
- **Database Integration**: PostgreSQL backend with Express.js API
- **Real-time Data**: Dynamic data fetching and filtering

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- Tailwind CSS
- Plotly.js for charts
- React Router for navigation
- Tanstack Table for data tables

### Backend
- Node.js
- Express.js
- PostgreSQL
- CORS middleware
- Environment-based configuration

## Local Development

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Create PostgreSQL database named 'dashboard'
   createdb dashboard
   
   # Set up database schema and import data
   npm run db:setup
   npm run db:import
   ```

4. **Environment Configuration**
   ```bash
   # Copy example environment file
   cp server/env.example server/.env
   
   # Update server/.env with your database credentials:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=dashboard
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

5. **Run the application**
   ```bash
   # Start the backend server (in one terminal)
   npm run server
   
   # Start the frontend development server (in another terminal)
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Production Deployment

### Vercel + Supabase

This application is configured for deployment on Vercel with Supabase PostgreSQL.

#### Supabase Setup

1. **Create a Supabase project**
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Note down the database URL and credentials

2. **Deploy the database**
   ```bash
   # Set environment variables for production database
   export DB_HOST=your-supabase-host
   export DB_PASSWORD=your-supabase-password
   
   # Run deployment script
   npm run deploy
   ```

#### Vercel Deployment

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables (Required in Vercel)**
   ```
   DB_HOST=db.laahepxmxohncqwjbuim.supabase.co
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=9FqrN0ilLwLfhqPn
   DATABASE_URL=postgresql://postgres:9FqrN0ilLwLfhqPn@db.laahepxmxohncqwjbuim.supabase.co:5432/postgres
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically build and deploy your application
   - The `vercel.json` configuration handles both frontend and API routes

## API Endpoints

- `GET /api/dashboard/yearly` - Yearly permit data
- `GET /api/dashboard/quarterly` - Quarterly permit data  
- `GET /api/dashboard/monthly` - Monthly permit data
- `GET /api/dashboard/yearly-bins` - Yearly binned permit data
- `GET /api/health` - Health check endpoint

## Database Schema

The application uses four main tables:
- `yearly_permits` - Annual permit statistics
- `quarterly_permits` - Quarterly permit statistics
- `monthly_permits` - Monthly permit statistics
- `yearly_bins_permits` - Annual permits grouped by valuation ranges

## Development Notes

### CORS Configuration
The server is configured to allow connections from multiple localhost ports (5173-5185) to handle Vite's automatic port selection.

### Data Format
All data follows a consistent format with lowercase field names:
- `fiscal_year` - Year of the fiscal period
- `permit_count` - Number of permits issued
- `total_valuation` - Total valuation amount
- Additional fields for quarterly (`quarter`) and monthly (`month`) data

### Error Handling
- Frontend: Error boundaries and try-catch blocks
- Backend: Centralized error handling middleware
- Database: Proper connection handling and query error management

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure frontend and backend ports match CORS configuration
2. **Database Connection**: Verify PostgreSQL is running and credentials are correct
3. **Build Errors**: Check Node.js version compatibility
4. **Missing Data**: Run `npm run db:import` to populate the database

### Logs
- Frontend errors: Browser console
- Backend errors: Server terminal output
- Database errors: Check PostgreSQL logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here] 
# Farm Direct

Farm Direct is a next-generation AgriTech platform designed to bridge the gap between farmers and buyers. It provides a direct, transparent, and technology-driven marketplace, empowering farmers with direct market access, AI-driven insights, and seamless logistics.

## Key Features

*   **Direct Marketplace (Fast Sell & Buy):** Bypass middlemen and connect directly. Farmers can quickly list available produce, while buyers can acquire fresh batches instantly.
*   **AI Storage Advisor:** Get real-time, crop-specific recommendations for storage requirements, temperatures, and shelf life to minimize post-harvest losses.
*   **Logistics & Tracking:** Transparent supply chain with live tracking of shipments and integration with diverse storage capacities (Cold Chain, Dry Warehouse, Cryo-freezing).
*   **Future Harvests (Pre-ordering):** Farmers can list upcoming crops, allowing buyers to secure batches before they hit the market, guaranteeing income and streamlining supply.
*   **Farmer Analytics & Dashboard:** A comprehensive, data-rich dashboard for farmers to track income, view market indices, monitor orders, and gauge their product performance via ratings.

## Technology Stack

The platform is built on modern, scalable web technologies, ensuring performance and an exceptional user experience (Premium Glassmorphism UI).

### Frontend (Client)
*   React 19 (Vite)
*   Tailwind CSS (v4) with Custom Animations & Styling
*   Framer Motion (for fluid micro-interactions)
*   Lucide React (Icons)
*   i18next (Internationalization)
*   Axios

### Backend (Server / Database)
*   Supabase (PostgreSQL Database & Authentication)
*   Node.js & Express (Optional Custom API Layer)
*   Mongoose (for legacy/hybrid integrations)

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   Node.js (v18 or higher)
*   npm or yarn
*   Supabase Account (for database and authentication setup)

### 1. Clone the repository
```bash
git clone https://github.com/Jeeva-07-AID/framdirect.git
cd framdirect
```

### 2. Set up the Database (Supabase)
Execute the provided SQL schema file `SUPABASE_SETUP.sql` in your Supabase project's SQL Editor to create the necessary tables, relationships, and basic RLS policies.

### 3. Configure the Client
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory and configure your Supabase keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

### 4. Configure the Server (Optional fallback layer)
If you require custom backend routes or cron jobs:
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file referencing your DB credentials:
   ```env
   PORT=5000
   MONGO_URI=your_db_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

## Design Philosophy

The project prioritizes a stunning, vibrant aesthetic. It leverages a dark-themed glassmorphism approach combined with high-contrast colors (Emeralds, Ambers) to provide a modern, engaging experience over traditional dull interfaces.

## License

This project is licensed under the MIT License.

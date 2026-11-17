# Smart-MRI Router: AI-Driven Spatial Load Balancing
**Smart-MRI Router** is an AI-powered spatial load-balancing platform designed to resolve extreme patient queue bottlenecks at hospital MRI facilities. The system intelligently distributes patient loads from a central Hub hospital to nearby Spoke hospitals in real-time.
> *Disclaimer: All patient queue numbers, occurrences, and medical datasets presented in this application are strictly simulated (dummy data) designed specifically for academic prototyping and system workflow demonstration.*

---
## Background & Solution
MRI facilities frequently experience severe patient bottlenecks at main referral hospitals, leaving MRI capacities at surrounding satellite hospitals underutilized. Prolonged waiting times can be critical for urgent-care patients.

This application implements a **Hub & Spoke architecture**:
* **Hub (Load Center):** RSUP Fatmawati
* **Spokes (Distribution Nodes):** RS Mayapada, RS Siloam, RS Pondok Indah, RSUD Pasar Minggu

When the AI detects a queue surge at the Hub, the system automatically calculates the fastest spatial routes and machine availability at the Spokes to efficiently relocate patients.

## Key Features & Technical Highlights
1. **Time-Series Queue Forecasting:** Utilizes **SARIMAX** Machine Learning models (`arima_model.joblib`) to predict MRI machine load patterns based on cumulative historical data.
2. **Real-Time Spatial Routing:** Integrates with the **Microsoft Azure Maps API** to calculate precise distances, routing latencies, and ETAs (Estimated Time of Arrival) for patient transfers.
3. **Secure Proxy Architecture:** Implements Next.js edge rewrites to handle asynchronous communication securely between the Vercel Serverless network and Hugging Face Spaces (Port 7860), eliminating CORS policy blocks.
4. **Auto-Seeding Database Engine:** A robust backend initialization script that automatically populates the PostgreSQL database with spatial hospital datasets and initial queue states upon server startup.

## System Workflow & Simulation Scenarios
The dashboard is designed to simulate two distinct scenarios: Normal Load and Overload Crisis. 

### Scenario A: Normal Operations
1. **Initial State:** The dashboard displays the current date, total hospitals, and available Hub capacity (e.g., 25 out of 55 slots used, leaving 30 available slots). The live tracker monitors 40 hospitals, focusing on the top 5 nearest facilities.
2. **Demand Forecasting:** The user selects "Tomorrow" to trigger the SARIMAX prediction model.
3. **Time Travel (Actual vs Predicted):** The user advances the system state to "Today" to reveal the actual patient arrivals compared to the AI's forecast.
4. **Router Execution:** Clicking the Spatial Router execution button triggers a logic check. Since the predicted capacity is within safe limits, the system triggers a standard popup alert confirming normal operations without requiring reroutes.

### Scenario B: Overload Crisis & Load Balancing
1. **Triggering Crisis:** After a page refresh, the user activates the **"Krisis Overload"** (Overload Crisis) mode.
2. **Capacity Breach:** Repeating the forecasting and time-travel steps reveals that the incoming patient numbers drastically exceed the Hub's physical capacity.
3. **Spatial Load Balancing:** Clicking the Spatial Router execution button now triggers the core algorithm. The system dynamically reallocates excess patients to the nearest available Spoke hospitals and visually draws the transfer routes on the interactive map.

## Tech Stack (Monorepo Architecture)
* **Frontend:** Next.js (App Router), React, Tailwind CSS, Vercel
* **Backend:** Python, FastAPI, Uvicorn, Docker, Hugging Face Spaces
* **Machine Learning:** Scikit-Learn, Statsmodels (ARIMA/SARIMAX), Joblib
* **Geospatial & Database:** Microsoft Azure Maps API, PostgreSQL (Supabase)

---

## Local Deployment & Testing Guide
For judges, recruiters, or developers who wish to run and test the application locally, follow these steps to deploy the environment using Docker:

### 1. Clone the Repository
Open your terminal and clone the source code:
```bash
git clone [https://github.com/amdihsann/MRI-Smart-Router.git](https://github.com/amdihsann/MRI-Smart-Router.git)
cd MRI-Smart-Router
```

### 2. Configure Environment Variables
Create a new file named .env in the root directory of the project (alongside the docker-compose.yml file). Copy and paste the following configuration, replacing the values with your actual credentials:
```bash
# ==========================================
# FRONTEND CONFIGURATION (Next.js)
# ==========================================
NEXT_PUBLIC_AZURE_MAPS_KEY=your_azure_maps_primary_key_here
BACKEND_URL=http://localhost:8000

# ==========================================
# BACKEND CONFIGURATION (FastAPI & Database)
# ==========================================
DB_USER=mri_admin
DB_PASSWORD=mri_password_secure
DB_NAME=smart_mri_db
DB_PORT=5432
```

### 3. Orchestrate via Docker Compose
Ensure Docker Desktop is running in the background. Open your integrated terminal in the project root and execute the following command to build and run the containers in detached mode:
```bash
docker compose up --build -d
```

### 4. Access the Application
Once the containers display a healthy/running status in Docker Desktop, you can access the application through your web browser:
* Frontend UI (Dashboard): http://localhost:3000
* Backend API (Swagger Docs): http://localhost:8000

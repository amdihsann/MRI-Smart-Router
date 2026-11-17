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

### Scenario A: Normal & Full-Capacity Operations
1. **Initial State & Server Warm-Up:** Upon loading, the dashboard establishes a connection with the cloud backend (displaying a temporary cold-start indicator if waking from sleep) and presents the system date, a 2-card KPI summary (40 monitored network hospitals and RSUP Fatmawati Hub capacity of 55 MRI slots), a scrollable 40-hospital directory, and an interactive Azure Maps view.
2. **Demand Forecasting (`Step 1`):** The user selects a target date from the date picker and clicks **`1 Prediksi AI`** to run the SARIMAX model. Quadrant 4 displays two distinct cards: an **AI Analytical Insight** (evaluating predicted patient volume against the 55-slot Hub limit) and a **Next-Step Action Guide**.
3. **Time Travel & Capacity Evaluation (`Step 2`):** Clicking **`2 Time-Travel`** synchronizes real-time occupancy across all 40 hospitals to the selected target date:
   - **Safe Capacity (`< 55` patients):** The dashboard shifts to a **Green (`SAFE CAPACITY`)** theme, confirming sufficient free MRI slots at RSUP Fatmawati.
   - **Full Capacity (`=== 55` patients):** The dashboard shifts to an **Amber (`FULL CAPACITY`)** standby theme, indicating 100% slot utilization with zero excess patients.
4. **No Unnecessary Rerouting:** Because no capacity breach occurs (`≤ 55` patients), the **`3 Eksekusi Spatial Router`** button remains hidden, preventing redundant rerouting operations.

### Scenario B: Overload Crisis & Spatial Load Balancing
1. **Triggering Surge Scenario:** In Quadrant 3, the user clicks **`Simulate Surge (Lonjakan)`** to inject an artificial emergency patient surge into the RSUP Fatmawati database (or selects a high-demand peak date), resetting the pipeline to `Step 0/3` for end-to-end validation.
2. **Capacity Breach Detection (`Step 1` → `Step 2`):** After running **`1 Prediksi AI`** and **`2 Time-Travel`**, the system detects that Hub occupancy exceeds its 55-patient threshold (`> 55`). The entire interface transitions into a **Red (`CRISIS MODE`)** alert state and unlocks the **`3 Eksekusi Spatial Router`** action button.
3. **Spatial Load Balancing & Patient Audit Log (`Step 3`):** Clicking **`3 Eksekusi Spatial Router`** executes the road-network routing algorithm, transitioning the dashboard to a **Green (`ROUTER ACTIVE`)** state that:
   - Draws green evacuation routes from RSUP Fatmawati to the nearest available spoke hospitals on the Azure Maps canvas.
   - Displays a **Distribution Summary** per destination hospital alongside a **scrollable Patient Transfer Log table** detailing each reassigned patient and their target facility.

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

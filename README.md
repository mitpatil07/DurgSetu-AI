# DurgSetu AI - Crowdsourced Damage Monitoring & Intelligence

DurgSetu AI is a comprehensive platform for monitoring structural integrity and crowdsourcing damage reports for historical sites. The platform combines automated AI-driven visual differencing with a community-powered reporting engine to ensure the preservation of heritage sites.

## 🚀 Key Modules
*   **Stage 1 & 2 Dashboards**: Automated structural health monitoring, featuring risk score tracking, SSIM analysis, and AI-driven change detection.
*   **Crowdsourced Intelligence**: An advanced analytics portal that visualizes community-reported data, featuring temporal trends, contributor leaderboards, and site-wise damage heatmaps.
*   **Report Management**: A robust administrative workflow for reviewing field reports, updating resolution statuses, and documenting repairs.

## 🛠️ Tech Stack
*   **Backend**: Django, Django Rest Framework (DRF), OpenCV, PyTorch (for structural analysis).
*   **Frontend**: React (Vite), Tailwind CSS 4, Lucide Icons, Recharts, SweetAlert2.

## 📦 Setup & Installation

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings (SECRET_KEY, DB_URL, etc.)
   ```
5. Run migrations and start the server:
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

### ☁️ Render (Cloud) Deployment
For automated deployment on Render:
1.  **Build Command**: `pip install -r requirements.txt`
2.  **Start Command**: `./start.sh` (This script handles migrations and admin user creation automatically).
3.  **Environment Variables**: Ensure you set `SECRET_KEY`, `ALLOWED_HOSTS`, and `PORT` in the Render dashboard.

### Frontend Setup
1. Navigate to the `Frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment:
   ```bash
   cp .env.example .env
   # Ensure VITE_API_BASE points to your Django backend (default: http://127.0.0.1:8000/api)
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📈 Recent Improvements
*   **Modernized UI**: Completely refactored dashboards with a premium "Slate/Orange" aesthetic.
*   **Analytical Power**: Integrated advanced metrics including 14-day reporting trends and contributor rankings.
*   **Stability Fixed**: Resolved critical media resolution (404) and date-parsing bugs for real-time data reliability.

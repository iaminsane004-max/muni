# AI Municipal Complaint Analyzer

A React + Vite citizen complaint form and a Flask + SQLite authority dashboard.

## Features

- Citizen complaint submission with description, location, affected population, date/time, and optional image evidence.
- Location selection using a Leaflet map and coordinates.
- Flask API backed by SQLite for storing and retrieving complaints.
- Authority dashboard with summary cards, search, status and impact filters, complaint details, evidence preview, and status updates.
- Responsive layout for desktop and mobile screens.

## Requirements

- Node.js (current LTS recommended)
- Python 3.10 or newer

## Run the backend

From the project root:

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`. The existing `complaints.db` and `uploads/` folder are included in this project archive.

## Run the frontend

Open a second terminal from the project root:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use the **Citizen** and **Authority** controls at the top to switch views.

## Authority API

- `GET /api/complaints` — list complaints.
- `POST /api/complaints` — submit a complaint using multipart form data.
- `PATCH /api/complaints/<complaint_id>/status` — update status with JSON such as `{"status":"In Progress"}`.

Allowed statuses: `Submitted`, `In Progress`, `Resolved`, and `Rejected`.

## Notes

- The frontend currently expects the Flask API at `http://127.0.0.1:5000`.
- This is a development prototype. Add authentication and authorization before exposing authority actions to a public network.

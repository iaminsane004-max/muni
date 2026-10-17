from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)


def init_db():
    connection = sqlite3.connect("complaints.db")

    connection.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            population TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            image_filename TEXT
        )
    """)

    try:
        connection.execute(
            "ALTER TABLE complaints ADD COLUMN latitude REAL"
        )
        connection.commit()
    except sqlite3.OperationalError:
     pass

    try:
        connection.execute(
            "ALTER TABLE complaints ADD COLUMN longitude REAL"
        )
        connection.commit()
    except sqlite3.OperationalError:
        pass

    connection.commit()
    connection.close()


@app.route("/")
def home():
    return "AI Municipal Complaint Analyzer Backend is running!"


# POST - receive and save a new complaint
@app.route("/api/complaints", methods=["POST"])
def create_complaint():
    complaint_id = request.form["id"]
    description = request.form["description"]
    location = request.form["location"]
    population = request.form["population"]
    date = request.form["date"]
    status = request.form["status"]

    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")

    image = request.files.get("image")

    image_filename = None

    if image:
        image_filename = complaint_id + "_" + image.filename
        image.save("uploads/" + image_filename)

    connection = sqlite3.connect("complaints.db")

    connection.execute("""
    INSERT INTO complaints
    (id, description, location, latitude, longitude, population, date, status, image_filename)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
    complaint_id,
    description,
    location,
    latitude,
    longitude,
    population,
    date,
    status,
    image_filename
))
    connection.commit()
    connection.close()

    print("Complaint saved to database:")
    print(complaint_id)
    print("Image:", image_filename)

    return jsonify({
        "message": "Complaint saved successfully",
        "complaint_id": complaint_id,
        "image": image_filename
    }), 201


# GET - retrieve all complaints
@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    connection = sqlite3.connect("complaints.db")

    cursor = connection.cursor()

    cursor.execute("SELECT * FROM complaints")

    rows = cursor.fetchall()

    connection.close()

    complaints = []

    for row in rows:
        complaints.append({
    "id": row[0],
    "description": row[1],
    "location": row[2],
    "latitude": row[3],
    "longitude": row[4],
    "population": row[5],
    "date": row[6],
    "status": row[7],
    "image_filename": row[8]
})

    return jsonify(complaints)


# PATCH - update the status of an existing complaint
@app.route("/api/complaints/<complaint_id>/status", methods=["PATCH"])
def update_complaint_status(complaint_id):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    allowed_statuses = {"Submitted", "In Progress", "Resolved", "Rejected"}

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid status. Choose Submitted, In Progress, Resolved, or Rejected."}), 400

    connection = sqlite3.connect("complaints.db")
    cursor = connection.execute(
        "UPDATE complaints SET status = ? WHERE id = ?",
        (status, complaint_id),
    )
    connection.commit()
    updated = cursor.rowcount
    connection.close()

    if not updated:
        return jsonify({"error": "Complaint not found."}), 404

    return jsonify({"message": "Complaint status updated successfully.", "id": complaint_id, "status": status})


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
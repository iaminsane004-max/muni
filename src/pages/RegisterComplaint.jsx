
import { useState } from "react";
import { Link } from "react-router-dom";
import LocationMap from "../LocationMap";

function RegisterComplaint() {
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    population: "",
    date: "",
    image: null,
    latitude: "",
    longitude: "",
  });

  const [submittedComplaint, setSubmittedComplaint] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      image: event.target.files?.[0] || null,
    }));
  };

  const updateLocation = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to retrieve address");
      }

      const data = await response.json();

      setFormData((previous) => ({
        ...previous,
        latitude,
        longitude,
        location: data.display_name || previous.location,
      }));
    } catch (error) {
      console.error("Error retrieving address:", error);

      setFormData((previous) => ({
        ...previous,
        latitude,
        longitude,
      }));

      alert(
        "Coordinates were saved, but the address could not be retrieved. Please enter the address manually."
      );
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to get your location. Please enter it manually.");
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const complaintId =
      "CMP-" +
      new Date().toISOString().slice(0, 10).replaceAll("-", "") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const formDataToSend = new FormData();

    formDataToSend.append("id", complaintId);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("latitude", formData.latitude);
    formDataToSend.append("longitude", formData.longitude);
    formDataToSend.append("population", formData.population);
    formDataToSend.append("date", formData.date);
    formDataToSend.append("status", "Submitted");

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/complaints",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit complaint");
      }

      const result = await response.json();
      console.log("Backend response:", result);

      setSubmittedComplaint({
        id: complaintId,
        description: formData.description,
        location: formData.location,
        status: "Submitted",
      });

      setFormData({
        description: "",
        location: "",
        population: "",
        date: "",
        image: null,
        latitude: "",
        longitude: "",
      });

      event.target.reset();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Could not submit complaint to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <section className="page-intro">
        <p className="page-eyebrow">CITIZEN SERVICES</p>
        <h1>Register a Complaint</h1>
        <p>
          Provide the details of the civic issue and its location
          so that the concerned municipal authorities can review it.
        </p>
      </section>

      <main className="complaint-container register-form-container">
        <div className="form-heading">
          <h2>Complaint Details</h2>
          <p>Fields marked with * are required.</p>
        </div>

        <form className="complaint-form" onSubmit={handleSubmit}>
          <label htmlFor="description">
            Complaint Description *
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the problem, its severity, and how it affects the area..."
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="image">Upload Supporting Image *</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          <label htmlFor="location">Issue Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter the location of the problem"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <div className="map-instructions">
            <strong>Select the issue location</strong>
            <p>
              Click on the map to place a pin at the affected location,
              or use your current location as a starting point.
            </p>
          </div>

          <LocationMap
            position={
              formData.latitude !== "" &&
              formData.longitude !== ""
                ? [
                    Number(formData.latitude),
                    Number(formData.longitude),
                  ]
                : null
            }
            setPosition={async (position) => {
              await updateLocation(position[0], position[1]);
            }}
          />

          <button
            type="button"
            className="location-button"
            onClick={handleGetLocation}
          >
            Use My Current Location
          </button>

          <label htmlFor="population">
            Estimated Impact on Population *
          </label>
          <select
            id="population"
            name="population"
            value={formData.population}
            onChange={handleChange}
            required
          >
            <option value="">Select impact level</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label htmlFor="date">Date and Time of Issue *</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            onClick={(event) => event.currentTarget.showPicker()}
            required
        />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>

        {submittedComplaint && (
          <div className="success-message" role="status">
            <h3>Complaint Submitted Successfully!</h3>
            <p>
              Your Complaint ID is:{" "}
              <strong>{submittedComplaint.id}</strong>
            </p>
            <p>
              Status: <strong>{submittedComplaint.status}</strong>
            </p>
            <p>
              Save your complaint ID to track its progress later.
            </p>
            <Link
              to="/track-complaint"
              className="home-primary-button"
            >
              Track This Complaint
            </Link>
          </div>
        )}
      </main>

      <footer className="home-footer">
        <div>
          <strong>AI Municipal Complaint Analyzer</strong>
          <p>Working towards better municipal services.</p>
        </div>
        <Link to="/">Back to Home</Link>
      </footer>
    </div>
  );
}

export default RegisterComplaint;

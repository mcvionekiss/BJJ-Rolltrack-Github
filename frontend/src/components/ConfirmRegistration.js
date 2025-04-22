import React from "react";

const ConfirmRegistration = ({ formData, onEdit, onSubmit }) => {
  return (
    <div className="confirmation-container">
      <h2>Review and Confirm Your Registration</h2>

      <div className="section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <button onClick={() => onEdit("personal")}>Edit</button>
        </div>
        <div className="section-content">
          <p><span>Name:</span> {formData.firstName} {formData.lastName}</p>
          <p><span>Email:</span> {formData.email}</p>
          {formData.phone && <p><span>Phone Number:</span> {formData.phone}</p>}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Gym Details</h3>
          <button onClick={() => onEdit("gym")}>Edit</button>
        </div>
        <div className="section-content">
          <p>Gym Name: {formData.gymName}</p>
          <p>Address: {formData.address}</p>
          <p>City: {formData.city}</p>
          <p>State: {formData.state}</p>
          <p>Gym Email: {formData.gymEmail}</p>
          <p>Gym Phone: {formData.gymPhoneNumber}</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Schedule Details</h3>
          <button onClick={() => onEdit("schedule")}>Edit</button>
        </div>
        <div className="section-content">
        <p>Gym Hours:</p>
          <ul>
            {formData.schedule && formData.schedule.length > 0 ? (
              formData.schedule.map((entry, index) => (
                  <li key={index}>
                      {entry.day}: {entry.closed ? "Closed" : `${entry.openTime} - ${entry.closeTime}`}
                  </li>
              )) ) : (
              <p>No schedule available</p>
            )}
          </ul>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Waiver Information</h3>
          <button onClick={() => onEdit("waiver")}>Edit</button>
        </div>
        <div className="section-content">
          <p><span>Waiver Type:</span> {formData.waiverType === "default" ? "Default Template" : "Custom Upload"}</p>
          
          {formData.waiverType === "default" ? (
            <p><span>Gym Name on Waiver:</span> {formData.waiverGymName || formData.gymName || "Not specified"}</p>
          ) : (
            <p><span>Uploaded Waiver File:</span> {formData.waiverFileName || "No file uploaded"}</p>
          )}
          
          <p><span>Waiver Status:</span> Ready for member sign-up</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRegistration;
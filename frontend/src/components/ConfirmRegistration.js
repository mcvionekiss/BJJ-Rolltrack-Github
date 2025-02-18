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
        <p>Name: {formData.firstName} {formData.lastName}</p>
        <p>Email: {formData.email}</p>
        {formData.phone && <p>Phone Number: {formData.phone}</p>}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Gym Details</h3>
          <button onClick={() => onEdit("gym")}>Edit</button>
        </div>
        <p>Gym Name: {formData.gymName}</p>
        <p>Address: {formData.address}</p>
        <p>City: {formData.city}</p>
        <p>State: {formData.state}</p>
        <p>Gym Email: {formData.gymEmail}</p>
        <p>Gym Phone: {formData.gymPhoneNumber}</p>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Schedule Details</h3>
          <button onClick={() => onEdit("schedule")}>Edit</button>
        </div>
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
  );
};

export default ConfirmRegistration;
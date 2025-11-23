import styles from "../register/Register.module.css";

export default function ConfirmRegistration({ formData, onEdit }) {
  return (
    <div className={styles["section-content"]}>
      <div className={styles["section-header"]}>
        <h3>Personal Info</h3>
        <button onClick={() => onEdit("personal")}>Edit</button>
      </div>
      <p>
        {formData.firstName} {formData.lastName}
      </p>
      <p>{formData.email}</p>
      {formData.phone && (
        <p>
          <span>Phone Number:</span> {formData.phone}
        </p>
      )}
      <div className={styles["section-header"]}>
        <h3>Gym Details</h3>
        <button onClick={() => onEdit("gym")}>Edit</button>
      </div>
      <p>{formData.gymName}</p>
      <p>{formData.address}</p>
      <p>{formData.city}</p>
      <p>{formData.state}</p>
      <p>{formData.gymEmail}</p>
      <p>{formData.gymPhoneNumber}</p>
      <div className={styles["section-header"]}>
        <h3>Schedule Details</h3>
        <button onClick={() => onEdit("schedule")}>Edit</button>
      </div>
      <p>Gym Hours:</p>
      <ul>
        {formData.schedule && formData.schedule.length > 0 ? (
          formData.schedule.map((entry, index) => (
            <li key={index}>
              {entry.day}:{" "}
              {entry.closed
                ? "Closed"
                : `${entry.openTime} - ${entry.closeTime}`}
            </li>
          ))
        ) : (
          <p>No schedule available</p>
        )}
      </ul>
    </div>
  );
}

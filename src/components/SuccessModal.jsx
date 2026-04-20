import React from "react";
import styles from "@/styles/successModal.module.css";

function SuccessModal({
  open,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon} aria-hidden="true">
          {"\u2713"}
        </div>
        <div className={styles.message}>Data Submitted</div>

        <button type="button" className={styles.button} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default SuccessModal;

import { useEffect, useState } from "react";
import { MdEditNote } from "react-icons/md";
import { useRouter } from "next/navigation";

import styles from "./trialsDataEntry.module.css";

function TrialDepartment({ types = [], selectedType = "", onTypeChange = () => {}, showForm = false }) {
    const router = useRouter();
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [time, setTime] = useState("");
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const now = new Date();
        setTime(
            [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join(":")
        );
    }, []);

    const handleTypeChange = (value) => {
        onTypeChange(value);
        const now = new Date();
        setDate(now.toISOString().split("T")[0]);
        setTime(
            [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join(":")
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleClear = () => {
        setFormData({});
        const now = new Date();
        setDate(now.toISOString().split("T")[0]);
        setTime(
            [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join(":")
        );
    };

    const handleSave = () => {
        console.log(formData);
        alert("Record Saved");
    };

    return (
        <div className={styles.cardShell}>
            <div className={styles.cardForm}>
                <div className={styles.cardRow}>
                    <div className={styles.cardFormGroup}>
                        <label>Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                        >
                            <option value="">Select Type</option>
                            {types.map((item) => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.cardFormGroup}>
                        <label>Basic Information</label>
                        <input name="trialId" placeholder="TRL-20260304-001" onChange={handleChange} />
                    </div>
                </div>

                {showForm && (
                    <>
                        <div className={styles.cardRow}>
                            <div className={styles.cardFormGroup}>
                                <label>Date</label>
                                <input type="date" name="date" value={date} readOnly />
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Time</label>
                                <input type="text" value={time} readOnly />
                            </div>
                        </div>

                        <div className={styles.cardRow}>
                            <div className={styles.cardFormGroup}>
                                <label>Spinning Machine Name</label>
                                <select name="machine">
                                    <option>Select</option>
                                </select>
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Autoconer Machine Name</label>
                                <select name="autoMachine">
                                    <option>Select</option>
                                </select>
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Count Name</label>
                                <input name="count" />
                            </div>
                        </div>

                        <div className={styles.cardRow}>
                            <div className={styles.cardFormGroup}>
                                <label>Purpose</label>
                                <input name="purpose" />
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Trial Name / ID</label>
                                <input name="trialname" />
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Type</label>
                                <select name="trialtype">
                                    <option>Select</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.cardRow}>
                            <div className={styles.cardFormGroup}>
                                <label>Nature</label>
                                <input name="nature" />
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Unit No.</label>
                                <input name="unit" />
                            </div>

                            <div className={styles.cardFormGroup}>
                                <label>Raw Material</label>
                                <input name="material" />
                            </div>
                        </div>

                        <div className={styles.cardRow}>
                            <div className={styles.cardFormGroup}>
                                <label>Mixing</label>
                                <input name="mixing" />
                            </div>

                            <div className={`${styles.cardFormGroup} ${styles.fullWidth}`}>
                                <label>Yarn Results</label>
                                <textarea name="yarnresults" />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showForm && (
                <>
                    <div className={styles.cutsSection}>
                        <h3 className={styles.cutsTitle}>Cuts and Imperfection Parameters</h3>

                        <div className={styles.cutsTop}>
                            {[
                                { label: "Total Cuts" },
                                { label: "Neps Cuts" },
                                { label: "Short Cuts" },
                                { label: "Long Cuts" },
                                { label: "Thin Cuts" },
                            ].map((item) => (
                                <div className={styles.cardFormGroup} key={item.label}>
                                    <label>{item.label}</label>
                                    <input type="text" />
                                </div>
                            ))}
                        </div>

                        <div className={styles.cutsGrid}>
                            {[
                                ["CP", "CM", "CCP", "CCM", "JP"],
                                ["A1", "A2", "A3", "A4"],
                                ["B1", "B2", "B3", "B4"],
                                ["C1", "C2", "C3", "C4"],
                                ["D1", "D2", "D3", "D4"],
                                ["E", "F", "G", "H1", "H2"],
                                ["I1", "I2", "CVP"],
                            ].map((row, rowIndex) =>
                                row.map((item, columnIndex) => (
                                    <div
                                        className={styles.gridItem}
                                        key={`${item}-${rowIndex}`}
                                        style={{ gridRow: rowIndex + 1, gridColumn: columnIndex + 1 }}
                                    >
                                        <label>{item}</label>
                                        <input type="text" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <h3 className={styles.cutsTitle}>User Tester Parameters</h3>
                    <div className={styles.parameterCard}>
                        <div className={styles.cardRow}>
                            {["User ID", "U%", "CVM"].map((label) => (
                                <div className={styles.cardFormGroupfield} key={label}>
                                    <label>{label}</label>
                                    <input />
                                </div>
                            ))}
                        </div>

                        <div className={styles.cardRow}>
                            {["CVM cv%", "CVM 10 mtr", "DR 1.5m"].map((label) => (
                                <div className={styles.cardFormGroupfield} key={label}>
                                    <label>{label}</label>
                                    <input />
                                </div>
                            ))}
                        </div>
                    </div>

                    <h3 className={styles.cutsTitle}>IPI Parameters</h3>
                    <p className={styles.subTitle}>REGULAR IPI</p>
                    <div className={styles.grid4}>
                        {[
                            { label: "Thin -50%" },
                            { label: "Thick +50%" },
                            { label: "Neps +200%" },
                            { label: "Total (Regular)", value: "0.00" },
                        ].map((field) => (
                            <div className={styles.formGroup} key={field.label}>
                                <label>{field.label}</label>
                                <input type="number" value={field.value ?? ""} readOnly={Boolean(field.value)} />
                            </div>
                        ))}
                    </div>

                    <p className={`${styles.subTitle} ${styles.marginTop}`}>HIGHER SENSITIVE IPI</p>
                    <div className={styles.grid4}>
                        {[
                            { label: "Thin -40%" },
                            { label: "Thick +35%" },
                            { label: "Neps +140%" },
                            { label: "Total (HS)", value: "0.00" },
                        ].map((field) => (
                            <div className={styles.formGroup} key={field.label}>
                                <label>{field.label}</label>
                                <input type="number" value={field.value ?? ""} readOnly={Boolean(field.value)} />
                            </div>
                        ))}
                    </div>

                    <p className={styles.cutsTitle}>Other IPI / Final values</p>
                    <div className={styles.cardBox}>
                        <div className={styles.grid3}>
                            {["Thin -30%", "Count", "CSP"].map((label) => (
                                <div className={styles.field} key={label}>
                                    <label>{label}</label>
                                    <input type="number" />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <div className={styles.cardFooter}>
                <button className={styles.cardBack} onClick={() => router.push("/dashboard")}>
                    ← Back to Dashboard
                </button>
                <div className={styles.cardRightActions}>
                    <button className={styles.secondaryBtn} onClick={handleClear}>
                        Clear Form
                    </button>
                    <button className={styles.primaryBtn} onClick={handleSave} disabled={!showForm}>
                        Save Record
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TrialDepartment;

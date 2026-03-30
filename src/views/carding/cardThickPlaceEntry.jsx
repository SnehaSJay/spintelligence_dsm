import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { clearCardingState, submitCardingCardThickPlace } from "@/store/slices/carding";
import styles from "./cardThickPlaceEntry.module.css";

const machines = Array.from({ length: 25 }, (_, index) => `CDG-${String(index + 1).padStart(2, "0")}`);

const createMachineValues = () =>
    machines.reduce((accumulator, machine) => {
        accumulator[machine] = "";
        return accumulator;
    }, {});

function CardThickPlaceEntry({
    types,
    selectedType,
    onTypeChange,
    showForm,
    hideTypeField = false,
}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isLoading, data, error } = useSelector((state) => state.carding ?? {
        isLoading: false,
        data: null,
        error: null,
    });

    const [idNo, setIdNo] = useState("3");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [machineValues, setMachineValues] = useState(createMachineValues);
    const [formMessage, setFormMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const stampNow = () => {
        const now = new Date();
        setDate(now.toISOString().split("T")[0]);
        setTime([String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join(":"));
    };

    useEffect(() => {
        stampNow();
    }, []);

    useEffect(() => {
        if (data?.message) {
            setFormMessage(data.message);
            setIsError(false);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            setFormMessage(error);
            setIsError(true);
        }
    }, [error]);

    useEffect(() => {
        return () => {
            dispatch(clearCardingState());
        };
    }, [dispatch]);

    const resetFormFields = () => {
        setIdNo("3");
        stampNow();
        setMachineValues(createMachineValues());
        setFormMessage("");
        setIsError(false);
    };

    const handleChange = (machine, value) => {
        setMachineValues((currentValues) => ({
            ...currentValues,
            [machine]: value,
        }));
        setFormMessage("");
        setIsError(false);
    };

    const handleClear = () => {
        resetFormFields();
    };

    const handleTypeChange = (value) => {
        onTypeChange(value);
        if (value === "Card Thick Place Entry") {
            stampNow();
            setFormMessage("");
            setIsError(false);
        } else {
            resetFormFields();
        }
    };

    const handleSubmit = async () => {
        const entries = machines.filter((machine) => machineValues[machine] !== "");

        if (!entries.length) {
            setFormMessage("Please enter at least one machine value.");
            setIsError(true);
            return;
        }

        setFormMessage("");
        setIsError(false);

        try {
            for (const machine of entries) {
                await dispatch(submitCardingCardThickPlace({
                    id_no: idNo,
                    entry_date: date,
                    entry_time: time,
                    machine,
                    cv_value: parseFloat(machineValues[machine]),
                    unit: "5m CV",
                })).unwrap();
            }

            setFormMessage("Record submitted successfully.");
            setIsError(false);
            resetFormFields();
        } catch (submitError) {
            setFormMessage(submitError || "Error submitting data.");
            setIsError(true);
        }
    };

    return (
        <>
            <div className={styles["card-form"]}>
                {!hideTypeField && (
                    <div className={styles["card-row"]}>
                        <div className={styles["card-form-group"]}>
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

                        {showForm && (
                            <div className={styles["card-form-group"]}>
                                <label>ID No.</label>
                                <input
                                    value={idNo}
                                    onChange={(e) => setIdNo(e.target.value)}
                                    onWheel={(e) => e.currentTarget.blur()}
                                />
                            </div>
                        )}
                    </div>
                )}

                {showForm && (
                    <>
                        <div className={styles["card-row"]}>
                            <div className={styles["card-form-group"]}>
                                <label>Date</label>
                                <input type="date" value={date} readOnly />
                            </div>

                            <div className={styles["card-form-group"]}>
                                <label>Time</label>
                                <input type="text" value={time} readOnly />
                            </div>
                        </div>

                        <div className={styles["card-machine-section"]}>
                            <div className={styles["card-machine-header"]}>
                                <h4>Enter value for each machine</h4>
                                <button
                                    type="button"
                                    className={styles["card-secondary"]}
                                    onClick={handleClear}
                                >
                                    + New Entry
                                </button>
                            </div>

                            <p className={styles["card-machine-subtitle"]}>Card Thick Place Values</p>

                            <div className={styles["card-machine-grid"]}>
                                {machines.map((machine) => (
                                    <div key={machine} className={styles["card-machine-box"]}>
                                        <label>{machine}</label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="5m CV"
                                            value={machineValues[machine]}
                                            onChange={(e) => handleChange(machine, e.target.value)}
                                            onWheel={(e) => e.currentTarget.blur()}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {showForm ? (
                <>
                    <div className={styles["card-footer"]}>
                        <button
                            type="button"
                            className={styles["card-back"]}
                            onClick={() => router.push("/dashboard")}
                        >
                            ← Back to Dashboard
                        </button>

                        <div className={styles["card-right-actions"]}>
                            <button
                                type="button"
                                className={styles["card-secondary"]}
                                onClick={handleClear}
                            >
                                Clear Form
                            </button>

                            <button
                                type="button"
                                className={styles["card-primary"]}
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>

                    {formMessage ? (
                        <div
                            className={`${styles["message-box"]} ${
                                isError ? styles["message-error"] : styles["message-success"]
                            }`}
                        >
                            {formMessage}
                        </div>
                    ) : null}
                </>
            ) : null}
        </>
    );
}

export default CardThickPlaceEntry;

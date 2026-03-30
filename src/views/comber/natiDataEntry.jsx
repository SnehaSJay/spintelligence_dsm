import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { clearComberState, submitComberNatiDataEntry } from "@/store/slices/comber";
import styles from "./natiDataEntry.module.css";

const emptyComberState = {
    isLoading: false,
    data: null,
    error: null,
};

const createEmptyEntries = (count) =>
    Array.from({ length: count }, () => ({
        mc_no: "",
        ratio_size_1: "",
        ratio_size_07: "",
        ratio_size_05: "",
    }));

function NatiDataEntry({ types, selectedType, onTypeChange, showForm }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isLoading, data, error } = useSelector((state) => state.comber ?? emptyComberState);

    const [natiId, setNatiId] = useState("");
    const [entryDate, setEntryDate] = useState("");
    const [variety, setVariety] = useState("");
    const [entryCount, setEntryCount] = useState(1);
    const [entries, setEntries] = useState(createEmptyEntries(1));
    const [formMessage, setFormMessage] = useState("");

    useEffect(() => {
        setEntryDate(new Date().toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        if (data) {
            setFormMessage("Data saved successfully.");
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            setFormMessage(error);
        }
    }, [error]);

    useEffect(() => {
        return () => {
            dispatch(clearComberState());
        };
    }, [dispatch]);

    const handleGenerate = () => {
        const nextCount = Math.min(Math.max(1, Number(entryCount) || 1), 10);
        setEntryCount(nextCount);
        setEntries((currentEntries) => {
            const nextEntries = createEmptyEntries(nextCount);
            currentEntries.slice(0, nextCount).forEach((entry, index) => {
                nextEntries[index] = entry;
            });
            return nextEntries;
        });
        setFormMessage("");
    };

    const handleEntryChange = (index, field, value) => {
        setEntries((currentEntries) => {
            const nextEntries = [...currentEntries];
            nextEntries[index] = {
                ...nextEntries[index],
                [field]: value,
            };
            return nextEntries;
        });
        setFormMessage("");
    };

    const buildPayload = () => ({
        type: selectedType,
        nati_id: natiId,
        entry_date: entryDate,
        variety,
        entries: entries
            .filter((entry) => entry.mc_no !== "")
            .map((entry) => ({
                mc_no: Number(entry.mc_no),
                ratio_size_1: entry.ratio_size_1 === "" ? null : Number(entry.ratio_size_1),
                ratio_size_07: entry.ratio_size_07 === "" ? null : Number(entry.ratio_size_07),
                ratio_size_05: entry.ratio_size_05 === "" ? null : Number(entry.ratio_size_05),
            })),
    });

    const handleSubmit = async () => {
        if (!natiId) {
            setFormMessage("Please enter Nati ID before submitting.");
            return;
        }

        if (!variety) {
            setFormMessage("Please select variety before submitting.");
            return;
        }

        if (!entries.some((entry) => entry.mc_no !== "")) {
            setFormMessage("Please enter at least one Neps detail row.");
            return;
        }

        setFormMessage("");

        try {
            await dispatch(submitComberNatiDataEntry(buildPayload())).unwrap();
        } catch (submitError) {
            setFormMessage(submitError || "Unable to save nati data.");
        }
    };

    return (
        <>
            <div className={styles["cb-form"]}>
                <div className={styles["cb-row"]}>
                    <div className={styles["cb-form-group"]}>
                        <label>Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => onTypeChange(e.target.value)}
                        >
                            <option value="">Select Type</option>
                            {types.map((item) => (
                                <option key={item.id} value={item.name}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showForm ? (
                        <>
                            <div className={styles["cb-form-group"]}>
                                <label>Nati ID</label>
                                <input
                                    value={natiId}
                                    onChange={(e) => setNatiId(e.target.value)}
                                />
                            </div>

                            <div className={styles["cb-form-group"]}>
                                <label>Entry Date</label>
                                <input
                                    type="date"
                                    value={entryDate}
                                    onChange={(e) => setEntryDate(e.target.value)}
                                    readOnly
                                />
                            </div>
                        </>
                    ) : null}
                </div>

                {showForm ? (
                    <>
                        <div className={styles["cb-row"]}>
                            <div className={styles["cb-form-group"]}>
                                <label>Variety</label>
                                <select
                                    value={variety}
                                    onChange={(e) => setVariety(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="Cotton">Cotton</option>
                                    <option value="Polyester">Polyester</option>
                                    <option value="PC Blend">PC Blend</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles["cb-sample-section"]}>
                            <h4>Neps Details</h4>
                            <div className={styles["cb-form-group"]}>
                                <label>Number of Neps Entries (Max 10)</label>
                                <div className={styles["cb-generate"]}>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={entryCount}
                                        onChange={(e) => setEntryCount(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    <button type="button" onClick={handleGenerate}>
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className={styles["cb-neps-stack"]}>
                                {entries.map((entry, index) => (
                                    <div key={`neps-entry-${index + 1}`} className={styles["cb-neps-card"]}>
                                        <div className={styles["cb-neps-index"]}>{index + 1}</div>
                                        <div className={styles["cb-neps-grid"]}>
                                            <div className={styles["cb-form-group-field"]}>
                                                <label>MC No</label>
                                                <input
                                                    value={entry.mc_no}
                                                    onChange={(e) => handleEntryChange(index, "mc_no", e.target.value)}
                                                />
                                            </div>
                                            <div className={styles["cb-form-group-field"]}>
                                                <label>Ratio into size-1.0</label>
                                                <input
                                                    value={entry.ratio_size_1}
                                                    onChange={(e) => handleEntryChange(index, "ratio_size_1", e.target.value)}
                                                />
                                            </div>
                                            <div className={styles["cb-form-group-field"]}>
                                                <label>Ratio into size-0.7</label>
                                                <input
                                                    value={entry.ratio_size_07}
                                                    onChange={(e) => handleEntryChange(index, "ratio_size_07", e.target.value)}
                                                />
                                            </div>
                                            <div className={styles["cb-form-group-field"]}>
                                                <label>Ratio into size-0.5</label>
                                                <input
                                                    value={entry.ratio_size_05}
                                                    onChange={(e) => handleEntryChange(index, "ratio_size_05", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : null}
            </div>

            {showForm ? (
                <>
                    <div className={styles["cb-footer"]}>
                        <button
                            type="button"
                            className={styles["cb-back"]}
                            onClick={() => router.push("/dashboard")}
                        >
                            ← Back to Dashboard
                        </button>

                        <div className={styles["cb-right-actions"]}>
                            <button
                                type="button"
                                className={styles["cb-primary"]}
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>

                    {formMessage ? (
                        <div className={`${styles["message-box"]} ${error ? styles["message-error"] : styles["message-success"]}`}>
                            {formMessage}
                        </div>
                    ) : null}
                </>
            ) : null}
        </>
    );
}

export default NatiDataEntry;

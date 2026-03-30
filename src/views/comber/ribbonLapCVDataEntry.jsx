import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { clearComberState, submitComberRibbonLapCV } from "@/store/slices/comber";
import styles from "./ribbonLapCVDataEntry.module.css";

const defaultSampleCount = 5;

const createEmptySamples = (count) => Array.from({ length: count }, () => "");

const defaultStats = {
    avg: "",
    min: "",
    max: "",
    sd: "",
    cv: "",
};

const emptyComberState = {
    isLoading: false,
    data: null,
    error: null,
};

function RibbonLapCVDataEntry({ types, selectedType, onTypeChange, showForm }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isLoading, data, error } = useSelector((state) => state.comber ?? emptyComberState);

    const [sampleCount, setSampleCount] = useState(defaultSampleCount);
    const [samples, setSamples] = useState(createEmptySamples(defaultSampleCount));
    const [lapWeight, setLapWeight] = useState("");
    const [machine, setMachine] = useState("");
    const [variety, setVariety] = useState("");
    const [lapType, setLapType] = useState("");
    const [date, setDate] = useState("");
    const [stats, setStats] = useState(defaultStats);
    const [formMessage, setFormMessage] = useState("");

    const isCVEntry = selectedType === "Ribbon Lap CV Data Entry";

    useEffect(() => {
        setDate(new Date().toISOString().split("T")[0]);
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

    const numericSamples = useMemo(
        () => samples.map((value) => parseFloat(value)).filter((value) => !Number.isNaN(value)),
        [samples]
    );

    const handleGenerate = () => {
        const nextCount = Math.max(1, Number(sampleCount) || defaultSampleCount);
        setSampleCount(nextCount);
        setSamples((currentSamples) => {
            const nextSamples = createEmptySamples(nextCount);
            currentSamples.slice(0, nextCount).forEach((value, index) => {
                nextSamples[index] = value;
            });
            return nextSamples;
        });
        setStats(defaultStats);
        setFormMessage("");
    };

    const handleSampleChange = (index, value) => {
        setSamples((currentSamples) => {
            const nextSamples = [...currentSamples];
            nextSamples[index] = value;
            return nextSamples;
        });
        setFormMessage("");
    };

    const calculateStats = () => {
        if (!numericSamples.length) {
            setFormMessage("Enter at least one valid sample value to calculate statistics.");
            setStats(defaultStats);
            return;
        }

        const avg = numericSamples.reduce((sum, value) => sum + value, 0) / numericSamples.length;
        const min = Math.min(...numericSamples);
        const max = Math.max(...numericSamples);
        const variance = numericSamples.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / numericSamples.length;
        const sd = Math.sqrt(variance);
        const cv = avg === 0 ? 0 : (sd / avg) * 100;

        setStats({
            avg: avg.toFixed(2),
            min: min.toFixed(2),
            max: max.toFixed(2),
            sd: sd.toFixed(2),
            cv: cv.toFixed(2),
        });
        setFormMessage("");
    };

    const buildPayload = () => {
        return {
            record_date: date,
            machine_name: machine,
            variety,
            type: lapType,
            lap_weight: lapWeight ? Number(lapWeight) : null,
            samples: samples
                .map((value) => parseFloat(value))
                .filter((value) => !Number.isNaN(value)),
            average: stats.avg ? Number(stats.avg) : null,
            minimum: stats.min ? Number(stats.min) : null,
            maximum: stats.max ? Number(stats.max) : null,
            std_deviation: stats.sd ? Number(stats.sd) : null,
            cv_percent: stats.cv ? Number(stats.cv) : null,
        };
    };

    const handleSubmit = async () => {
        if (!machine) {
            setFormMessage("Please fill machine name before submitting.");
            return;
        }

        if (!variety) {
            setFormMessage("Please select variety before submitting.");
            return;
        }

        if (isCVEntry) {
            if (!lapType || !lapWeight) {
                setFormMessage("Please fill lap type and lap weight before submitting.");
                return;
            }

            if (!stats.avg) {
                setFormMessage("Calculate statistics before submitting.");
                return;
            }
        }

        if (!samples.some((value) => value !== "")) {
            setFormMessage("Please enter at least one sample value.");
            return;
        }

        setFormMessage("");

        try {
            await dispatch(submitComberRibbonLapCV(buildPayload())).unwrap();
        } catch (submitError) {
            setFormMessage(submitError || "Unable to save comber data.");
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
                                <label>Number of Sample Entries</label>
                                <div className={styles["cb-generate"]}>
                                    <input
                                        type="number"
                                        value={sampleCount}
                                        onChange={(e) => setSampleCount(e.target.value)}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                    <button type="button" onClick={handleGenerate}>
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className={styles["cb-form-group"]}>
                                <label>Record Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
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
                                <label>Machine Name</label>
                                <input
                                    value={machine}
                                    onChange={(e) => setMachine(e.target.value)}
                                />
                            </div>

                            <div className={styles["cb-form-group"]}>
                                <label>Variety</label>
                                <select
                                    value={variety}
                                    onChange={(e) => setVariety(e.target.value)}
                                >
                                    <option value="">Select Variety</option>
                                    <option value="Cotton">Cotton</option>
                                    <option value="Polyester">Polyester</option>
                                    <option value="PC Blend">PC Blend</option>
                                </select>
                            </div>

                            <div className={styles["cb-form-group"]}>
                                <label>Type</label>
                                <select
                                    value={lapType}
                                    onChange={(e) => setLapType(e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="Ribbon Lap">Ribbon Lap</option>
                                    <option value="Lap Roll">Lap Roll</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles["cb-row"]}>
                            <div className={styles["cb-form-group"]}>
                                <label>Lap Weight</label>
                                <input
                                    value={lapWeight}
                                    onChange={(e) => setLapWeight(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles["cb-sample-section"]}>
                            <h4>Sample Entries</h4>
                            <div className={styles["cb-sample-grid"]}>
                                {samples.map((value, index) => (
                                    <div key={`sample-${index + 1}`} className={styles["cb-form-group"]}>
                                        <label>Sample {index + 1}</label>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={value}
                                            onChange={(e) => handleSampleChange(index, e.target.value)}
                                        />
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
                                className={styles["cb-secondary"]}
                                onClick={calculateStats}
                            >
                                Calculate Statistics
                            </button>

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

                    <div className={styles["cb-stats"]}>
                        <h4>Calculated Statistics</h4>
                        <div className={styles["cb-stats-grid"]}>
                            <div className={styles["cb-form-group-field"]}>
                                <label>Average</label>
                                <input value={stats.avg} readOnly />
                            </div>
                            <div className={styles["cb-form-group-field"]}>
                                <label>Minimum</label>
                                <input value={stats.min} readOnly />
                            </div>
                            <div className={styles["cb-form-group-field"]}>
                                <label>Maximum</label>
                                <input value={stats.max} readOnly />
                            </div>
                            <div className={styles["cb-form-group-field"]}>
                                <label>Standard Deviation</label>
                                <input value={stats.sd} readOnly />
                            </div>
                            <div className={styles["cb-form-group-field"]}>
                                <label>Coefficient of Variation (CV%)</label>
                                <input value={stats.cv} readOnly />
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
}

export default RibbonLapCVDataEntry;

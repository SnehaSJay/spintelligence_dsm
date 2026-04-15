import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { FaCheckCircle } from "react-icons/fa";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";
import { MdOutlineEditNote } from "react-icons/md";

import Footer from "@/components/Footer";
import PreviewModal from "@/components/PreviewModal";
import SuccessModal from "@/components/SuccessModal";
import {
  fetchDrawFrameFinisherEntries,
  fetchDrawFrameHeaderEntries,
  submitDrawFrameFinisherEntry,
  submitDrawFrameHeaderEntry,
} from "@/apis/draw-frame";
import styles from "@/styles/draw-frame.module.css";
import { sanitizeNumericInput } from "@/utils/inputValidation";

const today = new Date().toISOString().split("T")[0];

const TYPE_CONFIG = {
  "PP - Breaker Drawing": {
    fetchEntries: fetchDrawFrameHeaderEntries,
    submitEntry: submitDrawFrameHeaderEntry,
    successMessage: "Draw frame breaker entry created successfully",
    entryLabel: "breaker",
    topRow: [
      { key: "type", label: "Type", control: "type-select", required: true },
      {
        key: "countName",
        label: "Count Name",
        control: "select",
        placeholder: "Select Count Name",
        required: true,
      },
      {
        key: "consigneeName",
        label: "Consignee Name",
        control: "select",
        placeholder: "Select Consignee Name",
        required: true,
      },
      { key: "creationDate", label: "Creation Date", control: "date-display", required: true },
    ],
    middleRow: [
      { key: "make", label: "Make", required: true },
      { key: "noOfEnds", label: "No. of Ends", required: true },
      { key: "bottomRollSetting", label: "Bottom Roll Setting", required: true },
      { key: "breakerDraft", label: "Breaker's Draft", required: true },
      { key: "totalDraft", label: "Total Draft", required: true },
      { key: "hank", label: "Hank", required: true },
    ],
    bottomRow: [
      { key: "webTensionDraft", label: "Web Tension Draft", required: true },
      { key: "trumpetSize", label: "Trumpet Size", required: true },
      { key: "deliverySpeed", label: "Delivery Speed", required: true },
      { key: "pressureBar", label: "Pressure Bar", required: true },
    ],
    createForm: (selectedType) => ({
      type: selectedType || "PP - Breaker Drawing",
      countName: "",
      consigneeName: "",
      creationDate: today,
      make: "",
      noOfEnds: "",
      bottomRollSetting: "",
      breakerDraft: "",
      totalDraft: "",
      hank: "",
      webTensionDraft: "",
      trumpetSize: "",
      deliverySpeed: "",
      pressureBar: "",
    }),
    buildPayload: (form) => ({
      type: form.type,
      count_name: form.countName,
      consignee_name: form.consigneeName,
      creation_date: form.creationDate,
      make: form.make,
      no_of_ends: parseNumberValue(form.noOfEnds),
      bottom_roll_setting: form.bottomRollSetting,
      breaker_draft: parseNumberValue(form.breakerDraft),
      total_draft: parseNumberValue(form.totalDraft),
      hank: parseNumberValue(form.hank),
      web_tension_draft: parseNumberValue(form.webTensionDraft),
      trumpet_size: parseNumberValue(form.trumpetSize),
      delivery_speed: parseNumberValue(form.deliverySpeed),
      pressure_bar: form.pressureBar,
    }),
    normalizeEntries: normalizeBreakerEntries,
  },
  "PP - Finisher Drawing": {
    fetchEntries: fetchDrawFrameFinisherEntries,
    submitEntry: submitDrawFrameFinisherEntry,
    successMessage: "Draw frame finisher entry created successfully",
    entryLabel: "finisher",
    topRow: [
      { key: "type", label: "Type", control: "type-select", required: true },
      {
        key: "countName",
        label: "Count Name",
        control: "select",
        placeholder: "Select Count Name",
        required: true,
      },
      {
        key: "consigneeName",
        label: "Consignee Name",
        control: "select",
        placeholder: "Select Consignee Name",
        required: true,
      },
      { key: "creationDate", label: "Creation Date", control: "date-display", required: true },
    ],
    middleRow: [
      { key: "make", label: "Make", required: true },
      { key: "noOfEnds", label: "No. of Ends", required: true },
      { key: "bottomRollSetting", label: "Bottom Roll Setting", required: true },
      { key: "breakDraft", label: "Break Draft", required: true },
      { key: "totalDraft", label: "Total Draft", required: true },
      { key: "webTensionDraft", label: "Web Tension Draft", required: true },
    ],
    bottomRow: [
      { key: "trumpetSize", label: "Trumpet Size", required: true },
      { key: "insertSize", label: "Insert Size", required: true },
      { key: "webFunnelSize", label: "Web Funnel Size", required: true },
      { key: "deliveryHank", label: "Delivery hank", required: true },
      { key: "deliverySpeed", label: "Delivery Speed", required: true },
      { key: "pressureBar", label: "Pressure Bar", required: true },
      { key: "scanningRollsSize", label: "Scanning Rolls Size", required: true },
    ],
    createForm: (selectedType) => ({
      type: selectedType || "PP - Finisher Drawing",
      countName: "",
      consigneeName: "",
      creationDate: today,
      make: "",
      noOfEnds: "",
      bottomRollSetting: "",
      breakDraft: "",
      totalDraft: "",
      webTensionDraft: "",
      trumpetSize: "",
      insertSize: "",
      webFunnelSize: "",
      deliveryHank: "",
      deliverySpeed: "",
      pressureBar: "",
      scanningRollsSize: "",
    }),
    buildPayload: (form) => ({
      count_name: form.countName,
      consignee_name: form.consigneeName,
      creation_date: form.creationDate,
      make: form.make,
      no_of_ends: parseNumberValue(form.noOfEnds),
      bottom_roll_setting: form.bottomRollSetting,
      break_draft: parseNumberValue(form.breakDraft),
      total_draft: parseNumberValue(form.totalDraft),
      web_tension_draft: parseNumberValue(form.webTensionDraft),
      trumpet_size: parseNumberValue(form.trumpetSize),
      insert_size: parseNumberValue(form.insertSize),
      web_funnel_size: parseNumberValue(form.webFunnelSize),
      delivery_hank: parseNumberValue(form.deliveryHank),
      delivery_speed: parseNumberValue(form.deliverySpeed),
      pressure_bar: form.pressureBar,
      scanning_rolls_size: form.scanningRollsSize,
    }),
    normalizeEntries: normalizeFinisherEntries,
  },
};

const numericFields = new Set([
  "noOfEnds",
  "breakerDraft",
  "breakDraft",
  "totalDraft",
  "hank",
  "webTensionDraft",
  "trumpetSize",
  "deliverySpeed",
  "insertSize",
  "webFunnelSize",
  "deliveryHank",
]);

function parseNumberValue(value) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDisplayDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function normalizeBreakerEntries(payload) {
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return rows.map((entry, index) => ({
    id: entry?.ins_id || entry?.id || index,
    paramId: entry?.param_id || entry?.parameter_id || entry?.ins_id || entry?.id || "-",
    countName: entry?.count_name || "",
    consigneeName: entry?.consignee_name || "",
    creationDate: entry?.creation_date || "",
    details: [
      { label: "Make", value: entry?.make },
      { label: "No. of Ends", value: entry?.no_of_ends },
      { label: "Bottom Roll Setting", value: entry?.bottom_roll_setting },
      { label: "Breaker's Draft", value: entry?.breaker_draft },
      { label: "Total Draft", value: entry?.total_draft },
      { label: "Hank", value: entry?.hank },
      { label: "Web Tension Draft", value: entry?.web_tension_draft },
      { label: "Trumpet Size", value: entry?.trumpet_size },
      { label: "Delivery Speed", value: entry?.delivery_speed },
      { label: "Pressure Bar", value: entry?.pressure_bar },
    ],
  }));
}

function normalizeFinisherEntries(payload) {
  const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return rows.map((entry, index) => ({
    id: entry?.id || index,
    paramId: entry?.param_id || entry?.id || "-",
    countName: entry?.count_name || "",
    consigneeName: entry?.consignee_name || "",
    creationDate: entry?.creation_date || "",
    details: [
      { label: "Make", value: entry?.make },
      { label: "No. of Ends", value: entry?.no_of_ends },
      { label: "Bottom Roll Setting", value: entry?.bottom_roll_setting },
      { label: "Break Draft", value: entry?.break_draft },
      { label: "Total Draft", value: entry?.total_draft },
      { label: "Web Tension Draft", value: entry?.web_tension_draft },
      { label: "Trumpet Size", value: entry?.trumpet_size },
      { label: "Insert Size", value: entry?.insert_size },
      { label: "Web Funnel Size", value: entry?.web_funnel_size },
      { label: "Delivery hank", value: entry?.delivery_hank },
      { label: "Delivery Speed", value: entry?.delivery_speed },
      { label: "Pressure Bar", value: entry?.pressure_bar },
      { label: "Scanning Rolls Size", value: entry?.scanning_rolls_size },
    ],
  }));
}

function displaySavedValue(value) {
  const normalized = String(value ?? "").trim();
  return normalized && normalized !== "-" ? normalized : "-";
}

function isEntryComplete(entry) {
  return Array.isArray(entry?.details) && entry.details.some((detail) => String(detail?.value ?? "").trim());
}

function getEntrySortValue(entry) {
  const dateValue = entry?.creationDate ? new Date(entry.creationDate).getTime() : 0;
  if (Number.isFinite(dateValue) && dateValue > 0) return dateValue;

  const numericId = Number(entry?.id);
  return Number.isFinite(numericId) ? numericId : 0;
}

function DrawFrameHeaderEntry({ typeOptions, selectedType, onTypeChange }) {
  const router = useRouter();
  const activeType = TYPE_CONFIG[selectedType] ? selectedType : "PP - Breaker Drawing";
  const activeConfig = TYPE_CONFIG[activeType];

  const [form, setForm] = useState(() => activeConfig.createForm(activeType));
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [recentEntries, setRecentEntries] = useState([]);
  const [expandedEntryId, setExpandedEntryId] = useState(null);

  useEffect(() => {
    const nextType = TYPE_CONFIG[selectedType] ? selectedType : "PP - Breaker Drawing";
    setForm(TYPE_CONFIG[nextType].createForm(nextType));
    setErrors({});
    setFormMessage("");
  }, [selectedType]);

  const allFields = useMemo(
    () => [...activeConfig.topRow, ...activeConfig.middleRow, ...activeConfig.bottomRow],
    [activeConfig]
  );

  const loadEntries = async (type = activeType) => {
    try {
      setIsLoadingEntries(true);
      const config = TYPE_CONFIG[type];
      const response = await config.fetchEntries({ page: 1, limit: 10 });
      const normalizedEntries = config
        .normalizeEntries(response)
        .sort((left, right) => getEntrySortValue(right) - getEntrySortValue(left));
      setRecentEntries(normalizedEntries);
      setFormMessage("");
    } catch (error) {
      setRecentEntries([]);
      setFormMessage(error.message || `Unable to load draw frame ${TYPE_CONFIG[type].entryLabel} entries.`);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    loadEntries(activeType);
  }, [activeType]);

  useEffect(() => {
    if (!recentEntries.length) {
      setExpandedEntryId(null);
      return;
    }

    setExpandedEntryId((current) =>
      recentEntries.some((entry) => String(entry.id) === String(current))
        ? current
        : recentEntries[0].id
    );
  }, [recentEntries]);

  const countNameOptions = useMemo(
    () =>
      Array.from(
        new Set(
          recentEntries
            .map((entry) => String(entry.countName || "").trim())
            .filter(Boolean)
            .concat(String(form.countName || "").trim() ? [String(form.countName || "").trim()] : [])
        )
      ),
    [form.countName, recentEntries]
  );

  const consigneeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          recentEntries
            .map((entry) => String(entry.consigneeName || "").trim())
            .filter(Boolean)
            .concat(
              String(form.consigneeName || "").trim()
                ? [String(form.consigneeName || "").trim()]
                : []
            )
        )
      ),
    [form.consigneeName, recentEntries]
  );

  const previewItems = useMemo(
    () =>
      allFields.map((field) => ({
        label: field.label,
        value:
          field.key === "creationDate"
            ? formatDisplayDate(form.creationDate) || "-"
            : form[field.key] || "-",
      })),
    [allFields, form]
  );

  const resetForm = () => {
    setForm(activeConfig.createForm(activeType));
    setErrors({});
    setFormMessage("");
  };

  const handleFieldChange = (field, value) => {
    const nextValue = numericFields.has(field)
      ? sanitizeNumericInput(value, { precision: 10, scale: 2 })
      : value;

    setForm((current) => ({
      ...current,
      [field]: nextValue,
    }));

    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });

    if (formMessage) setFormMessage("");
  };

  const handleTypeSelection = (value) => {
    onTypeChange(value);
  };

  const validate = () => {
    const nextErrors = {};
    if (!String(selectedType || "").trim()) nextErrors.selectedType = true;

    allFields.forEach((field) => {
      if (field.required && !String(form[field.key] || "").trim()) {
        nextErrors[field.key] = true;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      setFormMessage("Please fill all required fields before saving.");
      return;
    }
    setFormMessage("");
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await activeConfig.submitEntry(activeConfig.buildPayload(form));
      await loadEntries(activeType);
      setShowPreview(false);
      setShowSuccess(true);
    } catch (error) {
      setFormMessage(error.message || `Unable to submit draw frame ${activeConfig.entryLabel} entry.`);
      setShowPreview(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetForm();
  };

  const renderSelectOptions = (options, placeholder) => (
    <>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </>
  );

  const renderField = (field) => {
    const hasError = field.key === "type" ? errors.selectedType : errors[field.key];
    const controlClass = `${styles.input} ${styles.headerEntryControl} ${
      hasError ? styles.inputError : ""
    }`;

    if (field.control === "type-select") {
      return (
        <div key={field.key} className={styles.field}>
          <label className={styles.label}>{field.label}</label>
          <select
            value={selectedType}
            onChange={(event) => handleTypeSelection(event.target.value)}
            className={`${styles.select} ${styles.headerEntryControl} ${
              errors.selectedType ? styles.inputError : ""
            }`}
          >
            {typeOptions.map((option) => (
              <option key={option.id} value={option.name}>
                {option.displayName ?? option.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (field.control === "select" && field.key === "countName") {
      return (
        <div key={field.key} className={styles.field}>
          <label className={styles.label}>{field.label}</label>
          <select
            value={form.countName}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={`${styles.select} ${styles.headerEntryControl} ${
              errors.countName ? styles.inputError : ""
            }`}
          >
            {renderSelectOptions(countNameOptions, field.placeholder)}
          </select>
        </div>
      );
    }

    if (field.control === "select" && field.key === "consigneeName") {
      return (
        <div key={field.key} className={styles.field}>
          <label className={styles.label}>{field.label}</label>
          <select
            value={form.consigneeName}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={`${styles.select} ${styles.headerEntryControl} ${
              errors.consigneeName ? styles.inputError : ""
            }`}
          >
            {renderSelectOptions(consigneeOptions, field.placeholder)}
          </select>
        </div>
      );
    }

    if (field.control === "date-display") {
      return (
        <div key={field.key} className={`${styles.field} ${styles.headerEntryDateField}`}>
          <label className={styles.label}>{field.label}</label>
          <input type="text" readOnly value={formatDisplayDate(form.creationDate)} className={controlClass} />
          <input
            type="date"
            value={form.creationDate}
            onChange={(event) => handleFieldChange(field.key, event.target.value)}
            className={styles.headerEntryDateNative}
            aria-label={field.label}
          />
        </div>
      );
    }

    return (
      <div
        key={field.key}
        className={`${styles.field} ${
          field.key === "scanningRollsSize" ? styles.headerEntrySingleField : ""
        }`}
      >
        <label className={styles.label}>{field.label}</label>
        <input
          type="text"
          value={form[field.key]}
          onChange={(event) => handleFieldChange(field.key, event.target.value)}
          className={controlClass}
        />
      </div>
    );
  };

  return (
    <>
      <div className={`${styles.card} ${styles.inspectionCard}`}>
        <div className={styles.cardBody}>
          <div className={styles.sectionHeader}>
            <MdOutlineEditNote className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Inspection Data Entry</h2>
          </div>
          <div className={styles.sectionDivider} />

          <div className={styles.headerEntryWrap}>
            <div className={`${styles.headerEntryGrid} ${styles.headerEntryGridTop}`}>
              {activeConfig.topRow.map(renderField)}
            </div>

            <div className={`${styles.headerEntryGrid} ${styles.headerEntryGridMiddle}`}>
              {activeConfig.middleRow.map(renderField)}
            </div>

            <div className={`${styles.headerEntryGrid} ${styles.headerEntryGridBottom}`}>
              {activeConfig.bottomRow.map(renderField)}
            </div>
          </div>

          {formMessage ? <p className={styles.messageError}>{formMessage}</p> : null}

          <div className={styles.headerEntryFooter}>
            <Footer
              onBack={() => router.push("/dashboard")}
              onClear={resetForm}
              onSave={handleSave}
              saveLabel={isSubmitting ? "Submitting..." : "Submit"}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <PreviewModal
        open={showPreview}
        title="Quality Control - Draw Frame Notebook"
        subtitle="Preview"
        items={previewItems}
        typeValue={selectedType}
        onCancel={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        confirmLabel="Submit"
      />

      <SuccessModal
        open={showSuccess}
        message={activeConfig.successMessage}
        typeValue={selectedType}
        onClose={handleSuccessClose}
      />

      <div className={styles.headerEntryList}>
        {isLoadingEntries ? (
          <p className={styles.messageInfo}>Loading entries...</p>
        ) : recentEntries.length ? (
          recentEntries.map((entry, index) => (
            <div key={`${entry.id}-${index}`} className={styles.headerEntryCard}>
              <div className={styles.headerEntryCardHeader}>
                <div className={styles.headerEntryMetaBlock}>
                  <span className={styles.headerEntryMetaLabel}>Param ID</span>
                  <span className={styles.headerEntryMetaValue}>{displaySavedValue(entry.paramId)}</span>
                </div>
                <div className={styles.headerEntryMetaMain}>
                  <span className={styles.headerEntryMetaLabel}>Consignee Name</span>
                  <span className={styles.headerEntryMetaValue}>{displaySavedValue(entry.consigneeName)}</span>
                </div>
                <div className={styles.headerEntryMetaMain}>
                  <span className={styles.headerEntryMetaLabel}>Count Name</span>
                  <span className={styles.headerEntryMetaValue}>{displaySavedValue(entry.countName)}</span>
                </div>
                <div className={styles.headerEntryCardStatus}>
                  {isEntryComplete(entry) ? <FaCheckCircle className={styles.headerEntryStatusIcon} /> : null}
                </div>
                <button
                  type="button"
                  className={styles.headerEntryToggle}
                  onClick={() =>
                    setExpandedEntryId((current) =>
                      String(current) === String(entry.id) ? null : entry.id
                    )
                  }
                  aria-label={
                    String(expandedEntryId) === String(entry.id)
                      ? "Collapse saved entry details"
                      : "Expand saved entry details"
                  }
                >
                  {String(expandedEntryId) === String(entry.id) ? <HiChevronUp /> : <HiChevronDown />}
                </button>
              </div>

              {String(expandedEntryId) === String(entry.id) ? (
                <div className={styles.headerEntryCardDetails}>
                  <div className={styles.headerEntryDetailsGrid}>
                    {entry.details.map((detail) => (
                      <div key={`${entry.id}-${detail.label}`} className={styles.headerEntryDetailItem}>
                        <span className={styles.headerEntryMetaLabel}>{detail.label}</span>
                        <span className={styles.headerEntryMetaValue}>{displaySavedValue(detail.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.headerEntryCardDate}>
                    {formatDisplayDate(entry.creationDate) || "-"}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <p className={styles.messageInfo}>No entries found.</p>
        )}
      </div>
    </>
  );
}

export default DrawFrameHeaderEntry;

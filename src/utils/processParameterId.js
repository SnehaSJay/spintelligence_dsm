const parseParamId = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;

  const match = normalized.match(/^([A-Za-z]+)[-\s_]?(\d+)$/);
  if (!match) return null;

  return {
    prefix: match[1].toUpperCase(),
    number: Number(match[2]),
    width: match[2].length,
  };
};

export const normalizeProcessParameterId = (value, fallbackPrefix = "PP", fallbackWidth = 4) => {
  const parsed = parseParamId(value);
  if (!parsed) return "";
  return `${parsed.prefix || fallbackPrefix}-${String(parsed.number).padStart(parsed.width || fallbackWidth, "0")}`;
};

export const getInitialProcessParameterId = (fallbackPrefix = "PP", fallbackWidth = 4) =>
  `${String(fallbackPrefix).toUpperCase()}-${String(1).padStart(fallbackWidth, "0")}`;

export const coerceProcessParameterId = (value) => String(value ?? "").trim();

const GLOBAL_PROCESS_PARAMETER_COUNTER_KEY = "pp-global-id-counter";

export const reserveGlobalProcessParameterId = async (fallbackPrefix = "PP", fallbackWidth = 4) => {
  const prefix = String(fallbackPrefix || "PP").trim().toUpperCase();
  const width = Number(fallbackWidth) || 4;

  if (typeof window === "undefined") {
    return `${prefix}-${String(1).padStart(width, "0")}`;
  }

  try {
    const current = Number(window.localStorage.getItem(GLOBAL_PROCESS_PARAMETER_COUNTER_KEY)) || 0;
    const next = current + 1;
    window.localStorage.setItem(GLOBAL_PROCESS_PARAMETER_COUNTER_KEY, String(next));
    return `${prefix}-${String(next).padStart(width, "0")}`;
  } catch {
    return `${prefix}-${String(1).padStart(width, "0")}`;
  }
};


export const normalizeProcessParameterId = (value) => String(value ?? "").trim();

export const coerceProcessParameterId = (value) => String(value ?? "").trim();

export const reserveGlobalProcessParameterId = async (fallbackPrefix = "PP", fallbackWidth = 4) =>
  `${String(fallbackPrefix || "PP").trim().toUpperCase()}-${String(1).padStart(Number(fallbackWidth) || 4, "0")}`;


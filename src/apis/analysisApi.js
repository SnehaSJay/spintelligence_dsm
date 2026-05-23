import apiConfig from "./apiConfig";

const analysisBaseCandidates = Array.from(
  new Set(
    [
      process.env.NEXT_PUBLIC_ANALYSIS_API_BASE,
      "/analysis",
      "/ticket-analysis",
      "/api/analysis",
    ]
      .map((value) => String(value || "").trim().replace(/\/+$/, ""))
      .filter(Boolean)
  )
);

const requestAnalysisApi = async (path, params = {}) => {
  let lastError = null;

  for (const base of analysisBaseCandidates) {
    try {
      const response = await apiConfig.get(`${base}${path}`, params, {
        skipGlobalErrorModal: true,
      });
      return response?.data || {};
    } catch (error) {
      lastError = error;
      if (error?.response?.status !== 404) {
        throw error;
      }
    }
  }

  throw lastError || new Error("Analysis API route not found");
};

export const fetchL1AnalysisApi = (params = {}) => requestAnalysisApi("/l1", params);

export const fetchL2AnalysisApi = (params = {}) => requestAnalysisApi("/l2", params);

export const fetchAnalysisRankingApi = (params = {}) => requestAnalysisApi("/ranking", params);

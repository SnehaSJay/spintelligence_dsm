import apiConfig from "@/apis/apiConfig";

export const getDashboardOptions = (params = {}) => apiConfig.get("/api/dashboard/builder/options/all", params);
export const getMyWidgets = () => apiConfig.get("/api/dashboard/my-widgets");
export const saveMyWidgets = (widgets) => apiConfig.post("/api/dashboard/my-widgets", { widgets });
export const getMyDashboard = (period = "1W") => apiConfig.get("/api/dashboard/my-dashboard", { period });
export const getMyPages = () => apiConfig.get("/api/dashboard/pages/my");
export const getMyPage = (pageKey = "default") => apiConfig.get(`/api/dashboard/pages/my/${encodeURIComponent(pageKey)}`);
export const getMyPageData = (pageKey = "default", period = "1W") =>
  apiConfig.get(`/api/dashboard/pages/my/${encodeURIComponent(pageKey)}/data`, { period });
export const saveMyPage = (pageKey = "default", payload = {}) =>
  apiConfig.post(`/api/dashboard/pages/my/${encodeURIComponent(pageKey)}`, payload);
export const deleteMyPage = (pageKey = "default") =>
  apiConfig.delete(`/api/dashboard/pages/my/${encodeURIComponent(pageKey)}`);

export const getUserWidgets = (userId) => apiConfig.get(`/api/dashboard/builder/widgets/${userId}`);
export const saveUserWidgets = (userId, widgets) => apiConfig.post(`/api/dashboard/builder/widgets/${userId}`, { widgets });
export const reorderUserWidgets = (userId, widgetIds) =>
  apiConfig.patch(`/api/dashboard/builder/widgets/${userId}/reorder`, { widget_ids: widgetIds });
export const toggleUserWidget = (userId, widgetId) =>
  apiConfig.patch(`/api/dashboard/builder/widgets/${userId}/${encodeURIComponent(widgetId)}/toggle`);
export const deleteUserWidget = (userId, widgetId) =>
  apiConfig.delete(`/api/dashboard/builder/widgets/${userId}/${encodeURIComponent(widgetId)}`);
export const getBuilderData = (params = {}) => apiConfig.get("/api/dashboard/builder/data", params);
export const assignDashboard = (userId, widgets) => apiConfig.post(`/api/dashboard/builder/assign/${userId}`, { widgets });
export const assignPageToUser = (userId, pageKey, payload) =>
  apiConfig.post(`/api/dashboard/pages/assign/${userId}/${encodeURIComponent(pageKey)}`, payload);
export const getRoles = () => apiConfig.get("/roles", { page: 1, limit: 200 });
export const getUsers = () => apiConfig.get("/users", { page: 1, limit: 500 });

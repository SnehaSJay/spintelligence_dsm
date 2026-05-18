import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { FiPieChart } from "react-icons/fi";
import { MdOutlineConfirmationNumber, MdOutlinePendingActions, MdOutlineReplay } from "react-icons/md";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { AiOutlineFolderOpen } from "react-icons/ai";

import apiConfig from "@/apis/apiConfig";
import styles from "@/styles/departmentDirectory.module.css";
import { isDashboardManagerUser } from "@/utils/accessControl";
import { getDashboardOwnerUserId } from "@/utils/dashboardOwner";

const DASHBOARD_SELECTION_STORAGE_KEY = "spintelligenceDashboardSelection";

const trendModes = ["1D", "1W", "1M", "1Y"];
const modeMultipliers = { "1D": 0.72, "1W": 0.9, "1M": 1, "1Y": 1.18 };
const DASHBOARD_FETCH_DEBOUNCE_MS = 250;
const normalizeRoleKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
const isExcludedRole = (role) => normalizeRoleKey(role).includes("somplex");

const parseWidgetEnabled = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return true;
  if (["false", "0", "off", "disabled", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "enabled", "yes"].includes(normalized)) return true;
  return true;
};

const normalizeInputFieldKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const visualizationTypeToChartType = (visualizationType) => {
  const normalized = String(visualizationType || "").trim().toLowerCase();
  if (normalized === "average_value_card") return "value";
  if (normalized.includes("line")) return "line";
  if (normalized.includes("bar")) return "bar";
  if (normalized.includes("area")) return "area";
  if (normalized.includes("timeline")) return "timeline";
  return "line";
};

const formatValue = (value, mode) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return (n * (modeMultipliers[mode] || 1)).toFixed(2);
};
const formatIntegerValue = (value, mode) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return String(Math.round(n * (modeMultipliers[mode] || 1)));
};
const formatDayLabel = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
};
const formatMonthLabel = (date) =>
  date.toLocaleString("en-US", { month: "short" });
const getTicketCardLabel = (value) => {
  const key = String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (key === "totaltickets") return "Total Tickets";
  if (key === "open" || key === "opentickets") return "Open";
  if (key === "reopened" || key === "reopenedtickets") return "Reopened";
  if (key === "closed" || key === "closedtickets") return "Closed";
  if (key === "pending" || key === "pendingtickets") return "Pending";
  return "Ticket Dashboard";
};
const getTicketCardIcon = (label) => {
  if (label === "Total Tickets") return MdOutlineConfirmationNumber;
  if (label === "Open") return AiOutlineFolderOpen;
  if (label === "Reopened") return MdOutlineReplay;
  if (label === "Closed") return IoCheckmarkDoneCircleOutline;
  if (label === "Pending") return MdOutlinePendingActions;
  return FiPieChart;
};

function HomeDashboard() {
  const user = useSelector((state) => state.auth?.user);
  const fullName = user?.full_name || user?.fullName || user?.name || "User";
  const dashboardOwnerUserId = useMemo(() => getDashboardOwnerUserId(user), [user]);
  const isDashboardAdmin = useMemo(() => isDashboardManagerUser(user), [user]);

  const [dashboardRoles, setDashboardRoles] = useState([]);
  const [dashboardUsers, setDashboardUsers] = useState([]);
  const [selectedDashboardRole, setSelectedDashboardRole] = useState("");
  const [selectedDashboardUserId, setSelectedDashboardUserId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(DASHBOARD_SELECTION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role) setSelectedDashboardRole(parsed.role);
        if (parsed?.userId) setSelectedDashboardUserId(String(parsed.userId));
      }
    } catch {
      // ignore invalid storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      role: selectedDashboardRole || undefined,
      userId: selectedDashboardUserId || undefined,
    };
    window.localStorage.setItem(DASHBOARD_SELECTION_STORAGE_KEY, JSON.stringify(payload));
  }, [selectedDashboardRole, selectedDashboardUserId]);

  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cardModes, setCardModes] = useState({});
  const [trendModesById, setTrendModesById] = useState({});
  const [widgetData, setWidgetData] = useState({});

  const widgetDataCacheRef = useRef(new Map());
  const debounceTimerRef = useRef(null);
  const inFlightControllersRef = useRef([]);

  const getWithBuilderFallback = async (path, params = {}, options = {}) => {
    try {
      return await apiConfig.get(`/api/dashboard/builder/${path}`, params, {
        skipGlobalErrorModal: true,
        ...options,
      });
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      return apiConfig.get(`/api/dashboard/dashbuilder/${path}`, params, {
        skipGlobalErrorModal: true,
        ...options,
      });
    }
  };

  const fetchMyDashboardWidgets = async () => {
    try {
      return await apiConfig.get("/api/dashboard/my-widgets", {}, { skipGlobalErrorModal: true });
    } catch (error) {
      if (error?.response?.status !== 404) throw error;
      return apiConfig.get("/api/dashboard/dashbuilder/my-widgets", {}, { skipGlobalErrorModal: true });
    }
  };

  const selectedDashboardUserIdNumber = useMemo(() => {
    const id = Number(selectedDashboardUserId);
    return Number.isInteger(id) && id > 0 ? id : null;
  }, [selectedDashboardUserId]);

  const activeDashboardUserId =
    isDashboardAdmin && selectedDashboardUserIdNumber ? selectedDashboardUserIdNumber : dashboardOwnerUserId;
  const isViewingOwnDashboard = !activeDashboardUserId || activeDashboardUserId === dashboardOwnerUserId;

  const normalizedWidgets = useMemo(
    () =>
      (Array.isArray(widgets) ? widgets : []).flatMap((widget, index) => {
        const rawInputField = String(widget?.input_field || widget?.field_name || "SCI");
        const normalizedRaw = rawInputField.toLowerCase();
        const isTicketValuesWidget =
          String(widget?.department || "").trim().toLowerCase() === "ticketing" &&
          ["ticket values", "ticket dashboard"].includes(String(widget?.screen_name || widget?.input_screen || "").trim().toLowerCase());

        if (isTicketValuesWidget && (normalizedRaw.includes("_|_") || normalizedRaw.includes("|"))) {
          const parts = rawInputField
            .split("_|_")
            .flatMap((part) => part.split("|"))
            .map((part) => String(part || "").trim())
            .filter(Boolean);

          if (parts.length > 1) {
            return parts.map((part, partIndex) => ({
              id: `${widget?.id || `widget-${index + 1}`}-${partIndex + 1}`,
              enabled: parseWidgetEnabled(widget?.enabled),
              order: Number.isInteger(widget?.order) ? widget.order + partIndex : index + 1 + partIndex,
              department: widget?.department || "Quality Control",
              sub_department: widget?.sub_department || "Mixing",
              input_screen: widget?.input_screen || widget?.screen_name || "Cotton HVI Data Entry",
              raw_input_field: part,
              input_field: normalizeInputFieldKey(part),
              visualization_type:
                widget?.visualization_type || (widget?.chart_type === "value" ? "average_value_card" : "line_chart"),
              chart_type: widget?.chart_type || visualizationTypeToChartType(widget?.visualization_type),
            }));
          }
        }

        return [{
          id: widget?.id || `widget-${index + 1}`,
          enabled: parseWidgetEnabled(widget?.enabled),
          order: Number.isInteger(widget?.order) ? widget.order : index + 1,
          department: widget?.department || "Quality Control",
          sub_department: widget?.sub_department || "Mixing",
          input_screen: widget?.input_screen || widget?.screen_name || "Cotton HVI Data Entry",
          raw_input_field: rawInputField,
          input_field: normalizeInputFieldKey(rawInputField),
          visualization_type:
            widget?.visualization_type || (widget?.chart_type === "value" ? "average_value_card" : "line_chart"),
          chart_type: widget?.chart_type || visualizationTypeToChartType(widget?.visualization_type),
        }];
      }),
    [widgets]
  );

  const visibleWidgets = useMemo(
    () => normalizedWidgets.filter((widget) => widget.enabled).sort((a, b) => a.order - b.order),
    [normalizedWidgets]
  );

  const isTicketWidget = (widget) =>
    String(widget?.input_field || "").trim().toLowerCase() === "ticket_values" ||
    ["ticket values", "ticket dashboard"].includes(String(widget?.input_screen || "").trim().toLowerCase()) ||
    ["ticket values", "ticket dashboard"].includes(String(widget?.raw_input_field || "").trim().toLowerCase());

  const ticketWidgets = useMemo(
    () => visibleWidgets.filter((widget) => isTicketWidget(widget)),
    [visibleWidgets]
  );

  const averageWidgets = useMemo(
    () => visibleWidgets.filter((widget) => !isTicketWidget(widget) && (widget.visualization_type === "average_value_card" || widget.chart_type === "value")),
    [visibleWidgets]
  );

  const performanceWidgets = useMemo(
    () => visibleWidgets.filter((widget) => !isTicketWidget(widget) && !(widget.visualization_type === "average_value_card" || widget.chart_type === "value")),
    [visibleWidgets]
  );

  useEffect(() => {
    if (!isDashboardAdmin) {
      setDashboardRoles([]);
      setDashboardUsers([]);
      setSelectedDashboardRole("");
      setSelectedDashboardUserId("");
      return;
    }

    let isMounted = true;
    const loadDashboardUserOptions = async () => {
      try {
        const [rolesResponse, usersResponse] = await Promise.all([
          apiConfig.get("/roles", { page: 1, limit: 200 }, { skipGlobalErrorModal: true }),
          apiConfig.get("/users", {}, { skipGlobalErrorModal: true }),
        ]);

        if (!isMounted) return;

        const roles = (Array.isArray(rolesResponse?.data?.roles) ? rolesResponse.data.roles : Array.isArray(rolesResponse?.data) ? rolesResponse.data : [])
          .map((r) => String(r?.role_name || r?.name || r?.role || "").trim())
          .filter((role) => role && !isExcludedRole(role));

        const allowed = new Set(roles);
        const users = (Array.isArray(usersResponse?.data?.users) ? usersResponse.data.users : Array.isArray(usersResponse?.data) ? usersResponse.data : [])
          .map((record) => {
            const id = Number(record?.id || record?.user_id || record?.userId);
            return {
              id: Number.isInteger(id) && id > 0 ? id : null,
              name: String(record?.full_name || record?.name || record?.username || record?.user_name || "").trim(),
              role: String(record?.role_name || record?.role || record?.role_title || "").trim(),
            };
          })
          .filter((u) => u.id && u.name && (!u.role || allowed.has(u.role)));

        const dedupedRoles = Array.from(new Set(roles));
        const dedupedUsers = users.filter((u, i, arr) => i === arr.findIndex((x) => x.id === u.id));
        setDashboardRoles(dedupedRoles);
        setDashboardUsers(dedupedUsers);
        setSelectedDashboardRole((cur) => (cur && dedupedRoles.includes(cur) ? cur : dedupedRoles[0] || ""));
      } catch {
        if (!isMounted) return;
        setDashboardRoles([]);
        setDashboardUsers([]);
      }
    };

    loadDashboardUserOptions();
    return () => {
      isMounted = false;
    };
  }, [isDashboardAdmin]);

  const dashboardUsersForSelectedRole = useMemo(() => {
    if (!selectedDashboardRole) return dashboardUsers;
    const roleMatchedUsers = dashboardUsers.filter((u) => u.role === selectedDashboardRole);
    return roleMatchedUsers.length ? roleMatchedUsers : dashboardUsers;
  }, [dashboardUsers, selectedDashboardRole]);

  useEffect(() => {
    if (!isDashboardAdmin) return;
    setSelectedDashboardUserId((current) => {
      if (current && dashboardUsersForSelectedRole.some((u) => String(u.id) === String(current))) return current;
      if (dashboardOwnerUserId && dashboardUsersForSelectedRole.some((u) => u.id === dashboardOwnerUserId)) return String(dashboardOwnerUserId);
      return dashboardUsersForSelectedRole[0]?.id ? String(dashboardUsersForSelectedRole[0].id) : "";
    });
  }, [isDashboardAdmin, dashboardOwnerUserId, dashboardUsersForSelectedRole]);

  const selectedDashboardUser = useMemo(
    () => dashboardUsers.find((u) => String(u.id) === String(activeDashboardUserId)),
    [dashboardUsers, activeDashboardUserId]
  );

  useEffect(() => {
    let isMounted = true;

    const loadWidgets = async () => {
      if (!activeDashboardUserId) {
        setLoading(false);
        setErrorMessage("Unable to identify dashboard user.");
        return;
      }
      try {
        setLoading(true);
        const response = isViewingOwnDashboard
          ? await fetchMyDashboardWidgets()
          : await getWithBuilderFallback(`widgets/${activeDashboardUserId}`);
        if (!isMounted) return;
        setWidgets(Array.isArray(response?.data?.widgets) ? response.data.widgets : []);
        setWidgetData({});
        widgetDataCacheRef.current.clear();
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) return;
        const deniedOwnConfig =
          error?.response?.status === 403 &&
          String(error?.response?.data?.message || "").toLowerCase().includes("own dashboard configuration");

        if (deniedOwnConfig && isDashboardAdmin) {
          try {
            const fallbackResponse = await fetchMyDashboardWidgets();
            if (!isMounted) return;
            setWidgets(Array.isArray(fallbackResponse?.data?.widgets) ? fallbackResponse.data.widgets : []);
            setWidgetData({});
            widgetDataCacheRef.current.clear();
            setErrorMessage("Selected user dashboard endpoint is restricted by API. Showing admin baseline dashboard.");
            return;
          } catch {
            // fall through to generic error message below
          }
        }

        setWidgets([]);
        setErrorMessage(error?.response?.data?.message || "Unable to load dashboard widgets.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadWidgets();
    return () => {
      isMounted = false;
    };
  }, [activeDashboardUserId, isDashboardAdmin, isViewingOwnDashboard]);

  useEffect(() => {
    setCardModes((current) => [...averageWidgets, ...ticketWidgets].reduce((next, w) => ({ ...next, [w.id]: current[w.id] || "1M" }), {}));
    setTrendModesById((current) => performanceWidgets.reduce((next, w) => ({ ...next, [w.id]: current[w.id] || "1M" }), {}));
  }, [averageWidgets, ticketWidgets, performanceWidgets]);

  useEffect(() => {
    let isMounted = true;

    const clearInFlightRequests = () => {
      inFlightControllersRef.current.forEach((controller) => {
        try {
          controller.abort();
        } catch {
          // no-op
        }
      });
      inFlightControllersRef.current = [];
    };

    const fetchWidgetData = async () => {
      if (!visibleWidgets.length) {
        if (isMounted) setWidgetData({});
        return;
      }

      const pendingRequests = visibleWidgets.map((widget) => {
        const isTicket = isTicketWidget(widget);
        const period = isTicket || widget.visualization_type === "average_value_card" || widget.chart_type === "value"
          ? cardModes[widget.id] || "1M"
          : trendModesById[widget.id] || "1M";

        const key = [widget.department, widget.sub_department, widget.input_screen, widget.input_field, period].join("::");
        const cached = widgetDataCacheRef.current.get(key);
        if (cached) return Promise.resolve({ widgetId: widget.id, key, data: cached, cached: true });

        const controller = new AbortController();
        inFlightControllersRef.current.push(controller);

        return getWithBuilderFallback(
          "data",
          {
            department: widget.department,
            sub_department: widget.sub_department,
            input_screen: widget.input_screen,
            input_field: widget.input_field,
            period,
          },
          { signal: controller.signal }
        )
          .catch(async (error) => {
            const fallbackInputField = String(widget.raw_input_field || "").trim();
            if (!fallbackInputField || fallbackInputField === widget.input_field) throw error;
            return getWithBuilderFallback(
              "data",
              {
                department: widget.department,
                sub_department: widget.sub_department,
                input_screen: widget.input_screen,
                input_field: fallbackInputField,
                period,
              },
              { signal: controller.signal }
            );
          })
          .then((response) => ({ widgetId: widget.id, key, data: response?.data || null }))
          .catch(() => ({ widgetId: widget.id, key, data: null }));
      });

      const results = await Promise.all(pendingRequests);
      if (!isMounted) return;

      setWidgetData((current) => {
        const next = { ...current };
        results.forEach((result) => {
          if (!result) return;
          next[result.widgetId] = result.data;
          if (result.data) widgetDataCacheRef.current.set(result.key, result.data);
        });
        return next;
      });
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    clearInFlightRequests();
    debounceTimerRef.current = setTimeout(fetchWidgetData, DASHBOARD_FETCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      clearInFlightRequests();
      isMounted = false;
    };
  }, [visibleWidgets, cardModes, trendModesById]);

  return (
    <div className={styles.dashboardMain}>
      <section className={styles.referenceDashboardHeader}>
        <div>
          <span>Welcome Back, {fullName}</span>
          {isDashboardAdmin ? <strong>Viewing: {selectedDashboardUser?.name || fullName}</strong> : null}
        </div>
        {isDashboardAdmin ? (
          <div className={styles.dashboardUserControls}>
            <label>
              <span>Role</span>
              <select value={selectedDashboardRole} onChange={(e) => setSelectedDashboardRole(e.target.value)}>
                {dashboardRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Name</span>
              <select value={selectedDashboardUserId} onChange={(e) => setSelectedDashboardUserId(e.target.value)}>
                {dashboardUsersForSelectedRole.map((record) => (
                  <option key={record.id} value={record.id}>{record.name}</option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </section>

      {ticketWidgets.length ? (
        <section className={styles.referenceSection}>
          <h1>Ticket Dashboard</h1>
          <div className={styles.referenceStatsGrid}>
            {ticketWidgets.map((card) => (
              <article key={card.id} className={styles.referenceStatCard}>
                {(() => {
                  const ticketLabel = getTicketCardLabel(card.raw_input_field || card.input_field);
                  const TicketIcon = getTicketCardIcon(ticketLabel);
                  return (
                    <div className={styles.referenceStatHeader}>
                      <div>
                        <h2>{ticketLabel}</h2>
                    <span>{`${card.department} | ${card.sub_department} | ${card.input_screen}`}</span>
                      </div>
                      <span className={styles.referenceStatIcon}><TicketIcon /></span>
                    </div>
                  );
                })()}
              <div className={styles.referenceStatBottom}>
                  <strong>{formatIntegerValue(widgetData?.[card.id]?.average_value, cardModes[card.id])}</strong>
                  <div className={styles.referenceMiniToggle}>
                    {trendModes.map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={cardModes[card.id] === mode ? styles.referenceMiniToggleActive : ""}
                        onClick={() => setCardModes((current) => ({ ...current, [card.id]: mode }))}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.referenceSection}>
        <h1>Average Values</h1>
        <div className={styles.referenceStatsGrid}>
          {averageWidgets.map((card) => (
            <article key={card.id} className={styles.referenceStatCard}>
              <div className={styles.referenceStatHeader}>
                <div>
                  <h2>{card.raw_input_field || card.input_field || "Metric"}</h2>
                  <span>{`${card.department} | ${card.sub_department} | ${card.input_screen}`}</span>
                </div>
                <span className={styles.referenceStatIcon}><FiPieChart /></span>
              </div>
              <div className={styles.referenceStatBottom}>
                <strong>{formatValue(widgetData?.[card.id]?.average_value, cardModes[card.id])}</strong>
                <div className={styles.referenceMiniToggle}>
                  {trendModes.map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      className={cardModes[card.id] === mode ? styles.referenceMiniToggleActive : ""}
                      onClick={() => setCardModes((current) => ({ ...current, [card.id]: mode }))}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.referenceSection}>
        <h1>Performance Trends</h1>
        {performanceWidgets.map((widget) => (
          <PerformanceLineCard
            key={widget.id}
            widget={widget}
            data={widgetData?.[widget.id]}
            activeMode={trendModesById[widget.id] || "1M"}
            setActiveMode={(nextMode) => setTrendModesById((current) => ({ ...current, [widget.id]: nextMode }))}
          />
        ))}
      </section>

      {loading ? <p>Loading dashboard...</p> : null}
      {!loading && !averageWidgets.length && !performanceWidgets.length && !ticketWidgets.length ? <p>No dashboard widgets configured.</p> : null}
      {errorMessage ? <p>{errorMessage}</p> : null}
    </div>
  );
}

function PerformanceLineCard({ widget, data, activeMode, setActiveMode }) {
  const baseTrendPoints = useMemo(() => {
    const points = Array.isArray(data?.trend) && data.trend.length ? data.trend : [];
    return points
      .map((point) => {
        const raw = Number(point?.value);
        return { label: String(point?.label || ""), value: Number.isFinite(raw) ? raw : null };
      })
      .filter((point) => point.value !== null);
  }, [data]);

  const currentLinePoints = useMemo(() => {
    const multiplier = modeMultipliers[activeMode] || 1;
    const fallbackValue = Number.isFinite(Number(data?.average_value)) ? Number(data.average_value) : 0;

    if (activeMode === "1M") {
      const today = new Date();
      const source = baseTrendPoints.slice(-30);
      return Array.from({ length: 30 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - index));
        const sourcePoint = source[index];
        const raw = Number.isFinite(Number(sourcePoint?.value)) ? Number(sourcePoint.value) : fallbackValue;
        return {
          label: formatDayLabel(date),
          value: Math.max(0, raw * multiplier),
        };
      });
    }

    if (activeMode === "1Y") {
      const now = new Date();
      const source = baseTrendPoints.slice(-12);
      return Array.from({ length: 12 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
        const sourcePoint = source[index];
        const raw = Number.isFinite(Number(sourcePoint?.value)) ? Number(sourcePoint.value) : fallbackValue;
        return {
          label: formatMonthLabel(date),
          value: Math.max(0, raw * multiplier),
        };
      });
    }

    const points = baseTrendPoints.length ? baseTrendPoints : [{ label: "No Data", value: fallbackValue }];
    return points.map((point) => ({
      label: point.label,
      value: Math.max(0, Number(point.value || 0) * multiplier),
    }));
  }, [activeMode, baseTrendPoints, data]);

  const lineChartPoints = useMemo(() => {
    const xPadding = 6;
    const yPadding = 8;
    const width = 100 - xPadding * 2;
    const height = 100 - yPadding * 2;
    const max = Math.max(...currentLinePoints.map((point) => point.value), 100);

    return currentLinePoints.map((point, index) => {
      const denominator = Math.max(1, currentLinePoints.length - 1);
      const x = xPadding + (index / denominator) * width;
      const y = yPadding + height - (point.value / max) * height;
      return { ...point, x, y };
    });
  }, [currentLinePoints]);

  const linePolyline = useMemo(() => lineChartPoints.map((point) => `${point.x},${point.y}`).join(" "), [lineChartPoints]);
  const lineArea = `${lineChartPoints[0]?.x || 0},100 ${linePolyline} ${lineChartPoints[lineChartPoints.length - 1]?.x || 100},100`;

  return (
    <article className={`${styles.referenceChartCard} ${styles.referenceLineCard}`}>
      <div className={styles.referenceChartHeader}>
        <div>
          <h2>{widget?.raw_input_field || widget?.input_field || "Metric"}</h2>
          <span>{`${widget?.department || ""} | ${widget?.sub_department || ""} | ${widget?.input_screen || ""}`}</span>
        </div>
        <div className={styles.referenceLineHeaderRight}>
          <span className={styles.referenceLegend}><i /> Trend</span>
          <ModeToggle activeMode={activeMode} setActiveMode={setActiveMode} />
        </div>
      </div>

      <div className={styles.referenceLineChart}>
        <div className={styles.referenceYAxis}>
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        <div className={styles.referenceLinePlot}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points={lineArea} />
            <polyline points={linePolyline} />
          </svg>
          {lineChartPoints.map((point, idx) => (
            <span
              key={`${point.label}-${idx}`}
              className={styles.referenceLinePoint}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>
        <div className={styles.referenceXAxis}>
          {currentLinePoints.map((point, idx) => (
            <span key={`${point.label}-${idx}`}>{point.label || "-"}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ModeToggle({ activeMode, setActiveMode }) {
  return (
    <div className={styles.referenceModeToggle}>
      {trendModes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={activeMode === mode ? styles.referenceModeToggleActive : ""}
          onClick={() => setActiveMode(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}

export default HomeDashboard;

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FiPieChart } from "react-icons/fi";

import { getBuilderData, getMyDashboard, getMyPageData, getUserWidgets } from "@/apis/dashboardApi";
import { fetchUsersAPI } from "@/apis/userApi";
import { isFullAccessUser } from "@/utils/accessControl";
import styles from "@/styles/departmentDirectory.module.css";

const trendModes = ["1D", "1W", "1M", "1Y"];

function HomeDashboard() {
  const user = useSelector((state) => state.auth?.user);
  const fullName = user?.full_name || user?.fullName || user?.name || "Hency Belix";
  const ownUserId = Number(user?.id || user?.user_id || user?.userId) || null;
  const canSelectUsers = isFullAccessUser(user);
  const [period, setPeriod] = useState("1M");
  const [widgets, setWidgets] = useState([]);
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(ownUserId);

  useEffect(() => {
    setSelectedUserId(ownUserId);
  }, [ownUserId]);

  useEffect(() => {
    let mounted = true;
    if (!canSelectUsers) return undefined;

    const loadUsers = async () => {
      try {
        const response = await fetchUsersAPI();
        const rows = Array.isArray(response?.users)
          ? response.users
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];
        if (!mounted) return;
        setUsers(
          rows
            .map((item) => ({
              id: Number(item?.id || item?.user_id || item?.userId),
              name: item?.username || item?.full_name || item?.name || `User ${item?.id || ""}`,
            }))
            .filter((item) => Number.isInteger(item.id) && item.id > 0)
        );
      } catch {
        if (!mounted) return;
        setUsers([]);
      }
    };

    loadUsers();
    return () => {
      mounted = false;
    };
  }, [canSelectUsers]);

  useEffect(() => {
    let mounted = true;
    const loadUserDashboardCards = async () => {
      if (!selectedUserId) return;

      try {
        if (canSelectUsers && ownUserId && selectedUserId !== ownUserId) {
          const response = await getUserWidgets(selectedUserId);
          const selectedWidgets = Array.isArray(response?.data?.widgets)
            ? response.data.widgets.filter((w) => w?.enabled !== false)
            : [];
          if (!mounted) return;
          setWidgets(selectedWidgets);

          const widgetData = await Promise.all(
            selectedWidgets.map(async (widget) => {
              const dataResponse = await getBuilderData({
                department: widget?.department,
                sub_department: widget?.sub_department,
                input_screen: widget?.input_screen,
                input_field: widget?.input_field,
                period,
              });
              return { widget_id: widget?.id, ...(dataResponse?.data || {}) };
            })
          );
          if (!mounted) return;
          setData(widgetData);
          return;
        }

        const response = await getMyPageData("default", period);
        if (!mounted) return;
        const pageWidgets = Array.isArray(response?.data?.widgets) ? response.data.widgets : [];
        const pageData = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (pageWidgets.length) {
          setWidgets(pageWidgets);
          setData(pageData);
          return;
        }

        const fallback = await getMyDashboard(period);
        if (!mounted) return;
        setWidgets(Array.isArray(fallback?.data?.widgets) ? fallback.data.widgets : []);
        setData(Array.isArray(fallback?.data?.data) ? fallback.data.data : []);
      } catch {
        if (!mounted) return;
        setWidgets([]);
        setData([]);
      }
    };
    loadUserDashboardCards();
    return () => {
      mounted = false;
    };
  }, [canSelectUsers, ownUserId, period, selectedUserId]);

  const dataById = useMemo(
    () => new Map(data.map((entry) => [String(entry?.widget_id), entry])),
    [data]
  );

  const avgWidgets = widgets.filter((w) => w?.visualization_type === "average_value_card");
  const trendWidgets = widgets.filter((w) => w?.visualization_type !== "average_value_card");

  return (
    <div className={styles.dashboardMain}>
      <section className={styles.referenceDashboardHeader}>
        <span>Welcome Back, {fullName}</span>
        {canSelectUsers ? (
          <div style={{ marginTop: 10 }}>
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value) || ownUserId)}
            >
              {[{ id: ownUserId, name: "My Dashboard" }, ...users]
                .filter((item, index, arr) => item?.id && arr.findIndex((x) => x.id === item.id) === index)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        ) : null}
      </section>

      <section className={styles.referenceSection}>
        <h1>Average Values</h1>
        <div className={styles.referenceStatsGrid}>
          {avgWidgets.map((widget) => (
            <article key={widget.id} className={styles.referenceStatCard}>
              <div className={styles.referenceStatHeader}>
                <div>
                  <h2>{widget?.input_field || "SCI"}</h2>
                  <span>{[widget?.department, widget?.sub_department, widget?.input_screen].filter(Boolean).join(" | ")}</span>
                </div>
                <span className={styles.referenceStatIcon}>
                  <FiPieChart />
                </span>
              </div>
              <div className={styles.referenceStatBottom}>
                <strong>{dataById.get(String(widget.id))?.average_value ?? "-"}</strong>
                <div className={styles.referenceMiniToggle}>
                  {trendModes.map((mode) => (
                    <button
                      key={`${widget.id}-${mode}`}
                      type="button"
                      className={period === mode ? styles.referenceMiniToggleActive : ""}
                      onClick={() => setPeriod(mode)}
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
        {trendWidgets.slice(0, 2).map((widget) => (
          <PerformanceLineCard
            key={widget.id}
            widget={widget}
            trend={dataById.get(String(widget.id))?.trend || []}
            activeMode={period}
            setActiveMode={setPeriod}
          />
        ))}
      </section>
    </div>
  );
}

function PerformanceLineCard({ widget, trend, activeMode, setActiveMode }) {
  const lineChartPoints = useMemo(() => {
    const points = Array.isArray(trend) && trend.length ? trend : [{ label: "No Data", value: 0 }];
    const values = points.map((p) => Number(p?.value) || 0);
    const xPadding = 6;
    const yPadding = 8;
    const width = 100 - xPadding * 2;
    const height = 100 - yPadding * 2;
    const max = Math.max(...values, 1);

    return points.map((point, index) => {
      const x = xPadding + ((points.length > 1 ? index / (points.length - 1) : 0)) * width;
      const y = yPadding + height - ((Number(point?.value) || 0) / max) * height;
      return { label: point?.label || `P${index + 1}`, x, y };
    });
  }, [trend]);

  const linePolyline = useMemo(
    () => lineChartPoints.map((point) => `${point.x},${point.y}`).join(" "),
    [lineChartPoints]
  );
  const lineArea = `${lineChartPoints[0]?.x || 0},100 ${linePolyline} ${lineChartPoints[lineChartPoints.length - 1]?.x || 100},100`;

  return (
    <article className={`${styles.referenceChartCard} ${styles.referenceLineCard}`}>
      <div className={styles.referenceChartHeader}>
        <div>
          <h2>{widget?.input_field || "SCI"}</h2>
          <span>{[widget?.department, widget?.sub_department, widget?.input_screen].filter(Boolean).join(" | ")}</span>
        </div>
        <div className={styles.referenceLineHeaderRight}>
          <span className={styles.referenceLegend}>
            <i /> Trend
          </span>
          <div className={styles.referenceModeToggle}>
            {trendModes.map((mode) => (
              <button
                key={`${widget.id}-mode-${mode}`}
                type="button"
                className={activeMode === mode ? styles.referenceModeToggleActive : ""}
                onClick={() => setActiveMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
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
          {lineChartPoints.map((point) => (
            <span
              key={`${widget.id}-${point.label}`}
              className={styles.referenceLinePoint}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>
        <div className={styles.referenceXAxis}>
          {lineChartPoints.map((point) => (
            <span key={`${widget.id}-x-${point.label}`}>{point.label}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default HomeDashboard;

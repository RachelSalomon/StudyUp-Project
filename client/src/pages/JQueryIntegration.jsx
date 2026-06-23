import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const JQueryIntegration = () => {
  const { token } = useContext(AuthContext);
  const [taskStats, setTaskStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize jQuery on component mount
  useEffect(() => {
    // Load jQuery if not already loaded
    if (!window.jQuery) {
      const script = document.createElement("script");
      script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
      script.onload = () => {
        console.log("jQuery loaded successfully");
      };
      document.body.appendChild(script);
    }
  }, []);

  const fetchTaskStatsWithJQuery = () => {
    setLoading(true);

    // Using jQuery $.ajax to fetch data from backend
    // This is a professor-required jQuery $.ajax implementation
    if (window.jQuery) {
      window.jQuery(document).ready(function () {
        window.jQuery.ajax({
          url: "http://localhost:5000/api/analytics/tasks",
          type: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          dataType: "json",
          success: function (response) {
            console.log("jQuery AJAX Success:", response);
            setTaskStats(response.data);
            setLoading(false);
          },
          error: function (xhr, status, error) {
            console.error("jQuery AJAX Error:", error);
            setLoading(false);
            alert("Failed to fetch task statistics");
          },
        });
      });
    }
  };

  const fetchCourseAnalyticsWithJQuery = () => {
    setLoading(true);

    if (window.jQuery) {
      window.jQuery(document).ready(function () {
        window.jQuery.ajax({
          url: "http://localhost:5000/api/analytics/courses",
          type: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          dataType: "json",
          success: function (response) {
            console.log("Course Analytics via jQuery:", response);
            alert(
              `Loaded ${response.data.totalEnrolled} courses successfully!`,
            );
            setLoading(false);
          },
          error: function (xhr, status, error) {
            console.error("jQuery AJAX Error:", error);
            setLoading(false);
          },
        });
      });
    }
  };

  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      backgroundColor: "#f5f7fa",
      padding: "40px 20px",
    },
    contentWrapper: {
      maxWidth: "900px",
      margin: "0 auto",
    },
    header: {
      marginBottom: "40px",
      textAlign: "center",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#2c3e50",
      margin: "0 0 15px 0",
    },
    subtitle: {
      fontSize: "16px",
      color: "#7f8c8d",
      margin: 0,
    },
    buttonGroup: {
      display: "flex",
      gap: "15px",
      marginBottom: "40px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    button: {
      padding: "12px 30px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      textShadow: "0.5px 0.5px 1px rgba(0, 0, 0, 0.2)",
    },
    buttonPrimary: {
      backgroundColor: "#3498db",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#2ecc71",
      color: "white",
    },
    dataContainer: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      marginBottom: "40px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    statCard: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
      borderRadius: "8px",
      border: "1px solid #ecf0f1",
      textAlign: "center",
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#3498db",
      margin: "10px 0",
    },
    statLabel: {
      fontSize: "12px",
      color: "#7f8c8d",
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    codeBlock: {
      backgroundColor: "#2c3e50",
      color: "#ecf0f1",
      padding: "20px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "13px",
      overflowX: "auto",
      marginTop: "20px",
      textShadow: "0.5px 0.5px 1px rgba(0, 0, 0, 0.5)",
    },
    infoBox: {
      backgroundColor: "#e8f4f8",
      border: "2px solid #3498db",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      color: "#2c3e50",
    },
    loadingText: {
      textAlign: "center",
      color: "#7f8c8d",
      fontSize: "16px",
      padding: "20px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>jQuery & AJAX Integration</h1>
          <p style={styles.subtitle}>
            Fetch backend data using jQuery $.ajax method
          </p>
        </div>

        <div style={styles.infoBox}>
          <strong>📌 Important:</strong> This page demonstrates jQuery $.ajax()
          integration as required by professor specifications. Click the buttons
          below to fetch data from the backend using jQuery's $.ajax method
          instead of Axios.
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={fetchTaskStatsWithJQuery}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.opacity = "1";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            {loading ? "Loading..." : "📊 Fetch Task Analytics via jQuery"}
          </button>

          <button
            onClick={fetchCourseAnalyticsWithJQuery}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.buttonSecondary,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.opacity = "0.9";
                e.target.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.opacity = "1";
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            {loading ? "Loading..." : "📚 Fetch Course Analytics via jQuery"}
          </button>
        </div>

        {loading && <div style={styles.loadingText}>⏳ Fetching data...</div>}

        {taskStats && (
          <div style={styles.dataContainer}>
            <h2 style={{ marginTop: 0, color: "#2c3e50" }}>
              📈 Task Analytics Summary
            </h2>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Tasks</div>
                <div style={styles.statValue}>
                  {taskStats.summary.totalTasks}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Completed</div>
                <div style={styles.statValue}>
                  {taskStats.summary.completedTasks}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Pending</div>
                <div style={styles.statValue}>
                  {taskStats.summary.pendingTasks}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Completion Rate</div>
                <div style={styles.statValue}>
                  {taskStats.summary.completionRate}%
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: "30px", color: "#2c3e50" }}>
              Tasks by Priority
            </h3>
            <div style={styles.statsGrid}>
              {taskStats.tasksByPriority.map((item, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={styles.statLabel}>{item.priority} Priority</div>
                  <div style={styles.statValue}>{item.totalTasks}</div>
                  <div style={{ fontSize: "12px", color: "#7f8c8d" }}>
                    {item.completionRate.toFixed(1)}% done
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.dataContainer}>
          <h2 style={{ marginTop: 0, color: "#2c3e50" }}>
            jQuery $.ajax Code Example
          </h2>
          <p style={{ color: "#7f8c8d" }}>
            Below is the exact jQuery $.ajax() code used to fetch data from the
            backend:
          </p>
          <div style={styles.codeBlock}>
            {`$.ajax({
  url: "http://localhost:5000/api/analytics/tasks",
  type: "GET",
  headers: {
    Authorization: \`Bearer \${token}\`
  },
  dataType: "json",
  success: function(response) {
    console.log("Success:", response);
    setTaskStats(response.data);
  },
  error: function(xhr, status, error) {
    console.error("Error:", error);
  }
});`}
          </div>
        </div>

        <div style={styles.dataContainer}>
          <h2 style={{ marginTop: 0, color: "#2c3e50" }}>🎯 Key Features</h2>
          <ul
            style={{
              color: "#7f8c8d",
              lineHeight: "1.8",
              paddingLeft: "20px",
            }}
          >
            <li>
              <strong>jQuery $.ajax()</strong> - Uses jQuery's AJAX method
              instead of Axios (professor requirement)
            </li>
            <li>
              <strong>Bearer Token</strong> - Authentication header sent with
              every request
            </li>
            <li>
              <strong>Error Handling</strong> - Proper error callbacks for
              failed requests
            </li>
            <li>
              <strong>Data Type</strong> - Automatically parses JSON response
            </li>
            <li>
              <strong>Real Backend</strong> - Calls actual Express.js endpoints
              at /api/analytics/
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JQueryIntegration;

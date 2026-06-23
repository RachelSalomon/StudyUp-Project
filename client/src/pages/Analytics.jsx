import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import * as d3 from "d3";
import { AuthContext } from "../context/AuthContext";

const Analytics = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/analytics/tasks",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  useEffect(() => {
    if (data && barChartRef.current) {
      renderBarChart();
    }
  }, [data]);

  useEffect(() => {
    if (data && pieChartRef.current) {
      renderPieChart();
    }
  }, [data]);

  const renderBarChart = () => {
    const svgElement = barChartRef.current;
    if (!svgElement) return;

    d3.select(svgElement).selectAll("*").remove();

    // Mathematically balanced dimensions and paddings for layout containment
    const margin = { top: 25, right: 30, bottom: 95, left: 55 };
    const baseWidth = 500;
    const baseHeight = 400;
    const width = baseWidth - margin.left - margin.right;
    const height = baseHeight - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if (!data || !data.tasksByCourse || data.tasksByCourse.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .style("text-anchor", "middle")
        .style("fill", "#95a5a6")
        .style("font-size", "14px")
        .text("No course data available.");
      return;
    }

    const x = d3
      .scaleBand()
      .domain(data.tasksByCourse.map((d) => d.courseName))
      .range([0, width])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data.tasksByCourse, (d) => d.totalTasks) || 1])
      .range([height, 0]);

    const colorScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.tasksByCourse, (d) => d.completionRate) || 15])
      .range(["#e74c3c", "#2ecc71"]);

    // Render columns bars
    svg
      .selectAll(".bar")
      .data(data.tasksByCourse)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.courseName))
      .attr("y", (d) => y(d.totalTasks))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.totalTasks))
      .attr("fill", (d) => colorScale(d.completionRate))
      .attr("rx", 5)
      .attr("ry", 5)
      .style("transition", "all 0.3s ease")
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.85);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      });

    // Render x-axis with appropriate tick-rotation clearing
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("fill", "#2c3e50");

    // Render y-axis with explicit clean scale bounds increments
    svg
      .append("g")
      .call(
        d3
          .axisLeft(y)
          .ticks(
            Math.min(5, d3.max(data.tasksByCourse, (d) => d.totalTasks) || 1),
          )
          .tickFormat(d3.format("d")),
      )
      .selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#34495e");

    // Descriptive labels
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 80)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#7f8c8d")
      .text("Courses list");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "#7f8c8d")
      .text("Task Volume");
  };

  const renderPieChart = () => {
    const svgElement = pieChartRef.current;
    if (!svgElement) return;

    d3.select(svgElement).selectAll("*").remove();

    // Setup layout parameters to safely isolate pie segments and legends blocks
    const baseWidth = 400;
    const baseHeight = 440;
    const radius = Math.min(baseWidth, baseWidth) / 2 - 55;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${baseWidth} ${baseHeight}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", `translate(${baseWidth / 2},${baseWidth / 2 - 35})`);

    if (!data || !data.tasksByPriority || data.tasksByPriority.length === 0) {
      svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "middle")
        .style("fill", "#95a5a6")
        .style("font-size", "14px")
        .text("No priority data available.");
      return;
    }

    const colorScale = d3
      .scaleOrdinal()
      .domain(["high", "medium", "low"])
      .range(["#e74c3c", "#f39c12", "#2ecc71"]);

    const pie = d3
      .pie()
      .value((d) => d.totalTasks)
      .sort(null);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg
      .selectAll(".arc")
      .data(pie(data.tasksByPriority))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.priority))
      .attr("stroke", "white")
      .attr("stroke-width", 2.5)
      .style("transition", "all 0.3s ease")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 0.85);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1);
      });

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d) => `${d.data.totalTasks}`);

    // Repositioned legend safely into the expanded bottom section canvas area
    const legend = svg
      .append("g")
      .attr("transform", `translate(${-radius * 0.95}, ${radius + 25})`);

    const priorities = ["high", "medium", "low"];
    priorities.forEach((priority, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(${i * 95}, 0)`);

      legendRow
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", colorScale(priority))
        .attr("rx", 3);

      legendRow
        .append("text")
        .attr("x", 22)
        .attr("y", 12)
        .style("font-size", "12px")
        .style("font-weight", "500")
        .style("text-transform", "capitalize")
        .style("fill", "#2c3e50")
        .text(priority);
    });
  };

  const styles = {
    container: {
      padding: "40px",
      backgroundColor: "#f5f7fa",
      minHeight: "100vh",
    },
    header: { marginBottom: "40px" },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#2c3e50",
      margin: 0,
      marginBottom: "10px",
    },
    subtitle: { fontSize: "16px", color: "#7f8c8d", margin: 0 },
    summaryCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "20px",
      marginBottom: "40px",
    },
    card: {
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      border: "1px solid #ecf0f1",
    },
    cardValue: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#3498db",
      margin: "10px 0",
    },
    cardLabel: {
      fontSize: "13px",
      color: "#95a5a6",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    chartsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
      gap: "30px",
      marginTop: "40px",
    },
    chartBox: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    chartTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "25px",
      alignSelf: "flex-start",
    },
    loadingText: {
      textAlign: "center",
      padding: "60px 20px",
      fontSize: "18px",
      color: "#7f8c8d",
    },
  };

  if (loading) {
    return <div style={styles.loadingText}>Loading analytics...</div>;
  }

  if (!data) {
    return <div style={styles.loadingText}>No data available</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Analytics Dashboard</h1>
        <p style={styles.subtitle}>
          Your task completion and progress overview
        </p>
      </div>

      <div style={styles.summaryCards}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Total Tasks</div>
          <div style={styles.cardValue}>{data.summary.totalTasks}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Completed</div>
          <div style={styles.cardValue}>{data.summary.completedTasks}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Pending</div>
          <div style={styles.cardValue}>{data.summary.pendingTasks}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Completion Rate</div>
          <div style={styles.cardValue}>{data.summary.completionRate}%</div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Avg Progress</div>
          <div style={styles.cardValue}>{data.summary.avgProgress}%</div>
        </div>
      </div>

      <div style={styles.chartsContainer}>
        <div style={styles.chartBox}>
          <div style={styles.chartTitle}>Tasks by Course</div>
          <svg
            ref={barChartRef}
            style={{ width: "100%", height: "100%", maxHeight: "400px" }}
          ></svg>
        </div>
        <div style={styles.chartBox}>
          <div style={styles.chartTitle}>Tasks by Priority</div>
          <svg
            ref={pieChartRef}
            style={{ width: "100%", height: "100%", maxHeight: "440px" }}
          ></svg>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

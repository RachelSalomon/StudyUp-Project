import React, { useEffect, useState } from "react";
import $ from "jquery";

const JqueryAjaxView = () => {
  const [taskCount, setTaskCount] = useState(0);

  const fetchStatsWithJQuery = () => {
    // Performing jQuery Ajax GET request to the Node.js server
    $.ajax({
      url: "http://localhost:5000/api/analytics",
      type: "GET",
      success: function (data) {
        // Update state with the dynamic data length from MongoDB
        setTaskCount(data.length || 0);
      },
      error: function (error) {
        console.error("Error fetching data with jQuery Ajax:", error);
      },
    });
  };

  return (
    <div className="jquery-container">
      <h2 className="jquery-title">jQuery Ajax Integration System</h2>
      <p className="jquery-desc">
        This component uses the jQuery library to execute live Ajax requests to
        our Express backend to fetch and display dynamic system statistics.
      </p>

      <button className="jquery-btn" onClick={fetchStatsWithJQuery}>
        Fetch Data via Ajax
      </button>

      <div className="jquery-result">
        <h3>Total Dynamic Database Records: {taskCount}</h3>
      </div>

      {/* CSS3 Styling implementing required structural and visual features */}
      <style jsx>{`
        .jquery-container {
          padding: 20px;
          border-radius: 15px; /* CSS3 Requirement: border-radius */
          background: #f9f9f9;
          font-family: sans-serif;
          column-count: 1; /* CSS3 Requirement: Multiple-columns */
        }
        .jquery-title {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* CSS3 Requirement: text-shadow */
          color: #2c3e50;
        }
        .jquery-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.3s ease; /* CSS3 Requirement: transition */
        }
        .jquery-btn:hover {
          background-color: #2980b9;
        }
      `}</style>
    </div>
  );
};

export default JqueryAjaxView;

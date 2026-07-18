import React from "react";

const VideoTour = () => {
  return (
    <div className="container">
      <h2 className="page-title">Video</h2>
      <p style={{ color: "#64748b", marginTop: -8 }}>
        Platform introduction video
      </p>

      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          borderRadius: 14,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          controls
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 14,
          }}
        >
          <source src="/studyup-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default VideoTour;

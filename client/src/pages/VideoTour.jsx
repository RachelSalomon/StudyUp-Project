import React from "react";

const VideoTour = () => {
  const styles = {
    container: {
      minHeight: "calc(100vh - 80px)",
      backgroundColor: "#f5f7fa",
      padding: "40px 20px",
    },
    contentWrapper: {
      maxWidth: "1000px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      marginBottom: "50px",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "36px",
      fontWeight: "bold",
      color: "#2c3e50",
      margin: "0 0 15px 0",
    },
    subtitle: {
      fontSize: "18px",
      color: "#7f8c8d",
      margin: 0,
    },
    videoSection: {
      backgroundColor: "white",
      borderRadius: "15px",
      padding: "30px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      marginBottom: "40px",
    },
    videoContainer: {
      position: "relative",
      width: "100%",
      paddingBottom: "56.25%",
      height: 0,
      overflow: "hidden",
      borderRadius: "12px",
      backgroundColor: "#000",
    },
    video: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "12px",
    },
    featuresGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: "25px",
      marginTop: "40px",
    },
    featureCard: {
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
      border: "1px solid #ecf0f1",
    },
    featureCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)",
    },
    featureIcon: {
      fontSize: "40px",
      marginBottom: "15px",
    },
    featureTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "10px",
      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
    },
    featureDescription: {
      fontSize: "14px",
      color: "#7f8c8d",
      lineHeight: "1.6",
    },
    sectionTitle: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#2c3e50",
      marginTop: "50px",
      marginBottom: "30px",
      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.05)",
    },
    tourSteps: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    stepCard: {
      display: "flex",
      gap: "20px",
      backgroundColor: "white",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      borderLeft: "4px solid #3498db",
      transition: "all 0.3s ease",
    },
    stepNumber: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#3498db",
      minWidth: "50px",
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#2c3e50",
      marginBottom: "8px",
    },
    stepDescription: {
      fontSize: "14px",
      color: "#7f8c8d",
      lineHeight: "1.6",
    },
  };

  const features = [
    {
      icon: "📚",
      title: "Manage Courses",
      description:
        "Create, join, and manage your courses with ease. Organize your study materials by course.",
    },
    {
      icon: "✓",
      title: "Track Tasks",
      description:
        "Create tasks, set priorities, and track completion progress for each course.",
    },
    {
      icon: "💬",
      title: "Real-Time Chat",
      description:
        "Chat with classmates in real-time. Join different rooms to discuss specific topics.",
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description:
        "View your progress with interactive charts and detailed statistics.",
    },
    {
      icon: "🖊️",
      title: "Sketch Pad",
      description:
        "Use the canvas sketch pad to draw, annotate, or create diagrams.",
    },
    {
      icon: "👥",
      title: "Collaboration",
      description:
        "Invite friends, assign tasks, and work together on group projects.",
    },
  ];

  const tourSteps = [
    {
      title: "Step 1: Create Your Account",
      description:
        "Sign up with your email to get started. You can choose your role as a student or manager.",
    },
    {
      title: "Step 2: Join or Create Courses",
      description:
        "Create new courses for your subjects or join existing courses to collaborate with peers.",
    },
    {
      title: "Step 3: Add Tasks & Set Priorities",
      description:
        "Break down your coursework into manageable tasks with deadlines and priority levels.",
    },
    {
      title: "Step 4: Track Progress",
      description:
        "Monitor your completion rate and progress through the analytics dashboard.",
    },
    {
      title: "Step 5: Collaborate with Peers",
      description:
        "Use the chat feature to discuss with classmates and join study groups.",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🎬 Platform Tour</h1>
          <p style={styles.subtitle}>Learn how to make the most of StudyUp</p>
        </div>

        <div style={styles.videoSection}>
          <h2 style={{ marginTop: 0, color: "#2c3e50" }}>Introduction Video</h2>
          <div style={styles.videoContainer}>
            <video
              style={styles.video}
              controls
              poster="https://via.placeholder.com/1280x720?text=StudyUp+Platform+Tour"
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <p
            style={{
              marginTop: "15px",
              color: "#7f8c8d",
              fontSize: "14px",
            }}
          >
            Watch this 5-minute tour to get familiar with all StudyUp features.
          </p>
        </div>

        <h2 style={styles.sectionTitle}>Key Features</h2>
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.featureCardHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, {
                  transform: "translateY(0)",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                });
              }}
            >
              <div style={styles.featureIcon}>{feature.icon}</div>
              <div style={styles.featureTitle}>{feature.title}</div>
              <div style={styles.featureDescription}>{feature.description}</div>
            </div>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Getting Started Guide</h2>
        <div style={styles.tourSteps}>
          {tourSteps.map((step, index) => (
            <div key={index} style={styles.stepCard}>
              <div style={styles.stepNumber}>{index + 1}</div>
              <div style={styles.stepContent}>
                <div style={styles.stepTitle}>{step.title}</div>
                <div style={styles.stepDescription}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "50px",
            padding: "30px",
            backgroundColor:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "12px",
            color: "white",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>Ready to get started?</h3>
          <p style={{ margin: 0 }}>
            Create your first course and start organizing your study life today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoTour;

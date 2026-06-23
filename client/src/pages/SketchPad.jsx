import React, { useRef, useEffect, useState } from "react";

const SketchPad = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#2c3e50");
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    setHistory([canvas.toDataURL()]);
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const newHistory = [...history, canvas.toDataURL()];
      setHistory(newHistory);
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([canvas.toDataURL()]);
  };

  const undo = () => {
    if (history.length > 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const newHistory = history.slice(0, -1);
      const previousImage = new Image();
      previousImage.src = newHistory[newHistory.length - 1];
      previousImage.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(previousImage, 0, 0);
      };
      setHistory(newHistory);
    }
  };

  const downloadSketch = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
  };

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
      marginBottom: "30px",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
    },
    title: {
      fontSize: "32px",
      fontWeight: "bold",
      color: "#2c3e50",
      margin: "0 0 10px 0",
    },
    subtitle: {
      fontSize: "16px",
      color: "#7f8c8d",
      margin: 0,
    },
    controlsBar: {
      backgroundColor: "white",
      padding: "20px 25px",
      borderRadius: "12px 12px 0 0",
      display: "flex",
      gap: "20px",
      alignItems: "center",
      flexWrap: "wrap",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      borderBottom: "1px solid #ecf0f1",
    },
    controlGroup: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    label: {
      fontSize: "14px",
      fontWeight: "bold",
      color: "#2c3e50",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    colorPicker: {
      width: "50px",
      height: "40px",
      border: "2px solid #ecf0f1",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    sizeSlider: {
      width: "150px",
      cursor: "pointer",
      accentColor: "#3498db",
    },
    sizeValue: {
      fontSize: "14px",
      color: "#2c3e50",
      fontWeight: "bold",
      minWidth: "30px",
    },
    button: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "bold",
      transition: "all 0.3s ease",
      textShadow: "0.5px 0.5px 1px rgba(0, 0, 0, 0.2)",
    },
    buttonPrimary: {
      backgroundColor: "#3498db",
      color: "white",
    },
    buttonDanger: {
      backgroundColor: "#e74c3c",
      color: "white",
    },
    buttonSuccess: {
      backgroundColor: "#2ecc71",
      color: "white",
    },
    buttonSecondary: {
      backgroundColor: "#95a5a6",
      color: "white",
    },
    canvasContainer: {
      backgroundColor: "white",
      borderRadius: "0 0 12px 12px",
      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    canvas: {
      display: "block",
      width: "100%",
      height: "500px",
      cursor: "crosshair",
      backgroundColor: "white",
    },
    footer: {
      marginTop: "20px",
      padding: "15px 20px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      fontSize: "14px",
      color: "#7f8c8d",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>🖊️ Sketch Pad</h1>
          <p style={styles.subtitle}>
            Draw, sketch, and annotate with the canvas tool
          </p>
        </div>

        <div style={styles.controlsBar}>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Brush Color</label>
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              style={styles.colorPicker}
              title="Choose brush color"
            />
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Brush Size</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              style={styles.sizeSlider}
              title="Adjust brush size"
            />
            <span style={styles.sizeValue}>{brushSize}px</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
            <button
              onClick={undo}
              style={{
                ...styles.button,
                ...styles.buttonSecondary,
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.8";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "scale(1)";
              }}
              title="Undo last stroke"
            >
              ↶ Undo
            </button>
            <button
              onClick={clearCanvas}
              style={{
                ...styles.button,
                ...styles.buttonDanger,
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.8";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "scale(1)";
              }}
              title="Clear canvas"
            >
              🗑️ Clear
            </button>
            <button
              onClick={downloadSketch}
              style={{
                ...styles.button,
                ...styles.buttonSuccess,
              }}
              onMouseEnter={(e) => {
                e.target.style.opacity = "0.8";
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.opacity = "1";
                e.target.style.transform = "scale(1)";
              }}
              title="Download sketch as PNG"
            >
              ⬇️ Download
            </button>
          </div>
        </div>

        <div style={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            style={styles.canvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            title="Draw on the canvas"
          />
        </div>

        <div style={styles.footer}>
          <strong>💡 Tips:</strong> Use the color picker to change your brush
          color, adjust the size slider to control brush thickness, and use Undo
          to correct mistakes. Download your sketch to save it as an image file.
        </div>
      </div>
    </div>
  );
};

export default SketchPad;

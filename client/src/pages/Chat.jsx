import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";

const ROOMS = [
  {
    id: "general",
    label: "General",
    description: "Open chat for all students — general questions and study talk",
  },
  {
    id: "announcements",
    label: "Announcements",
    description: "Share important updates, deadlines, and exam reminders",
  },
  {
    id: "study-group",
    label: "Study Group",
    description: "Focused discussion for group projects and homework help",
  },
];

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [roomUsers, setRoomUsers] = useState([]);

  const selectedRoomRef = useRef(selectedRoom);
  const messagesByRoom = useRef({});

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    if (!user) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(apiUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join_room", {
        room: selectedRoomRef.current,
        userId: user.id,
        username: user.name,
      });
    });

    newSocket.on("receive_message", (data) => {
      const room = data.room;
      if (!messagesByRoom.current[room]) messagesByRoom.current[room] = [];
      messagesByRoom.current[room].push(data);
      if (room === selectedRoomRef.current) {
        setMessages([...messagesByRoom.current[room]]);
      }
    });

    newSocket.on("room_users", (users) => {
      const uniqueUsers = [];
      const seenIds = new Set();
      users.forEach((u) => {
        if (!seenIds.has(u.userId)) {
          seenIds.add(u.userId);
          uniqueUsers.push(u);
        }
      });
      setRoomUsers(uniqueUsers);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (socket && socket.connected && user) {
      socket.emit("join_room", {
        room: selectedRoom,
        userId: user.id,
        username: user.name,
      });
      setMessages(messagesByRoom.current[selectedRoom] || []);
    }
  }, [selectedRoom, socket, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && socket && user) {
      socket.emit("send_message", {
        room: selectedRoom,
        userId: user.id,
        username: user.name,
        message: inputValue.trim(),
      });
      setInputValue("");
    }
  };

  const activeRoom = ROOMS.find((r) => r.id === selectedRoom);
  const isOwnMessage = (msg) => String(msg.userId) === String(user?.id);

  const styles = {
    container: {
      display: "flex",
      height: "calc(100vh - 80px)",
      backgroundColor: "#f5f7fa",
    },
    sidebar: {
      width: "260px",
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "20px",
      overflowY: "auto",
    },
    roomItem: {
      padding: "12px 16px",
      marginBottom: "8px",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    roomItemActive: {
      backgroundColor: "#3498db",
    },
    roomDesc: {
      fontSize: "11px",
      opacity: 0.75,
      marginTop: "4px",
      lineHeight: 1.4,
    },
    mainChat: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      backgroundColor: "white",
    },
    header: {
      padding: "20px 30px",
      borderBottom: "2px solid #ecf0f1",
      backgroundColor: "#34495e",
      color: "white",
    },
    messagesContainer: {
      flex: 1,
      overflowY: "auto",
      padding: "20px 30px",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    messageContent: {
      maxWidth: "60%",
      backgroundColor: "#ecf0f1",
      padding: "12px 16px",
      borderRadius: "12px",
      wordWrap: "break-word",
    },
    messageOwnContent: { backgroundColor: "#3498db", color: "white" },
    inputArea: {
      padding: "20px 30px",
      borderTop: "2px solid #ecf0f1",
      display: "flex",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "12px 16px",
      border: "2px solid #ecf0f1",
      borderRadius: "8px",
      fontSize: "14px",
    },
    button: {
      padding: "12px 24px",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    userItem: {
      padding: "8px 12px",
      fontSize: "14px",
      borderRadius: "6px",
      marginBottom: "6px",
      backgroundColor: "rgba(46, 204, 113, 0.2)",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h3 style={{ marginTop: 0 }}>Chat Rooms</h3>
        <ul style={{ listStyle: "none", padding: 0, marginBottom: "24px" }}>
          {ROOMS.map((room) => (
            <li
              key={room.id}
              style={{
                ...styles.roomItem,
                ...(selectedRoom === room.id ? styles.roomItemActive : {}),
              }}
              onClick={() => setSelectedRoom(room.id)}
            >
              <strong>{room.label}</strong>
              <div style={styles.roomDesc}>{room.description}</div>
            </li>
          ))}
        </ul>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "10px", opacity: 0.8 }}>
            ONLINE IN THIS ROOM ({roomUsers.length})
          </div>
          {roomUsers.map((u) => (
            <div key={u.userId} style={styles.userItem}>
              ● {u.username}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.mainChat}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>{activeRoom?.label}</h2>
          <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.9 }}>
            {activeRoom?.description}
          </p>
        </div>

        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <p style={{ textAlign: "center", color: "#95a5a6", padding: "40px" }}>
              No messages in this room yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: isOwnMessage(msg) ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.messageContent,
                    ...(isOwnMessage(msg) ? styles.messageOwnContent : {}),
                  }}
                >
                  {!isOwnMessage(msg) && (
                    <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "6px" }}>
                      {msg.username}
                    </div>
                  )}
                  <div>{msg.message}</div>
                  <div style={{ fontSize: "11px", marginTop: "6px", opacity: 0.7 }}>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString()
                      : ""}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} style={styles.inputArea}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message #${activeRoom?.label}...`}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;

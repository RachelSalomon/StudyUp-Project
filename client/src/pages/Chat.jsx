import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import io from "socket.io-client";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [roomUsers, setRoomUsers] = useState([]);
  const [rooms] = useState(["general", "announcements", "study-group"]);

  // Use a ref to always store the absolute latest selectedRoom value without triggering re-subscriptions
  const selectedRoomRef = useRef(selectedRoom);
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // Handle single stable socket connection lifecycle
  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      newSocket.emit("join_room", {
        room: selectedRoomRef.current,
        userId: user.id,
        username: user.name,
      });
    });

    // Listener attached exactly once. Uses ref to check current active room without closures duplication
    newSocket.on("receive_message", (data) => {
      if (data.room === selectedRoomRef.current) {
        setMessages((prev) => [...prev, data]);
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
      console.log("Disconnected from chat server");
    };
  }, [user]);

  // Handle clean room switching transitions without duplication
  useEffect(() => {
    if (socket && socket.connected && user) {
      socket.emit("join_room", {
        room: selectedRoom,
        userId: user.id,
        username: user.name,
      });
    }
  }, [selectedRoom, socket, user]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() && socket && user) {
      socket.emit("send_message", {
        room: selectedRoom,
        userId: user.id,
        username: user.name,
        message: inputValue,
      });
      setInputValue("");
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "calc(100vh - 80px)",
      backgroundColor: "#f5f7fa",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#2c3e50",
      color: "white",
      padding: "20px",
      overflowY: "auto",
      boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    },
    roomsList: { listStyle: "none", padding: 0, marginBottom: "30px" },
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
      boxShadow: "0 2px 8px rgba(52, 152, 219, 0.3)",
    },
    usersList: {
      borderTop: "1px solid rgba(255, 255, 255, 0.2)",
      paddingTop: "20px",
    },
    usersTitle: {
      fontSize: "12px",
      fontWeight: "bold",
      textTransform: "uppercase",
      marginBottom: "12px",
      opacity: 0.8,
    },
    userItem: {
      padding: "8px 12px",
      fontSize: "14px",
      borderRadius: "6px",
      marginBottom: "6px",
      backgroundColor: "rgba(46, 204, 113, 0.2)",
      border: "1px solid rgba(46, 204, 113, 0.5)",
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
    message: {
      display: "flex",
      marginBottom: "10px",
      animation: "slideIn 0.3s ease",
    },
    messageContent: {
      maxWidth: "60%",
      backgroundColor: "#ecf0f1",
      padding: "12px 16px",
      borderRadius: "12px",
      wordWrap: "break-word",
    },
    messageOwn: { justifyContent: "flex-end" },
    messageOwnContent: { backgroundColor: "#3498db", color: "white" },
    messageAuthor: {
      fontSize: "12px",
      fontWeight: "bold",
      marginBottom: "6px",
      color: "#34495e",
    },
    messageTime: { fontSize: "11px", marginTop: "6px", opacity: 0.7 },
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
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.sidebar}>
        <h3 style={{ marginTop: 0 }}>Rooms</h3>
        <ul style={styles.roomsList}>
          {rooms.map((room) => (
            <li
              key={room}
              style={{
                ...styles.roomItem,
                ...(selectedRoom === room ? styles.roomItemActive : {}),
              }}
              onClick={() => {
                setSelectedRoom(room);
                setMessages([]); // Instantly flush view array on navigation click
              }}
            >
              # {room}
            </li>
          ))}
        </ul>

        <div style={styles.usersList}>
          <div style={styles.usersTitle}>Online Users ({roomUsers.length})</div>
          {roomUsers.map((u) => (
            <div key={u.userId} style={styles.userItem}>
              ● {u.username}
            </div>
          ))}
        </div>
      </div>

      <div style={styles.mainChat}>
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>#{selectedRoom}</h2>
          <p style={{ margin: "8px 0 0 0", fontSize: "14px", opacity: 0.9 }}>
            {roomUsers.length} user{roomUsers.length !== 1 ? "s" : ""} online
          </p>
        </div>

        <div style={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#95a5a6", padding: "40px" }}
            >
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.message,
                  ...(msg.userId === user?.id ? styles.messageOwn : {}),
                }}
              >
                <div
                  style={{
                    ...styles.messageContent,
                    ...(msg.userId === user?.id
                      ? styles.messageOwnContent
                      : {}),
                  }}
                >
                  {msg.userId !== user?.id && (
                    <div style={styles.messageAuthor}>{msg.username}</div>
                  )}
                  <div>{msg.message}</div>
                  <div style={styles.messageTime}>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString()
                      : new Date().toLocaleTimeString()}
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
            placeholder="Type a message..."
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

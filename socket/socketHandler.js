const jwt = require("jsonwebtoken");

const onlineUsers = new Map();

const socketHandler = (io) => {
    io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        // Authenticate socket
        socket.on("authenticate", (token) => {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded._id;

                if (onlineUsers.has(userId)) {
                    onlineUsers.get(userId).add(socket.id);
                } else {
                    onlineUsers.set(userId, new Set([socket.id]));
                }

                socket.userId = userId;
                socket.join(userId);

                console.log(`✅ Socket authenticated: ${userId}, socketId: ${socket.id}`);
            } catch (err) {
                console.log("❌ Invalid token for socket:", err.message);
            }
        });

        socket.on("sendNotification", ({ receiverId, type, data }) => {
            io.to(receiverId).emit("receiveNotification", { type, data });
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
            if (socket.userId) {
                const userSockets = onlineUsers.get(socket.userId);
                if (userSockets) {
                    userSockets.delete(socket.id);
                    if (userSockets.size === 0) {
                        onlineUsers.delete(socket.userId);
                    }
                }
            }
        });
    });
};

module.exports = { socketHandler, onlineUsers };

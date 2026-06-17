import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.jsx";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // 1. Function to get all users for Sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 2. Function to get messages for selected User
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 3. Function to send message to selected User
  const sendMessages = async (messagesData) => {
    try {
      if (!selectedUser?._id) {
        return toast.error("No user selected to send message");
      }

      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messagesData,
      );

      if (data.success) {
        const newMsg = data.message || data.messages;
        if (newMsg) {
          setMessages((prevMessages) => [...prevMessages, newMsg]);
        } else {
          getMessages(selectedUser._id);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 4. Clear unseen messages when chat opens (Hitting the exact backend route)
  useEffect(() => {
    if (!selectedUser?._id) return;

    const clearUnseenOnBackend = async () => {
      try {
        setUnseenMessages((prevUnseen) => ({
          ...prevUnseen,
          [selectedUser._id]: 0,
        }));

        // Exact matching endpoint with backend router
        await axios
          .put(`/api/messages/mark/${selectedUser._id}`)
          .catch(() => {});
      } catch (error) {
        console.error(error);
      }
    };

    clearUnseenOnBackend();
  }, [selectedUser, axios]);

  // 5. Socket listener for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      setSelectedUser((currentSelectedUser) => {
        if (
          currentSelectedUser &&
          newMessage.senderId === currentSelectedUser._id
        ) {
          newMessage.seen = true;
          setMessages((prevMessages) => [...prevMessages, newMessage]);

          // Exact matching endpoint with backend router
          axios.put(`/api/messages/mark/${newMessage._id}`).catch(() => {});
        } else {
          setUnseenMessages((prevUnseen) => ({
            ...prevUnseen,
            [newMessage.senderId]: (prevUnseen[newMessage.senderId] || 0) + 1,
          }));
        }
        return currentSelectedUser;
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, axios]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    setMessages,
    sendMessages,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

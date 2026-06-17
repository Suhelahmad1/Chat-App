import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// 1. Get all users except the Logged in user with unseen message counts
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    );
    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (count > 0) {
        unseenMessages[user._id] = count;
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// 2. Get all the messages for the selected user
export const getMessage = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    // Automatically clear when chat opens
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { $set: { seen: true } },
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Error in getMessage controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// 3. FIXED FOR SPOT 1: Mark whole chat/user messages as seen (Takes Sender User ID)
export const markChatAsSeen = async (req, res) => {
  try {
    const { id: senderId } = req.params; // Saamne wale user ki ID
    const myId = req.user._id; // Logged in user ki ID

    await Message.updateMany(
      { senderId: senderId, receiverId: myId, seen: false },
      { $set: { seen: true } },
    );

    res.json({ success: true, message: "All messages marked as seen" });
  } catch (error) {
    console.error("Error in markChatAsSeen:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// 4. FIXED FOR SPOT 2: Mark single message as seen using Message ID
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const updatedMessage = await Message.findOneAndUpdate(
      { _id: messageId, seen: false },
      { $set: { seen: true } },
      { new: true },
    );

    if (!updatedMessage) {
      const existingMessage = await Message.findById(messageId);
      return res.json({ success: true, message: existingMessage });
    }

    res.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("Error in markMessageAsSeen controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

// 5. Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const recieverSocketId = userSocketMap[receiverId];
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.json({ success: false, message: "Internal Server Error" });
  }
};

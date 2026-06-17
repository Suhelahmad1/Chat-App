import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { ChatContext } from "../../context/ChatContext.jsx";
import assets from "../assets/assets.js";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const filteredUsers = input.trim()
    ? users.filter((user) =>
        user.fullName?.toLowerCase().includes(input.toLowerCase()),
      )
    : users;

  //  Trigger data fetch only on initial component mount to avoid rapid API calls
  useEffect(() => {
    getUsers();
  }, []);

  // Handler to clear unseen count when selecting a user
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    // Optional: Reset chat badges instantly on the UI for smooth feel
    if (unseenMessages[user._id]) {
      setUnseenMessages((prev) => ({
        ...prev,
        [user._id]: 0,
      }));
    }
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-5">
        {/* Logo and Menu Section */}
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-40" />
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer text-sm hover:text-violet-400 transition-colors"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-t border-gray-500" />
              <p
                onClick={() => logout()}
                className="cursor-pointer text-sm hover:text-red-400 transition-colors"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="bg-[#282124] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img src={assets.search_icon} alt="search" className="w-3" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>

        {/* User List Section */}
        <div className="flex flex-col mt-5 gap-1">
          {filteredUsers && filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <div
                onClick={() => handleUserSelect(user)}
                key={user._id || index}
                className={`relative flex items-center gap-3 p-2 pl-4 rounded cursor-pointer max-sm:text-sm transition-all ${
                  selectedUser?._id === user._id
                    ? "bg-[#282124]/70 border-l-4 border-violet-500"
                    : "hover:bg-[#282124]/30"
                }`}
              >
                {/* Avatar wrapper for Online Ring indication */}
                <div className="relative">
                  <img
                    src={user?.profilePic || assets.avatar_icon}
                    alt=""
                    className={`w-9 h-9 object-cover rounded-full border ${
                      onlineUsers?.includes(user._id)
                        ? "border-green-400"
                        : "border-gray-500"
                    }`}
                  />
                  {onlineUsers?.includes(user._id) && (
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-[#1e1b2e]" />
                  )}
                </div>

                <div className="flex flex-col leading-4">
                  <p className="font-medium text-sm text-gray-200">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {onlineUsers?.includes(user._id) ? "online" : "offline"}
                  </p>
                </div>

                {/* Badge Notification Counter */}
                {unseenMessages && unseenMessages[user._id] > 0 && (
                  <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center font-bold rounded-full bg-violet-600 text-white animate-pulse">
                    {unseenMessages[user._id]}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400 text-center mt-4">
              No users found
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

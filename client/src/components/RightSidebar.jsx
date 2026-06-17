import React, { useContext, useEffect, useState } from "react";
import assets, { imagesDummyData } from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  // FIXED: Added dependency array [messages] to prevent infinite re-renders
  useEffect(() => {
    if (messages) {
      setMsgImages(messages.filter((msg) => msg.image).map((msg) => msg.image));
    }
  }, [messages]);

  return (
    selectedUser && (
      <div className="bg-[#8185B2]/10 text-white w-full h-full flex flex-col justify-between pb-5 overflow-y-auto border-l border-stone-500/30 max-md:hidden">
        {/* Top Content Wrapper */}
        <div className="overflow-y-auto chat-no-scrollbar">
          <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
            <img
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt=""
              className="w-20 aspect-square rounded-full object-cover"
            />

            <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2 text-center">
              {onlineUsers && onlineUsers.includes(selectedUser._id) && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span>
              )}
              <span className="truncate max-w-37.5">
                {selectedUser.fullName}
              </span>
            </h1>
            <p className="px-10 mx-auto text-center text-gray-400 wrap-break-word w-full">
              {selectedUser.bio || "No bio available"}
            </p>
          </div>

          <hr className="border-[#ffffff20] my-6 mx-5" />

          <div className="px-5 text-xs">
            <p className="mb-3 font-medium text-gray-300">Shared Media</p>

            {/* Grid structure to neatly display images */}
            {msgImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 opacity-90 pb-5">
                {msgImages.map((url, index) => (
                  <div
                    key={index}
                    onClick={() => window.open(url)}
                    className="cursor-pointer rounded-md overflow-hidden aspect-video bg-neutral-800 border border-white/5"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No media shared yet
              </p>
            )}
          </div>
        </div>

        {/* Bottom Area - Logout Button */}
        <div className="px-5 w-full mt-auto pt-4">
          <button
            onClick={() => logout()}
            className="w-full bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-medium py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all shadow-md"
          >
            Logout
          </button>
        </div>
      </div>
    )
  );
};

export default RightSidebar;

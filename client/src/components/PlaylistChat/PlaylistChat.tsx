import { useEffect, useState, useRef } from "react";
import Button from "../Button/Button";
import chatIcon from "../../assets/comment-solid.svg";
import sendIcon from "../../assets/paper-plane-solid.svg";
import closeIcon from "../../assets/xmark-solid.svg";
import { socket } from "../../utils/socket";

interface ChatMessage {
    id: number;
    playlistId: number;
    userId: number | null;
    user: {
        username: string;
        avatar: string;
    };
    message: string;
    sentAt: Date;
    isSystemMessage: boolean;
}

function PlaylistChat({ playlistId }: { playlistId: number }) {
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsChatOpen(!isChatOpen);

    const formatTimestamp = (timestamp: Date) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const fetchMessages = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://jockey-website.onrender.com/api/v1/playlists/chat/fetch-messages/${playlistId}`,
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to fetch messages.");
            }

            setMessages(data?.data?.messages || []);
            scrollToBottom();
        } catch (error: any) {
            console.error(error?.message);
            setError(error?.message || "Failed to fetch messages.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        setError("");

        try {
            const response = await fetch(
                "https://jockey-website.onrender.com/api/v1/playlists/chat/send-message",
                {
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify({ playlistId, message: newMessage }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Failed to send message.");
            }

            setNewMessage("");
            scrollToBottom();
        } catch (error: any) {
            console.error(error?.message || "failed to send message.");
            setError(error?.message || "Failed to send message.");
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    useEffect(() => {
        if (isChatOpen) {
            fetchMessages();
        }
    }, [isChatOpen]);

    useEffect(() => {
        const handleNewMessage = (newMessage: ChatMessage) => {
            setMessages((prev) => {
                if (prev.some((msg) => msg.id === newMessage.id)) {
                    return prev;
                }
                return [...prev, newMessage];
            });
            scrollToBottom();
        };

        socket.on("receive_message", handleNewMessage);

        return () => {
            socket.off("receive_message", handleNewMessage);
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0 && isChatOpen) {
            scrollToBottom();
        }
    }, [messages, isChatOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end poppins-regular">
            {/* Chat button */}
            <Button
                type="button"
                icon={chatIcon}
                onClick={toggleChat}
                styling={`${
                    isChatOpen ? "hidden" : ""
                } rounded-full flex items-center justify-center w-14 h-14 bg-[#003566] hover:cursor-pointer hover:bg-[#002b50] text-white shadow-lg`}
            />

            {/* Chat Panel */}
            <div
                className={`mt-4 bg-white rounded-lg shadow-lg transition-all duration-300 overflow-hidden flex flex-col ${
                    isChatOpen
                        ? "opacity-100 max-h-[500px] w-[350px]"
                        : "opacity-0 max-h-0 w-0"
                }`}
            >
                <div className="bg-[#003566] text-white p-3 flex justify-between items-center">
                    <h3 className="text-lg poppins-bold">Playlist chat</h3>
                    <Button
                        type="button"
                        icon={closeIcon}
                        styling="p-1 hover:bg-[#002b50] rounded-full hover:cursor-pointer"
                        onClick={() => setIsChatOpen(false)}
                    />
                </div>

                {/* Messages */}
                <div className="flex-grow p-3 overflow-y-auto max-h-[350px] bg-gray-50">
                    {isLoading && messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">Loading messages...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 text-red-500 p-2 rounded">
                            {error}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">
                                No messages yet. Start the conversation!
                            </p>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                className="flex items-start gap-2 mb-3"
                                key={message.id}
                            >
                                <div className="bg-[#ffc300] text-[#003566] poppins-bold rounded-full w-8 h-8 flex items-center justify-center">
                                    {message.user.username
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex justify-between items-baseline">
                                        <span className="poppins-semibold text-[#003566]">
                                            {message.user?.username ||
                                                "Anonymous"}
                                        </span>
                                        <span className="text-xs     text-gray-500">
                                            {formatTimestamp(message.sentAt)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 mt-1">
                                        {message.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messageEndRef}></div>
                </div>

                {/* Input area */}
                <div className="p-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(event) =>
                                setNewMessage(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === "Enter") sendMessage();
                            }}
                            disabled={isLoading}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-[#003566]"
                        />

                        <Button
                            type="button"
                            icon={sendIcon}
                            disabled={isLoading || !newMessage.trim()}
                            onClick={sendMessage}
                            styling={`rounded-full flex items-center justify-center w-10 h-10 ${
                                newMessage.trim()
                                    ? "bg-[#ffc300] hover:bg-[#aa8304] hover:cursor-pointer"
                                    : "bg-gray-300 cursor-not-allowed"
                            }`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlaylistChat;

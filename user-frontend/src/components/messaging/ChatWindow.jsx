import { useEffect, useState } from "react";
import { getMessages, sendMessage } from "../../services/messageService";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = ({ courseId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await getMessages(courseId);
      setMessages(data);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // polling every 10s
    return () => clearInterval(interval);
  }, [courseId]);

  const handleSend = async (content) => {
    await sendMessage({ courseId, content });
    const updated = await getMessages(courseId);
    setMessages(updated);
  };

  return (
    <div className="border rounded p-4">
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
};

export default ChatWindow;

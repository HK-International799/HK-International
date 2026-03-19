import { useState } from "react";

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        className="border p-2 flex-1"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Send
      </button>
    </form>
  );
};

export default MessageInput;

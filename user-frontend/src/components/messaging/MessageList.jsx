const MessageList = ({ messages }) => (
  <div className="h-64 overflow-y-auto border-b mb-2">
    {messages.map((m) => (
      <div key={m._id} className="p-2">
        <strong>{m.senderId.name}:</strong> {m.content}
      </div>
    ))}
  </div>
);

export default MessageList;

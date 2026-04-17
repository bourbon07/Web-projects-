// resources/js/pages/Chat.jsx
import { useEffect, useState } from 'react';
import MessageInput from '../components/MessageInput';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const receiverId = window.RECEIVER_ID; // passed from Blade

  const sendMessage = async (text) => {
    const response = await fetch('/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': document
          .querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        to_user_id: receiverId,
        message: text
      })
    });

    const savedMessage = await response.json();

    setMessages((prev) => [...prev, savedMessage]);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            {m.message}
          </div>
        ))}
      </div>

      <MessageInput onSendMessage={sendMessage} />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

const Chatroom: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const ws = useRef<WebSocket | null>(null); // Use useRef to hold the WebSocket instance

  useEffect(() => {
    // Establish WebSocket connection
    ws.current = new WebSocket('ws://192.168.1.50:8787/connect');

    ws.current.onmessage = (event: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.current.onopen = () => console.log('Connected to WebSocket');
    ws.current.onclose = () => console.log('WebSocket disconnected');

    return () => {
      ws.current?.close(); // Clean up the WebSocket on unmount
    };
  }, []);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && input.trim()) {
      const messageObject = { message: input };
      ws.current.send(JSON.stringify(messageObject));
      setInput('');
    }
  };

  return (
    <div>
      <h1>Chatroom</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatroom;

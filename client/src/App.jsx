import React, { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './components/LandingPage';
import ChatPage from './components/ChatPage';

function App() {
  const [inChat, setInChat] = useState(false);
  return (
    <SocketProvider>
      <main className="font-sans antialiased text-white bg-background">
        {inChat ? (
          <ChatPage />
        ) : (
          <LandingPage onStart={() => setInChat(true)} />
        )}
      </main>
    </SocketProvider>
  );
}

export default App;

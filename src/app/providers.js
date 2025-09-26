// src/app/providers.js
'use client';
import { SessionProvider } from "next-auth/react";
import { Toaster } from 'react-hot-toast';

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </SessionProvider>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryProvider } from './providers'
import { SocketProvider } from './context/SocketContext'
import './globals.css'

export const metadata = {
  title: 'Chat App',
  description: 'Real-time chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
'use client'

import './global.css'
import AppWalletProvider from '@/components/wallet-provider'
import { ReactQueryProvider } from '@/app/react-query-provider'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { Provider } from 'react-redux'
import { store } from '@/store'
import Navbar from '@/components/navbar'

const metadata = {
  title: 'votana',
  description: 'Decentralized voting platform built on solana',
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
          <Provider store={store}>
            <AppWalletProvider>
              <Navbar />
              <main>{children}</main>
              <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </AppWalletProvider>
          </Provider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

import React from 'react'
import AppHeader from './_components/AppHeader';

function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <div className="min-h-screen">
      <AppHeader/>
      <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 sm:py-10'>
        {children}
      </div>
      
    </div>
  )
}

export default DashboardLayout

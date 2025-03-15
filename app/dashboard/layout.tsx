import { Metadata } from 'next';
import React, { Suspense } from "react";

export default function dashboardLayout({ children }: { children: React.ReactNode }) {
    return (
      
        
        
        <div className="mx-auto flex max-w flex-col gap-8 px-4 pb-4 text-black  md:flex-row dark:text-white">
          {/* Main Content */}
          <div className="order-last min-h-screen w-full md:order-none">
            {children}
          </div>
        </div>
        
       
    );
  }
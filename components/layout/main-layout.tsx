"use client"
import Link from "next/link";
import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";
import {
    BarChart3,
    Bell,
    Calendar,
    Cog,
    LayoutDashboard,
    LogOut,
    Map,
    PlayCircle,
    Settings,
    Truck,
    TruckIcon,
    User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation";

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({children}: MainLayoutProps) {
  const pathname = usePathname();
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Pedidos", href: "/pedidos", icon: Calendar },
    { name: "Camiones", href: "/camiones", icon: Truck },
    { name: "Mapa en tiempo real", href: "/mapa", icon: Map },
    { name: "Simulaciones", href: "/simulaciones", icon: PlayCircle },
    { name: "Reportes", href: "/reportes", icon: BarChart3 },
  ]
  
 

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="bg-slate-800 border-r-0">
          <SidebarHeader className="flex h-16 items-center px-6 bg-slate-800 border-b border-slate-700">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0 shadow-sm p-0">
                <Image src="/truck svg.svg" alt="Logo PLG" width={28} height={28} className="object-contain" />
              </div>
              <span className="text-lg font-semibold">PLG Software</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="bg-slate-800 px-3 py-4">
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.name}
                      className={cn(
                        "w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-300 hover:bg-slate-700 hover:text-white",
                        isActive && "bg-blue-600 text-white hover:bg-blue-600"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-hidden w-full">
          {
           pathname !== "/mapa" ? ( 
            <>
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
              </div>
            </header>
          <main className="flex-1 overflow-auto p-6 w-full relative">
            {children}
          </main> 
          </>
          )
          :(children)
          }
        </div>
      </div>
    </SidebarProvider>
  )
}

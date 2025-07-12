"use client"
import Link from "next/link";
import { ReactNode } from "react";
import {
    BarChart3,
    Calendar,
    Fuel,
    LayoutDashboard,
    Map,
    PlayCircle,
    Truck,
    Zap,
} from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation";

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({children}: MainLayoutProps) {
  const pathname = usePathname();
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    //{ name: "Pedidos", href: "/pedidos", icon: Calendar },
    //{ name: "Camiones", href: "/camiones", icon: Truck },
    { name: "Mapa en tiempo real", href: "/mapa", icon: Map },
    { name: "Simulaciones", href: "/simulaciones", icon: PlayCircle },
    //{ name: "Reportes", href: "/reportes", icon: BarChart3 },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="bg-white border-r border-gray-200">
        <SidebarHeader className="h-16 px-6 flex items-center justify-center border-b border-gray-200 bg-white">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-900 hover:text-gray-900">
            <Fuel className="h-7 w-7 " />
            <span className="text-xl font-bold tracking-tight leading-tight">
              GLP Logistics
            </span>
          </Link>
        </SidebarHeader>

          <SidebarContent className="bg-white px-3 py-4">
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
                        "w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
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

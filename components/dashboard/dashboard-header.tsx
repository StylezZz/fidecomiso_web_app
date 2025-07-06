"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, User } from "lucide-react"

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between w-full mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Sistema Activo
        </Badge>
        
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span>Operario Logístico</span>
        </div>
      </div>
    </div>
  )
}

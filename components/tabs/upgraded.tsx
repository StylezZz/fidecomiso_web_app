import { Package, Truck } from "lucide-react";
import React from "react";

interface Tab {
  id: string;
  label: string;
  icon: React.ElementType;
  count?: number;
  color: string;
  activeColor: string;
}

interface BeautifulTabsProps {
  selectedTab: string;
  onTabChange: (value: string) => void;
  vehicleCount?: number;
  orderCount?: number;
}

export const BeautifulTabs: React.FC<BeautifulTabsProps> = ({ selectedTab, onTabChange }) => {
  const tabs: Tab[] = [
    {
      id: "camiones",
      label: "Camiones",
      icon: Truck,
      color: "text-blue-600",
      activeColor: "bg-blue-500",
    },
    {
      id: "pedidos",
      label: "Pedidos",
      icon: Package,
      color: "text-orange-600",
      activeColor: "bg-orange-500",
    },
  ];

  return (
    <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-blue-50">
      <div className="relative">
        {/* Tabs Container */}
        <div className="flex space-x-1 bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative flex items-center justify-center gap-2 px-4 py-2.5 
                  rounded-lg text-sm font-medium transition-all duration-300 ease-out
                  min-w-0 flex-1
                  ${
                    isActive
                      ? `${tab.activeColor} text-white shadow-md transform scale-[1.02]`
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                  }
                `}
              >
                {/* Icon with animation */}
                <Icon
                  size={16}
                  className={`
                    transition-transform duration-300
                    ${isActive ? "scale-110" : "group-hover:scale-105"}
                  `}
                />

                {/* Label */}
                <span className="font-semibold truncate">{tab.label}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Subtle glow effect for active tab */}
        <div className="absolute inset-0 pointer-events-none">
          {tabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            if (!isActive) return null;

            return (
              <div
                key={`glow-${tab.id}`}
                className={`
                  absolute rounded-xl opacity-20 blur-md transition-all duration-500
                  ${tab.activeColor}
                `}
                style={{
                  left: `${(tabs.findIndex((t) => t.id === tab.id) / tabs.length) * 100}%`,
                  width: `${100 / tabs.length}%`,
                  height: "100%",
                  transform: "scale(0.9)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Optional: Status indicators */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>En línea</span>
          </div>
          <div className="text-gray-400">|</div>
          <span>Última actualización: hace 2s</span>
        </div>
      </div>
    </div>
  );
};

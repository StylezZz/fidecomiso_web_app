"use client"
import { MainLayout } from "@/components/layout/main-layout";
import dynamic from "next/dynamic";
import { MapProvider } from "@/contexts/MapContext";
import { MapHeader } from "@/components/map/MapHeader";
import { MapTable } from "@/components/map/MapTable";
import { useState, useRef } from "react";

const MapCanvas = dynamic(() => import("@/components/map/MapCanvas"), {
    ssr: false,
    loading: () => (
        <div className="flex h-96 items-center justify-center text-muted-foreground text-lg">
        No se han cargado pedidos...
        </div>
    ),
})

const MapView = () => { 
    const [openSide, setOpenSide] = useState<boolean>(true);
    const mapCanvasRef = useRef<{ fitToScreen: () => void }>(null);

    const handleFitToScreen = () => {
        mapCanvasRef.current?.fitToScreen();
    };

    return(
        <div className="h-screen w-full flex flex-col">
            <MapHeader setOpenSide={setOpenSide} onFitToScreen={handleFitToScreen} />
            <MapCanvas open={openSide} ref={mapCanvasRef} />
        </div>
    )
}
export default MapView;
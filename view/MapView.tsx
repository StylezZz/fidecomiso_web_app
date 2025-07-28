"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { MapHeader } from "@/components/map/header";
import { MainLayout } from "@/components/layout/main";

const MapCanvas = dynamic(() => import("@/components/map/view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center text-muted-foreground text-lg">
      No se han cargado pedidos...
    </div>
  ),
});

const MapView = () => {
  const [openSide, setOpenSide] = useState<boolean>(true);
  const mapCanvasRef = useRef<{ fitToScreen: () => void }>(null);

  const handleFitToScreen = () => {
    mapCanvasRef.current?.fitToScreen();
  };

  return (
    <MainLayout>
      <div className="h-screen w-full flex flex-col">
        <MapHeader setOpenSide={setOpenSide} onFitToScreen={handleFitToScreen} />
        <MapCanvas open={openSide} ref={mapCanvasRef} />
      </div>
    </MainLayout>
  );
};
export default MapView;

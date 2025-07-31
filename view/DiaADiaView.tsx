"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { DiaADiaHeader } from "@/components/dia-a-dia/header";
import { MainLayout } from "@/components/layout/main";

const DiaADiaCanvas = dynamic(() => import("@/components/dia-a-dia/view"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center text-muted-foreground text-lg">
      Cargando operación día a día...
    </div>
  ),
});

const DiaADiaView = () => {
  const [openSide, setOpenSide] = useState<boolean>(true);
  const mapCanvasRef = useRef<{ fitToScreen: () => void }>(null);

  const handleFitToScreen = () => {
    mapCanvasRef.current?.fitToScreen();
  };

  return (
    <MainLayout>
      <div className="h-screen w-full flex flex-col">
        <DiaADiaHeader setOpenSide={setOpenSide} onFitToScreen={handleFitToScreen} />
        <DiaADiaCanvas open={openSide} ref={mapCanvasRef} />
      </div>
    </MainLayout>
  );
};

export default DiaADiaView;

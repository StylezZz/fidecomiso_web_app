import { X } from "lucide-react"
import React, { Dispatch, SetStateAction } from "react"
import { HomeSVG, PedidoSVG, TruckSVG, WarehouseSVG } from "./trunck/TruckSVG"
import { useMapContext } from "@/contexts/MapContext"

interface MapLegendProps{
    setShowLegend: Dispatch<SetStateAction<boolean>>,
}


export const MapLegend =({setShowLegend}:MapLegendProps) =>{

    const {legendSummary} = useMapContext()
    const {activosTA,activosTB,activosTC,activosTD,numPedidos} = legendSummary
    return(
        <div className="absolute top-20 right-0 z-30 bg-white rounded-md shadow-md p-3 w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span  className="text-x ml-1 font-medium font-bold">Leyenda</span>
              </div>
              <button
                onClick={() => setShowLegend(false)}
                className="text-gray-500 hover:text-gray-700"
                title="Cerrar leyenda"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <TruckSVG color="#FCFF33"/>
              <span className="text-xs font-bold">Camiones TA</span>
              <span className="text-xs ml-auto">{activosTA}/2</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <TruckSVG color="#33F9FF"/>
              <span className="text-xs font-bold">Camiones TB</span>
              <span className="text-xs ml-auto">{activosTB}/4</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <TruckSVG color="#FFAD3E"/>
              <span className="text-xs font-bold">Camiones TC</span>
              <span className="text-xs ml-auto">{activosTC}/4</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <TruckSVG color="#C4C3C2"/>
              <span className="text-xs font-bold">Camiones TD</span>
              <span className="text-xs ml-auto">{activosTD}/10</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
                <HomeSVG/>
              <span className="text-xs font-bold">Planta principal</span>
              <span className="text-xs ml-auto">1</span>
            </div>
            <div className="flex items-center gap-2">
                <WarehouseSVG/>
              <span className="text-xs font-bold">Abastecimiento</span>
              <span className="text-xs ml-auto">2</span>
            </div>
            <div className="flex items-center gap-2">
                <PedidoSVG/>
              <span className="text-xs font-bold">Pedidos</span>
              <span className="text-xs ml-auto">{numPedidos}</span>
            </div>
          </div>
    )
}

/*
Made by Dalpb
*/
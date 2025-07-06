import { Badge } from "@/components/ui/badge"
import { BadgeCheckIcon } from "lucide-react";
export const badgePediddosHandler = (statePedido: "Pendiente" | "En ruta" | "Entregado") => {
    switch(statePedido){
        case "Pendiente":
            return <Badge variant="secondary" className="bg-red-500 text-white">Pendiente</Badge>
            break;
        case "En ruta":
            return <Badge variant="secondary" className="bg-yellow-500 text-white">En ruta</Badge>
            break;
        case "Entregado":
            return <Badge variant="secondary" className="bg-green-500 text-white"><BadgeCheckIcon/>Entregado</Badge> 
            break;
    }
}
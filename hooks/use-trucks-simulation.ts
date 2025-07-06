import { useMapContext } from "@/contexts/MapContext";
import { Trunk } from "@/interfaces/map/Truck.interface";
const useTrucks =()=>{
    const {trucks,setTrucks}= useMapContext();

    const updateTruck = (id:number,partial: Partial<Trunk>) =>{
        setTrucks(prev => prev.map(truck => truck.id === id ? {...truck,...partial} : truck));
    }   
    

    return{
        updateTruck
    }
}
export default useTrucks;
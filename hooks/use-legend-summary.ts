import { useMapContext } from "@/contexts/ContextMap"

interface legendSummaryHook{
    addActiveTrunck: (type: "TA"| "TB"| "TD"| "TC")=>void,
    addPedidos: ()=>void,
    removeActiveTrunck: (type: "TA"| "TB"| "TD"| "TC")=>void,
    removePedidos: ()=>void,
    pushPedidosPendientes: (pedidoslength:number) =>void,
    reset: ()=>void
}

//alfin hago un hook, amo las buenas practicas,  que bonito , todo ordenado :D
//Este hook se basa en el state del context
const useLengendSummary = () : legendSummaryHook =>{
    const {setLegendSummary}= useMapContext()

    const reset = ()=>{
        setLegendSummary({
            activosTA: 0,
            activosTB: 0,
            activosTC: 0,
            activosTD: 0,
            numPedidos: 0
        })
    }
    
    const addActiveTA =()=>{
        setLegendSummary(prev => {
            return {
                ...prev,
                activosTA: (prev.activosTA ?? 0) + 1
            }
        })
    }
    const removeActiveTA = ()=>{
         setLegendSummary(prev => {
            return {
                ...prev,
                activosTA: prev.activosTA! - 1
            }
        })       
    }

    const addActiveTB = ()=>{
        setLegendSummary(prev => {
            return{
                ...prev,
                activosTB: (prev.activosTB ?? 0)+1
            }
        })
    }
    const removeActiveTB = ()=>{
         setLegendSummary(prev => {
            return {
                ...prev,
                activosTB: prev.activosTB! - 1
            }
        })       
    }
    const addActiveTC = ()=>{
        setLegendSummary(prev =>{
            return{
                ...prev,
                activosTC:(prev.activosTC ?? 0)+1
            }
        })
    }
    const removeActiveTC = ()=>{
         setLegendSummary(prev => {
            return {
                ...prev,
                activosTC: prev.activosTC! - 1
            }
        })       
    }
    const addActiveTD =() =>{
        setLegendSummary(prev =>{
            return{
                ...prev,
                activosTD:(prev.activosTD?? 0)+1
            }
        })
    }
    const removeActiveTD = ()=>{
         setLegendSummary(prev => {
            return {
                ...prev,
                activosTD: prev.activosTD! - 1
            }
        })       
    }
    const addPedidosPendientes =() =>{
        setLegendSummary(prev =>{
            return{
                ...prev,
                numPedidos: (prev.numPedidos ?? 0)+1
            }
        })
    }
    const removePedidosPendientes = ()=>{
         setLegendSummary(prev => {
            return {
                ...prev,
                activosTA: prev.numPedidos! - 1
            }
        })       
    }

    const pushPedidosPendientes =(pedidoslength:number) =>{
        setLegendSummary(prev =>{
            return{
                ...prev,
                numPedidos: pedidoslength
            }
        })
    }

    const addActiveTrunck = (type: "TA"| "TB"| "TD"| "TC") =>{
        switch(type){
            case "TA":
                addActiveTA();
                break;
            case "TB":
                addActiveTB();
                break;
            case "TD":
                addActiveTD();
                break;
            case "TC":
                addActiveTC();
                break;
        }
    }
    const removeActiveTrunck = (type: "TA"| "TB"|"TD"|"TC")=>{
        switch(type){
            case "TA":
                removeActiveTA();
                break;
            case "TB":
                removeActiveTB();
                break;
            case "TC":
                removeActiveTC();
                break;
            case "TD":
                removeActiveTD();
                break;
        }
    }

    return{
        addActiveTrunck,
        removeActiveTrunck,
        addPedidos:addPedidosPendientes,
        removePedidos:removePedidosPendientes,
        pushPedidosPendientes,
        reset
    }
}



export default useLengendSummary;
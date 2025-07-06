// import { SimulationType } from "@/interfaces/simulation.interface";
// import { useEffect, useRef, useState } from "react";

// interface Time {
//     hour: number;
//     minute: number;
//     day: number;
// }
// interface SimulationTimeProps{
//     initTimer: boolean;
//     speedTime?: number;
//     dia:number,
//     ihora:number,
//     iminuto:number
//     simulacionIniciada:boolean,
//     intervalMs: number,
//     tipoSimulacion: SimulationType,
//     stopTimer: () => void;
// }

// export interface SimulationTimeReturn{
//     time: Time;
//     finish:boolean
//     timerSimulacion:number
//     restartSimulationTime: () => void;
// }

// const useSimulationTime = ({initTimer,intervalMs,speedTime,dia = 1,ihora= 0 ,iminuto =0,simulacionIniciada,tipoSimulacion,stopTimer }:SimulationTimeProps) : SimulationTimeReturn => {
//     const [timerSimulacion,setTimerSimulacion] = useState<number>(-1);
//     const [time, setTime] = useState<Time>({hour: ihora, minute: iminuto, day: dia});
//     const limitTime = useRef<number>(0);
//     const refTimerSimulacion = useRef<number>(timerSimulacion);
//     const timerId = useRef<NodeJS.Timeout| null>(null);
//     const [finish,setFinish] = useState<boolean>(false);


//     useEffect(()=>{
//         refTimerSimulacion.current = timerSimulacion;
//     },[timerSimulacion])

//     useEffect(()=>{
//         if(!initTimer ){
//             if(timerId.current)
//                 clearInterval(timerId.current);
//             return;
//         }
//         timerId.current = setInterval(() => {
//             if(limitTime.current <= refTimerSimulacion.current){
//                 if(timerId.current)clearInterval(timerId.current);
//                 stopTimer();
//                 setFinish(true); //inidca que termino
//                 return ;
//             }
//             console.log(limitTime, refTimerSimulacion.current);
//             setTime(prev => {
//                 let {hour, minute, day} = prev;
//                 minute += 1;
//                 if (minute >= 60) {
//                     minute = 0;
//                     hour += 1;
//                 }
//                 if (hour >= 24) {
//                     hour = 0;
//                     day += 1;
//                 }
//                 return {hour, minute, day};
//             });
//             setTimerSimulacion(prev => prev + 1);
//         }   , intervalMs);
//         return () => {
//             if (timerId.current) 
//                 clearInterval(timerId.current);
//         }
//     },[initTimer,intervalMs])

//     //para que se actualize el setTimer cada vez que se iniciea una nueva simulacion
//     useEffect(()=>{
//         console.log("datos de la simulacion",dia,ihora,iminuto)
//         const nuevoTimer = (1440*dia) + (ihora*60)+iminuto;
//         setTimerSimulacion(nuevoTimer);
//         setTime({hour:ihora,day:dia,minute:iminuto});
//     },[dia,ihora,iminuto])

//     useEffect(()=>{
//         let initMinut = (1440*dia) + (ihora*60)+iminuto;
//         limitTime.current = defineLimitTime(tipoSimulacion,initMinut);
//         setTimerSimulacion((1440*dia) + (ihora*60)+iminuto);
//         setTime({hour:ihora,day:dia,minute:iminuto});
//     },[simulacionIniciada])

//     const restartSimulationTime = () => {
//         setTime({hour: ihora, minute:iminuto, day: dia});
//     }

//     return {
//         time,
//         timerSimulacion,
//         restartSimulationTime,
//         finish
//     };

    
// }

// const defineLimitTime = (tipoSimulacion : SimulationType,minutoInit:number) =>{
//     const {COLAPSO,DIA_DIA,SEMANAL} = SimulationType;
//     let limit = 0;
//     switch(tipoSimulacion){
//         case SEMANAL:
//             limit = minutoInit + 7*1440;
//             break;
//         case DIA_DIA:
//             limit = minutoInit + 1*1440;
//             break;
//         case COLAPSO:
//             limit = 0; //por hacer
//             break;
//     }
//     return limit;
// }

// export default useSimulationTime;
// /*
// made by Dalpb
// */
import { SimulationType } from "@/interfaces/simulation.interface";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface Time {
    hour: number;
    minute: number;
    day: number;
}
interface SimulationTimeProps{
    initTimer: boolean;
    speedTime?: number;
    dia:number,
    ihora:number,
    iminuto:number
    simulacionIniciada:boolean,
    intervalMs: number,
    tipoSimulacion: SimulationType,
    stopTimer: () => void;
    minutosPorIteracion: number; // <-- agregado aquí
}

export interface SimulationTimeReturn{
    time: Time;
    finish:boolean;
    setFinish: Dispatch<SetStateAction<boolean>>;
    timerSimulacion:number
    restartSimulationTime: () => void;
}

const useSimulationTime = ({
    initTimer,
    intervalMs,
    speedTime,
    dia = 1,
    ihora = 0,
    iminuto = 0,
    simulacionIniciada,
    tipoSimulacion,
    stopTimer,
    minutosPorIteracion // <-- agregado aquí
}: SimulationTimeProps) : SimulationTimeReturn => {
    const [timerSimulacion,setTimerSimulacion] = useState<number>(-1);
    const [time, setTime] = useState<Time>({hour: ihora, minute: iminuto, day: dia});
    const limitTime = useRef<number>(0);
    const refTimerSimulacion = useRef<number>(timerSimulacion);
    const timerId = useRef<NodeJS.Timeout| null>(null);
    const [finish,setFinish] = useState<boolean>(false);

    useEffect(()=>{
        refTimerSimulacion.current = timerSimulacion;
    },[timerSimulacion])

    useEffect(()=>{
        if(!initTimer ){
            if(timerId.current)
                clearInterval(timerId.current);
            return;
        }
        timerId.current = setInterval(() => {
            if(limitTime.current <= refTimerSimulacion.current){
                if(timerId.current)clearInterval(timerId.current);
                stopTimer();
                setFinish(true); //inidca que termino
                return ;
            }
            console.log(limitTime, refTimerSimulacion.current);
            setTime(prev => {
                let {hour, minute, day} = prev;
                minute += 1; // <-- aquí el cambio
                if (minute >= 60) {
                    minute = 0;
                    hour += 1;
                }
                if (hour >= 24) {
                    hour = 0;
                    day += 1;
                }
                return {hour, minute, day};
            });
            setTimerSimulacion(prev => prev + 1);
        }   , intervalMs);
        return () => {
            if (timerId.current) 
                clearInterval(timerId.current);
        }
    },[initTimer,intervalMs]) // <-- agrega minutosPorIteracion como dependencia

    //para que se actualize el setTimer cada vez que se iniciea una nueva simulacion
    useEffect(()=>{
        console.log("datos de la simulacion",dia,ihora,iminuto)
        const nuevoTimer = (1440*dia) + (ihora*60)+iminuto;
        setTimerSimulacion(nuevoTimer);
        setTime({hour:ihora,day:dia,minute:iminuto});
    },[dia,ihora,iminuto])

    useEffect(()=>{
        let initMinut = (1440*dia) + (ihora*60)+iminuto;
        limitTime.current = defineLimitTime(tipoSimulacion,initMinut);
        setTimerSimulacion((1440*dia) + (ihora*60)+iminuto);
        setTime({hour:ihora,day:dia,minute:iminuto});
    },[simulacionIniciada])

    const restartSimulationTime = () => {
        setTime({hour: ihora, minute:iminuto, day: dia});
    }

    return {
        time,
        timerSimulacion,
        restartSimulationTime,
        finish,
        setFinish
    };
}

const defineLimitTime = (tipoSimulacion : SimulationType,minutoInit:number) =>{
    const {COLAPSO,DIA_DIA,SEMANAL} = SimulationType;
    let limit = 0;
    switch(tipoSimulacion){
        case SEMANAL:
            limit = minutoInit + (7)*1440;
            break;
        case DIA_DIA:
            limit = minutoInit + 1*1440;
            break;
        case COLAPSO:
            limit = Number.MAX_SAFE_INTEGER; // ← Sin límite de tiempo
            break;
    }
    return limit;
}

export default useSimulationTime;
/*
made by Dalpb
*/
import { useEffect, useRef, useState } from "react";

interface RealTime {
    hour: number;
    minute: number;
    second: number;
}
interface RealTimeProps{
    initTimer: boolean;
    simulacionIniciada: boolean
}
export interface RealTimeReturn {
    realTime: RealTime;
    restartRealTime: () => void;
}
const useRealTime = ({initTimer,simulacionIniciada}:RealTimeProps) : RealTimeReturn => {
    const [realTime, setRealTime] = useState<RealTime>({hour: 0, minute: 0, second: 0});
    const timerId = useRef<NodeJS.Timeout| null>(null);
    useEffect(()=>{
        if(!initTimer){
            if(timerId.current)
                clearInterval(timerId.current);
            return;
        }
        timerId.current = setInterval(() => {
            setRealTime(prev => {
                let {hour, minute, second} = prev;
                second += 1;
                if (second >= 60) {
                    second = 0;
                    minute += 1;
                }
                if (minute >= 60) {
                    minute = 0;
                    hour += 1;
                }
                return {hour, minute, second};
            });
        }   , 1000);
        return () => {
            if (timerId.current) 
                clearInterval(timerId.current);
        }
    },[initTimer])

    useEffect(()=>{
        setRealTime({hour:0,minute:0,second:0});
    },[simulacionIniciada])


    const restartRealTime = () => {
        setRealTime({hour: 0, minute: 0, second: 0});
    }
    return {
        restartRealTime,
        realTime
    }


}

export default useRealTime;
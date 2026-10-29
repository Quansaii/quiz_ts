import { useEffect, useRef, useState } from "react";

export function useCountdown(seconds:number, isActive:boolean, onExpire:() => void):number{
    const [leftSeconds, setLeftSeconds] = useState<number>(seconds);
    const onExpireRef = useRef(onExpire);
    onExpireRef.current = onExpire;

    useEffect(()=>{
        if(!isActive || leftSeconds === 0){
            return;
        }
        const timer = setInterval(()=>{
            setLeftSeconds((prev) => Math.max(prev - 1, 0));
        }, 1000)

        return ()=> clearInterval(timer)
    }, [isActive])

    useEffect(()=>{
        if(isActive && leftSeconds === 0){
            onExpireRef.current()
        }
    },[leftSeconds,isActive])


    return leftSeconds;
}
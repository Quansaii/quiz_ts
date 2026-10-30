import { useEffect, type Dispatch } from "react";
import type { GameAction, GameState, QuizSettings } from "../types/quiz";
import { fetchQuestions } from "../api/fetchQuestions";
import { TriviaApiError } from "../api/errors";

export function useQuestions(currentStatus:GameState['status'], settings:QuizSettings | null, dispatch:Dispatch<GameAction>):void{
    useEffect(()=>{
        if(currentStatus === 'loading' && settings !== null){
            const controller = new AbortController();

            const load = async ()=>{
                try{
                    const questions = await fetchQuestions(settings, controller.signal);
                    if(controller.signal.aborted){
                        return;
                    }
                    dispatch({type:'LOADED', questions:questions})
                }
                catch(err){
                    if(err instanceof DOMException && err.name === "AbortError"){
                        return;
                    }
                    const message = err instanceof TriviaApiError ? err.message : "Could not load questions.";
                    dispatch({type:'LOAD_FAILED', message:message})
                }
            }

            load();

            return ()=>{controller.abort()}
        }

    },[currentStatus, settings])
}

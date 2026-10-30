import type { Dispatch } from "react";
import type { GameAction } from "../types/quiz";

interface ErrorScreenProps{
    message:string;
    dispatch:Dispatch<GameAction>;
}

export function ErrorScreen({message, dispatch}: ErrorScreenProps){

    function handleTryAgain(){
        dispatch({type:"START"});
    }

    function handleBackToSettings(){
        dispatch({type:"RESTART"});
    }

    return(
        <section className="card">
            <h1 className="title">Something went wrong</h1>
            <p className="alert" role="alert">{message}</p>
            <div className="actions">
                <button type="button" className="btn btn--primary" onClick={handleTryAgain}>Try again</button>
                <button type="button" className="btn btn--secondary" onClick={handleBackToSettings}>Back to settings</button>
            </div>
        </section>
    )
}

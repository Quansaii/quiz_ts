import type { Dispatch } from "react";
import type { GameAction, Question } from "../types/quiz";
import { useCountdown } from "../hooks/useCountdown";
import { timeForAnswer } from "../game/gameConfig";
import { AnswerButton } from "./AnswerButton";

interface QuestionScreenProps{
    question:Question,
    index:number,
    total:number,
    score:number,
    selected:number|null,
    dispatch:Dispatch<GameAction>
}

export function QuestionScreen({question, index, total, score, selected, dispatch}:QuestionScreenProps){

    function buttonState(answerIndex:number){
        if(selected === null){
            return 'idle';
        }
        if(question.answers[answerIndex]?.isCorrect){
            return 'correct';
        }
        if(answerIndex === selected){
            return 'wrong';
        }
        return 'dimmed';
    }

    const timer:number = useCountdown(timeForAnswer, selected === null, ()=>dispatch({type:'TIMEOUT'}));

    function handleNext(){
        dispatch({type:"NEXT"})
    }

    return(
        <section className="card">
            <div className="question-meta">
                <span>Question {index+1}/{total}</span>
                <span>Score: {score}</span>
                <span className={timer <= 5 ? "timer timer--low" : "timer"} role="timer">{timer}s</span>
            </div>
            <p className="question-category">{question.category}</p>
            <h1 className="question-text">{question.text}</h1>
            <div className="answers">
                {question.answers.map((answer, answerIndex)=>(
                <AnswerButton
                    key={answerIndex}
                    text={answer.text}
                    state={buttonState(answerIndex)}
                    disabled={selected !== null}
                    onClick={()=>dispatch({type:'ANSWER', answerIndex:answerIndex})}
                />
                ))}
            </div>
            {selected !== null && (
                <div className="actions">
                    <button type="button" className="btn btn--primary" onClick={handleNext}>Next</button>
                </div>
            )}
        </section>
    )
}

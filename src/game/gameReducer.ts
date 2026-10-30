import type { GameAction, GameState, Question } from "../types/quiz";
import { applyAnswer } from "./scoring";

export function gameReducer(currentState:GameState, action:GameAction):GameState{
    switch(action.type){
        case 'UPDATE_SETTINGS':
            if(currentState.status === 'setup'){
                return{
                ...currentState,
                settings:{
                    ...currentState.settings, ...action.settings
                }
            }
            };
            break;

        case 'START':
            if(currentState.status === 'setup' || currentState.status === 'error'){
                return{
                    status: 'loading',
                    settings:{
                        ...currentState.settings
                    }
                }
            };
            break;

        case 'LOADED':
            if(currentState.status === 'loading'){
                if(action.questions.length === 0){
                    return{
                        status:'error',
                        settings:{
                            ...currentState.settings
                        },
                        message:"No questions found!"
                    }
                }
                else{
                    return{
                        status:'question',
                        settings:{
                            ...currentState.settings
                        },
                        questions:action.questions,
                        index:0,
                        selected:null,
                        score:0
                    }
                }
            }

            break;

        case 'LOAD_FAILED':
            if(currentState.status === 'loading'){
                return{
                    status:'error',
                    settings:{
                        ...currentState.settings
                    },
                    message:action.message
                }
            }
            break;

        case 'ANSWER':
            if(currentState.status === 'question' && currentState.selected === null){
                const question: Question | undefined = currentState.questions[currentState.index];
                const answer = question?.answers[action.answerIndex];
                if(question === undefined || answer === undefined){
                    return{
                        status:'error',
                        settings:{
                            ...currentState.settings
                        },
                        message:"Question or Answer not found!"
                    }
                }
                return{
                    ...currentState,
                    selected:action.answerIndex,
                    score:applyAnswer(currentState.score, answer.isCorrect),
                }
            }
            break;

        case 'TIMEOUT':
            if(currentState.status === 'question' && currentState.selected === null){
                return{
                    ...currentState,
                    selected: -1
                }
            }
            break;

        case 'NEXT':
            if(currentState.status === 'question' && currentState.selected !== null){
                if(currentState.index + 1 < currentState.questions.length){
                    return{
                        ...currentState,
                        index:currentState.index+1,
                        selected:null
                    }
                }
                else{
                    return{
                        status:'finished',
                        settings:{
                            ...currentState.settings
                        },
                        score:currentState.score,
                        total:currentState.questions.length
                    }
                }
            }
            break;

        case 'RESTART':
            if(currentState.status === 'error' || currentState.status === 'finished'){
                return{
                    status:'setup',
                    settings:{
                        ...currentState.settings
                    }
                }
            }

            break;
    }
    return currentState;
}

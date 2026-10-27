import type { GameState, Question } from "../types/quiz";

export function createInitialState():GameState{
    const initialState: GameState = {
        status:'setup',
        settings:{
            amount:10,
            categoryId:null,
            difficulty:'any',
            type:'any'
        }
    }

    return initialState;
}

export function currentQuestion(currentState:GameState):Question | null{
    if(currentState.status === 'question'){
        const question: Question | undefined = currentState.questions[currentState.index];
        if(question !== undefined){
            return question;
        }
    }

    return null;
}
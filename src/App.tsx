import { useReducer } from "react";
import { gameReducer } from "./game/gameReducer";
import { createInitialState, currentQuestion } from "./game/gameState";
import { useQuestions } from "./hooks/useQuestions";
import { SetupScreen } from "./components/SetupScreen";
import { ErrorScreen } from "./components/ErrorScreen";
import { ResultScreen } from "./components/ResultScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import { QuestionScreen } from "./components/QuestionScreen";

export function App() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());
  useQuestions(state.status, state.settings, dispatch);

  function onRestart(){
    dispatch({type:"RESTART"});
  }

  switch(state.status){
    case 'setup': 
          return <SetupScreen 
          settings={state.settings} 
          dispatch={dispatch}/>
    case 'error': 
          return <ErrorScreen 
          message={state.message} 
          dispatch={dispatch}/>
    case 'finished': 
          return <ResultScreen 
          score={state.score} 
          total={state.total} 
          onRestart={onRestart}/>
    case 'loading': 
          return <LoadingScreen/>
    case 'question':{ 
          const question = currentQuestion(state)
          if(question === null){
            return <LoadingScreen/>
          }
          else{
            return <QuestionScreen
              key={state.index}
              question={question}
              dispatch={dispatch} 
              index={state.index} 
              total={state.questions.length}
              score={state.score}
              selected={state.selected}/>
          }
        }
  }
}

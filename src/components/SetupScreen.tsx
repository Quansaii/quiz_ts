import type { Dispatch } from "react";
import type { Difficulty, GameAction, QuestionType, QuizSettings } from "../types/quiz";
import { useCategories } from "../hooks/useCategories";
import type React from "react";

interface SetupScreenProps{
  settings:QuizSettings;
  dispatch:Dispatch<GameAction>
}

function isQuestionType(value:string): value is QuestionType {
  return value === 'any' || value === 'multiple' || value === 'boolean';
}

function isDifficulty(value:string): value is Difficulty {
  return value === 'any' || value === 'easy' || value === 'medium' || value === 'hard';
}

export function SetupScreen({settings, dispatch}:SetupScreenProps) {
    const {categories, loading, error} = useCategories();

    function handleCategoryChange(event:React.ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(value === ""){
        dispatch({type:"UPDATE_SETTINGS", settings:{categoryId:null}})
      }
      else{
        dispatch({type:"UPDATE_SETTINGS", settings:{categoryId:Number(value)}})
      }
    }

    function handleTypeChange(event:React.ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(!isQuestionType(value)){
        return;
      }
      if(value === "any"){
        dispatch({type:"UPDATE_SETTINGS", settings:{type:'any'}})
      }
      else{
        dispatch({type:"UPDATE_SETTINGS", settings:{type:value}})
      }
    }

    function handleDifficultyChange(event:React.ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(!isDifficulty(value)){
        return;
      }
      if(value === "any"){
        dispatch({type:"UPDATE_SETTINGS", settings:{difficulty:'any'}})
      }
      else{
        dispatch({type:"UPDATE_SETTINGS", settings:{difficulty:value}})
      }
    }
    
    function handleAmountChange(event:React.ChangeEvent<HTMLInputElement>){
      const value:number = Number(event.target.value);
        dispatch({type:"UPDATE_SETTINGS", settings:{amount:value}})
    }
    function handleButtonClick(){
      dispatch({type:"START"})
    }

  return (
    <>
      {error !== null && <p>{error}</p>}

      <div>
        <label htmlFor="category">Choose Category</label>
          <select id="category" value={settings.categoryId ?? ""} onChange={handleCategoryChange}>
            <option value="">Any</option>
            {categories.map((category) => (
              <option key={String(category.id)} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        <label htmlFor="type">Choose Type</label>
          <select id="type" value={settings.type} onChange={handleTypeChange}>
            <option value="any">Any</option>
            <option value="multiple">Multiple Answers</option>
            <option value="boolean">True or False</option>
          </select>
        <label htmlFor="difficulty">Choose Difficulty</label>
          <select id="difficulty" value={settings.difficulty} onChange={handleDifficultyChange}>
            <option value="any">Any</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        <label htmlFor="amount">Choose Amount of questions</label>
            <input type="number" id="amount" name="amount" min="1" max="50" value={settings.amount} onChange={handleAmountChange}/>

          <button type="button" onClick={handleButtonClick} disabled={loading}>Start</button>
      </div>
    </>
  );
}
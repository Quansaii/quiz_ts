import type { ChangeEvent, Dispatch } from "react";
import type { Difficulty, GameAction, QuestionType, QuizSettings } from "../types/quiz";
import { useCategories } from "../hooks/useCategories";

interface SetupScreenProps{
  settings:QuizSettings;
  dispatch:Dispatch<GameAction>
}

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 50;

function isQuestionType(value:string): value is QuestionType {
  return value === 'any' || value === 'multiple' || value === 'boolean';
}

function isDifficulty(value:string): value is Difficulty {
  return value === 'any' || value === 'easy' || value === 'medium' || value === 'hard';
}

export function SetupScreen({settings, dispatch}:SetupScreenProps) {
    const {categories, loading, error} = useCategories();

    function handleCategoryChange(event:ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(value === ""){
        dispatch({type:"UPDATE_SETTINGS", settings:{categoryId:null}})
      }
      else{
        dispatch({type:"UPDATE_SETTINGS", settings:{categoryId:Number(value)}})
      }
    }

    function handleTypeChange(event:ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(!isQuestionType(value)){
        return;
      }
      dispatch({type:"UPDATE_SETTINGS", settings:{type:value}})
    }

    function handleDifficultyChange(event:ChangeEvent<HTMLSelectElement>){
      const value = event.target.value;
      if(!isDifficulty(value)){
        return;
      }
      dispatch({type:"UPDATE_SETTINGS", settings:{difficulty:value}})
    }

    function handleAmountChange(event:ChangeEvent<HTMLInputElement>){
      if(event.target.value === ""){
        return;
      }
      const parsed:number = Number(event.target.value);
      if(Number.isNaN(parsed)){
        return;
      }
      const amount:number = Math.min(MAX_AMOUNT, Math.max(MIN_AMOUNT, Math.round(parsed)));
      dispatch({type:"UPDATE_SETTINGS", settings:{amount:amount}})
    }

    function handleStart(){
      dispatch({type:"START"})
    }

  return (
    <section className="card">
      <h1 className="title">Trivia Quiz</h1>
      <p className="subtitle">Choose your settings and test your knowledge.</p>

      {error !== null && <p className="alert" role="alert">{error}</p>}

      <div className="field">
        <label htmlFor="category">Category</label>
        <select id="category" value={settings.categoryId ?? ""} onChange={handleCategoryChange}>
          <option value="">Any category</option>
          {categories.map((category) => (
            <option key={String(category.id)} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="type">Question type</label>
        <select id="type" value={settings.type} onChange={handleTypeChange}>
          <option value="any">Any type</option>
          <option value="multiple">Multiple choice</option>
          <option value="boolean">True / False</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="difficulty">Difficulty</label>
        <select id="difficulty" value={settings.difficulty} onChange={handleDifficultyChange}>
          <option value="any">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="amount">Number of questions</label>
        <input type="number" id="amount" name="amount" min={MIN_AMOUNT} max={MAX_AMOUNT} value={settings.amount} onChange={handleAmountChange}/>
      </div>

      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={handleStart} disabled={loading}>Start quiz</button>
      </div>
    </section>
  );
}

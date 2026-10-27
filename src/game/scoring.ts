import type { DifficultyWithoutAny } from "../types/quiz";
import {timeForAnswer} from './gameConfig'

export function applyAnswer(currentScore:number, isCorrect:boolean):number{
  let newScore:number = currentScore;
  if (isCorrect) {
    newScore = currentScore + 1;
  }
  return newScore;
}

export function calculatePoints(questionDifficulty:DifficultyWithoutAny, leftSeconds:number):number{
  let score:number = 0;
  const timeDifference:number = timeForAnswer - leftSeconds;

  if(leftSeconds <= 0){
    return 0;
  }
  switch(questionDifficulty){
    case 'easy': 
        score = score + 1; 
        break;
    case "hard": 
        score = score + 3;
        break;
    case "medium": 
        score = score + 2;
        break;
  }

  if(timeDifference < 5){
    score = score + 3;
  }
  else if(timeDifference >= 5 && timeDifference < 10){
    score = score + 2;
  }
  else if(timeDifference >= 10 && timeDifference < 20){
    score = score + 1;
  }

  return score;
}
import {decodeHtml} from "./decodeHtml"
import type { Answer } from '../types/quiz';
import {shuffle} from './shuffle'

export function buildAnswers(correctAnswer:string, incorrectAnswers:string[], random: () => number = Math.random):Answer[]{
  const answers: Answer[] = [];
  answers.push({text:decodeHtml(correctAnswer), isCorrect:true});

  for(const answer of incorrectAnswers){
    answers.push({text:decodeHtml(answer), isCorrect:false})
  }
  return shuffle(answers, random);
}
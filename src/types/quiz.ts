export interface ApiQuestionsResponse{
  response_code:number;
  results:ApiQuestion[];
}

export interface ApiQuestion{
  type:'multiple'|'boolean';
  difficulty: 'easy'|'medium'|'hard';
  category:string;
  question:string;
  correct_answer:string;
  incorrect_answers:string[];
}

export interface ApiCategoriesResponse{
  trivia_categories: {id:number, name:string}[]
}

export type Difficulty = 'any'|'easy'|'medium'|'hard';

export type QuestionType = 'any'|'multiple'| 'boolean';

export interface Category{
  id:number;
  name:string;
}

export interface QuizSettings{
  amount:number,
  categoryId:number | null;
  difficulty:Difficulty;
  type:QuestionType;
}

export interface Answer{
  text:string;
  isCorrect:boolean;
}

export type DifficultyWithoutAny = Exclude<Difficulty, 'any'>

export interface Question{
  id:string;
  category:string;
  difficulty: DifficultyWithoutAny;
  text:string;
  answers:Answer[];
}

export type GameState = 
  | {status:"setup"; settings:QuizSettings}
  | {status:"loading"; settings:QuizSettings}
  | {status:"error"; settings:QuizSettings; message:string}
  | {status:"question"; settings:QuizSettings; questions:Question[]; index:number; selected:number|null; score:number;}
  | {status:"finished"; settings:QuizSettings; score:number; total:number}

export type GameAction =
  | {type: "UPDATE_SETTINGS"; settings:Partial<QuizSettings>}
  | {type: "START"}
  | {type: "LOADED"; questions:Question[]}
  | {type: "LOAD_FAILED"; message:string}
  | {type: "ANSWER"; answerIndex:number}
  | {type: "TIMEOUT"}
  | {type: "NEXT"}
  | {type: "RESTART"}


















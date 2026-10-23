interface ApiQuestionsResponse{
  response_code:number;
  results:ApiQuestion[];
}

interface ApiQuestion{
  type:'multiple'|'boolean';
  difficulty: 'easy'|'medium'|'hard';
  category:string;
  question:string;
  correct_answer:string;
  incorrect_answers:string[];
}

interface ApiCategoriesResponse{
  trivia_categories: {id:number, name:string}[]
}

type Difficulty = 'any'|'easy'|'medium'|'hard';

type QuestionType = 'any'|'multiple'| 'boolean';

interface Category{
  id:number;
  name:string;
}

interface QuizSettings{
  amount:number,
  categoryId:number | null;
  difficulty:Difficulty;
  type:QuestionType;
}

interface Answer{
  text:string;
  isCorrect:boolean;
}

type DifficultyWithoutAny = Exclude<Difficulty, 'any'>

interface Question{
  id:string;
  category:string;
  difficulty: DifficultyWithoutAny;
  text:string;
  answers:Answer[];
}

type GameState = 
  | {status:"setup"; settings:QuizSettings}
  | {status:"loading"; settings:QuizSettings}
  | {status:"error"; settings:QuizSettings; message:string}
  | {status:"question"; settings:QuizSettings; questions:Question[]; index:number; selected:number|null; score:number;}
  | {status:"finished"; settings:QuizSettings; score:number; total:number}

type GameAction =
  | {type: "UPDATE_SETTINGS"; settings:Partial<QuizSettings>}
  | {type: "START"}
  | {type: "LOADED"; questions:Question[]}
  | {type: "LOAD_FAILED"; message:string}
  | {type: "ANSWER"; answerIndex:number}
  | {type: "TIMEOUT"}
  | {type: "NEXT"}
  | {type: "RESTART"}


















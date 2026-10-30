import type { QuizSettings } from "../types/quiz";

export function buildQuestionsUrl(settings:QuizSettings):string{
    const amount: number = settings.amount;
    const category: number | null = settings.categoryId;
    const difficulty: string | null = settings.difficulty !== 'any' ? settings.difficulty : null;
    const type: string | null = settings.type !== 'any' ? settings.type : null;

    let url: string = `https://opentdb.com/api.php?amount=${amount}`;

    if(category !== null){
        url = url + `&category=${category}`
    }
    if(difficulty !== null){
        url = url + `&difficulty=${difficulty}`
    }
    if(type !== null){
        url = url + `&type=${type}`
    }

    return url;
}
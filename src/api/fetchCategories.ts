import type { ApiCategoriesResponse, Category } from "../types/quiz";
import { TriviaApiError } from "./errors";

export async function fetchCategories(signal?: AbortSignal): Promise<Category[]>{
    const url: string = "https://opentdb.com/api_category.php";
    let response: Response;
    try{
       response = await fetch(url,{signal});
    }
    catch(error){
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }
        throw new TriviaApiError('Проблемы с соединением', null);
    }

    if (!response.ok) {
        throw new TriviaApiError('Сервер вернул ошибку', response.status);
    }

    let data: ApiCategoriesResponse;
    try {
        data = await response.json();
    } catch (error) {
        throw new TriviaApiError('Не удалось прочитать ответ сервера', null);
    }

    const results: Category[] = data.trivia_categories.map((result) => {
        return{
            id:result.id,
            name:result.name
        }
    });

    return results;
}
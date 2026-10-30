import { useEffect, useState } from "react";
import type {Category } from "../types/quiz";
import { fetchCategories } from "../api/fetchCategories";

export interface UseCategoriesResult{
    categories:Category[],
    loading:boolean,
    error: string | null
}

export function useCategories():UseCategoriesResult{
    const [categories, setCategories] = useState<Category[]> ([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(()=>{
        const controller = new AbortController();

            const load = async() => {
                try{
                    const allCategories = await fetchCategories(controller.signal);
                    setCategories(allCategories);
                    setLoading(false);
                }

                catch(err){
                    if(err instanceof DOMException){
                        if(err.name === "AbortError"){
                            return;
                        }
                    }
                    setError('Could not load categories.');
                    setLoading(false);
                }
            };
            load();
            return () => {controller.abort()};
        }
    ,[])
    return {categories, loading, error};
}
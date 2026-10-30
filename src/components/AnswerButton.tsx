type ButtonState = 'idle'| 'correct'| 'wrong'| 'dimmed';

interface AnswerButtonProps{
    text:string;
    state:ButtonState;
    disabled:boolean;
    onClick: ()=>void;
}

export function AnswerButton({text, state, disabled, onClick}:AnswerButtonProps){
    return(
        <button className={`answer answer--${state}`} disabled={disabled} onClick={onClick}>{text}</button>
    )
}
interface ResultScreenProps{
    score:number;
    total:number;
    onRestart:()=>void;
}

export function ResultScreen({score, total, onRestart}:ResultScreenProps){
    return(
        <section className="card">
            <h1 className="title">Quiz finished</h1>
            <p className="result-score">You got {score}/{total}</p>
            <div className="actions">
                <button type="button" className="btn btn--primary" onClick={onRestart}>Play again</button>
            </div>
        </section>
    )
}

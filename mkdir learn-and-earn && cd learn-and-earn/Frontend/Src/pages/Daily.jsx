import React, { useEffect, useState } from 'react';

export default function Daily() {
  const [daily, setDaily] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/lessons/daily').then(r => r.json()).then(setDaily).catch(console.error);
  }, []);

  async function submit(e) {
    e.preventDefault();
    const ansArray = daily.quiz.map((q, idx) => answers[idx] !== undefined ? parseInt(answers[idx], 10) : null);
    const res = await fetch(`http://localhost:4000/api/lessons/${daily.id}/quiz-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: ansArray })
    });
    const data = await res.json();
    setResult(data);
  }

  if (!daily) return <div>Loading...</div>;
  return (
    <div>
      <h2>Daily Word: {daily.daily_word}</h2>
      <form onSubmit={submit}>
        {daily.quiz.map((q, idx) => (
          <div key={q.id} className="quiz-question">
            <p>{q.q}</p>
            {q.options.map((opt, i) => (
              <label key={i} className="radio">
                <input type="radio" name={`q${idx}`} value={i} onChange={() => setAnswers({ ...answers, [idx]: i })} />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
      {result && <div>Your score: {result.score}/{result.total}</div>}
    </div>
  );
}
￼Enter

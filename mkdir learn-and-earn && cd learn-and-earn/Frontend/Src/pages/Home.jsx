import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [gigs, setGigs] = useState([]);
  const [daily, setDaily] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/gigs').then(r => r.json()).then(setGigs).catch(console.error);
    fetch('http://localhost:4000/api/lessons/daily').then(r => r.json()).then(setDaily).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Learn & Earn — MVP</h1>

      <section>
        <h2>Daily word</h2>
        {daily ? (
          <div>
            <strong>{daily.daily_word}</strong> — <Link to="/daily">Take today's quiz</Link>
          </div>
        ) : <div>Loading...</div>}
      </section>

      <section>
        <h2>Open gigs</h2>
        {gigs.length === 0 ? <p>No gigs yet — add one.</p> :
          <ul>
            {gigs.map(g => (
              <li key={g.id}>
                <Link to={`/gigs/${g.id}`}>{g.title}</Link> — ${g.price} — skills: {g.skills}
              </li>
            ))}
          </ul>}
      </section>
    </div>
  );
}

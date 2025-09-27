import React, { useEffect, useState } from 'react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/tasks').then(r => r.json()).then(setTasks).catch(console.error);
  }, []);

  async function complete(taskId) {
    const content = prompt('Any notes or link to upload?');
    const res = await fetch(`http://localhost:4000/api/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: name || 'Anonymous', content })
    });
    const data = await res.json();
    if (data.status === 'approved') {
      const reward = tasks.find(t => t.id === taskId)?.reward || 0;
      alert(`Submitted! You earned $${reward}`);
    } else {
      alert('Submission error');
    }
  }

  return (
    <div>
      <h2>Microtasks</h2>
      <div>
        <input placeholder="Your name (for tasks)" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>
            {t.title} — ${t.reward} <button onClick={() => complete(t.id)}>Start</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
￼Enter

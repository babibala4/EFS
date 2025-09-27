import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function GigDetail() {
  const { id } = useParams();
  const [gig, setGig] = useState(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`http://localhost:4000/api/gigs/${id}`).then(r => r.json()).then(setGig).catch(console.error);
  }, [id]);

  async function apply(e) {
    e.preventDefault();
    const res = await fetch(`http://localhost:4000/api/gigs/${id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_name: name, message })
    });
    const data = await res.json();
    if (data.id) {
      alert('Applied successfully!');
      setName('');
      setMessage('');
      // refresh
      fetch(`http://localhost:4000/api/gigs/${id}`).then(r => r.json()).then(setGig);
    } else {
      alert('Error applying');
    }
  }

  if (!gig) return <div>Loading...</div>;
  return (
    <div>
      <h2>{gig.title}</h2>
      <p>{gig.description}</p>
      <p><strong>Price:</strong> ${gig.price}</p>
      <p><strong>Skills:</strong> {gig.skills}</p>

      <h3>Apply</h3>
      <form onSubmit={apply} className="form">
        <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
        <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
        <button type="submit">Apply</button>
      </form>

      <h3>Applications</h3>
      <ul>
        {gig.applications && gig.applications.length > 0 ? gig.applications.map(a =>
          <li key={a.id}>{a.student_name}: {a.message}</li>
        ) : <li>No applications yet</li>}
      </ul>
    </div>
  );
}
￼Enter

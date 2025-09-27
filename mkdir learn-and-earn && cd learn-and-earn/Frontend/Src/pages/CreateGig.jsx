import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateGig() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [skills, setSkills] = useState('');
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/api/gigs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description: desc,
        price: parseFloat(price || 0),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      })
    });
    const data = await res.json();
    if (data.id) nav(`/gigs/${data.id}`);
    else alert('Error creating gig');
  }

  return (
    <div>
      <h2>Create new gig</h2>
      <form onSubmit={submit} className="form">
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <input placeholder="Price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
        <input placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CreateGig from './pages/CreateGig';
import GigDetail from './pages/GigDetail';
import Tasks from './pages/Tasks';
import Daily from './pages/Daily';

function Nav() {
  return (
    <nav className="nav">
      <Link to="/">Home</Link> · <Link to="/create">Create Gig</Link> · <Link to="/tasks">Microtasks</Link> · <Link to="/daily">Daily Word</Link>
    </nav>
  );
}

export default function App() {
  return (
    <div>
      <Nav />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateGig />} />
          <Route path="/gigs/:id" element={<GigDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/daily" element={<Daily />} />
        </Routes>
      </main>
    </div>
  );
}

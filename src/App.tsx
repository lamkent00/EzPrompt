import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Tools } from './pages/Tools';
import { Profile } from './pages/Profile';
import { CreatePrompt } from './pages/CreatePrompt';
import { EditPrompt } from './pages/EditPrompt';
import { ForkPrompt } from './pages/ForkPrompt';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Guides } from './pages/Guides';
import PromptDetail from './pages/PromptDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-prompt" element={<CreatePrompt />} />
        <Route path="/prompt/:id/edit" element={<EditPrompt />} />
        <Route path="/prompt/:id/fork" element={<ForkPrompt />} />
        <Route path="/prompt/:id" element={<PromptDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
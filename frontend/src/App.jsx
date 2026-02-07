import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FlashcardAdmin from "./pages/FlashcardAdmin";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Bites from "./pages/Bites";
import Quizzes from "./pages/Quiz";
import Favorites from "./pages/Favorites";
import TopicList from "./pages/TopicList";
import Flashcards from "./pages/Flashcards";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bites"
          element={
            <ProtectedRoute>
              <Bites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <Quizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic-bites"
          element={
            <ProtectedRoute>
              <TopicList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards/:id"
          element={
            <ProtectedRoute>
              <Flashcards />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/flashcards"
          element={
            <ProtectedRoute>
              <FlashcardAdmin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

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
import Leaderboard from "./pages/Leaderboard";
import Forum from "./pages/Forum";
import Requests from "./pages/Requests";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminRequests from "./pages/AdminRequests";
import AdminSupport from "./pages/AdminSupport";

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
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute>
              <Forum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <AdminAnalytics />
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
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute>
              <AdminRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <ProtectedRoute>
              <AdminSupport />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

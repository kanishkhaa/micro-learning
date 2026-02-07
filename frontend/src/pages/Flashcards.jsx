import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

const Flashcards = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    API.get(`/flashcards/${id}`)
      .then((res) => {
        setCards(res.data);
        setIndex(0);
        setRevealed(false);
        setCompleted(false);
        // Mark the start of this module for timing analytics
        API.post(`/progress/topic/${id}/start`).catch((err) =>
          console.log(err)
        );
      })
      .catch((err) => console.log(err));
  }, [id]);

  // Load topic list for the current main/sub so we can move
  // to the next topic when "Next Module" is clicked.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("topic");
      if (!stored) return;

      const topic = JSON.parse(stored);
      if (!topic?.main || !topic?.sub) return;

      API.get(`/topics?main=${topic.main}&sub=${topic.sub}`)
        .then((res) => setTopics(res.data))
        .catch((err) => console.log(err));
    } catch (e) {
      console.log(e);
    }
  }, []);

  if (!cards.length) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-cyan-50 to-white">
          <p className="text-2xl text-cyan-700 font-light tracking-wide">
            No flashcards found for this topic.
          </p>
        </div>
      </Layout>
    );
  }

  const card = cards[index];
  const isFirst = index === 0;
  const isLast = index === cards.length - 1;

  const handleReveal = () => setRevealed(true);

  const handleContinue = () => {
    if (isLast) {
      setCompleted(true);
      // Record module completion for progress tracking
      API.post(`/progress/topic/${id}/complete`).catch((err) =>
        console.log(err)
      );
    } else {
      setIndex(index + 1);
      setRevealed(false);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setIndex(index - 1);
      setRevealed(false);
    }
  };

  const handleReviewAgain = () => {
    setIndex(0);
    setRevealed(false);
    setCompleted(false);
  };

  const handleNextModule = () => {
    // Find the next topic (module) from the topic list
    if (!topics.length) {
      // Fallback: go back to the topic list page
      navigate("/topic-bites");
      return;
    }

    const currentIndex = topics.findIndex((t) => t._id === id);

    // If current topic not found or this is the last one,
    // send the user back to the topic list.
    if (currentIndex === -1 || currentIndex === topics.length - 1) {
      navigate("/topic-bites");
      return;
    }

    const nextTopic = topics[currentIndex + 1];
    navigate(`/flashcards/${nextTopic._id}`);
  };

  // Completion Screen
  if (completed) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
              <span className="text-6xl">🎉</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Congratulations!
            </h1>
            <p className="text-xl text-gray-600 mb-2">Module Completed</p>
            <p className="text-gray-500 mb-10">
              You’ve finished all {cards.length} flashcards in this topic.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleReviewAgain}
                className="px-10 py-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-2xl transition-all active:scale-95"
              >
                Review Again
              </button>

              <button
                onClick={handleNextModule}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-cyan-200/50 transition-all active:scale-95"
              >
                Next Module →
              </button>
            </div>

            <p className="mt-12 text-sm text-gray-400">
              Great job! Keep up the momentum.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Main Flashcard Screen
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${((index + 1) / cards.length) * 100}%` }}
              />
            </div>
            <p className="text-center mt-3 text-sm text-gray-600 font-medium">
              Question {index + 1} of {cards.length}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-10 md:p-14 min-h-[380px] md:min-h-[460px] flex flex-col">
              {/* Question */}
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed text-center mb-12">
                {card.question}
              </h2>

              {!revealed ? (
                <button
                  onClick={handleReveal}
                  className="mt-auto mx-auto px-12 py-5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-cyan-200/50 transition-all duration-300 active:scale-95"
                >
                  Reveal Answer
                </button>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-10">
                  {/* Answer */}
                  <div className="w-full p-8 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <p className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed whitespace-pre-wrap text-center">
                      {card.answer}
                    </p>
                  </div>

                  {/* Continue Button */}
                  <button
                    onClick={handleContinue}
                    className="px-16 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-cyan-200/50 transition-all active:scale-95"
                  >
                    Continue →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-12 flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`
                px-10 py-4 rounded-2xl font-medium text-lg transition-all
                ${isFirst
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-sm active:scale-95"}
              `}
            >
              ← Previous
            </button>

            {revealed && !isLast && (
              <button
                onClick={handleContinue}
                className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium text-lg rounded-2xl shadow-lg shadow-cyan-200/50 transition-all active:scale-95"
              >
                Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Flashcards;
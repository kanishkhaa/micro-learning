import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import API from "../services/api";

// Utility to shuffle an array (in-place copy)
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get("topicId");

  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Load topics list when no specific topicId (topic-wise quiz overview)
  useEffect(() => {
    if (topicId) return;

    setTopicsLoading(true);
    API.get("/topics")
      .then((res) => setTopics(res.data || []))
      .catch((err) => console.log(err))
      .finally(() => setTopicsLoading(false));
  }, [topicId]);

  // Load questions when a topic is selected
  useEffect(() => {
    if (!topicId) return;

    API.get(`/flashcards/${topicId}`)
      .then((res) => {
        const raw = res.data || [];

        const allAnswers = raw.map((c) => c.answer);

        const withOptions = raw.map((c, idx) => {
          const others = allAnswers.filter((_, i) => i !== idx);
          const distractors = shuffleArray(others).slice(0, 3);
          const opts = shuffleArray([c.answer, ...distractors]);
          return {
            ...c,
            options: opts,
          };
        });

        setQuestions(withOptions);
        setIndex(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setIsCorrect(false);
        setScore(0);
        setAnswered(0);
      })
      .catch((err) => console.log(err));
  }, [topicId]);

  const resetQuiz = () => {
    setIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setAnswered(0);
  };

  if (!topicId) {
    return (
      <Layout>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Quizzes</h2>
              <p className="text-sm text-gray-500">
                Pick a topic to take a quiz based on its flashcards.
              </p>
            </div>
          </div>

          {topicsLoading && (
            <p className="text-sm text-gray-500">Loading topics…</p>
          )}

          {!topicsLoading && topics.length === 0 && (
            <p className="text-sm text-gray-500">
              No topics available yet. Add topics and flashcards from the admin
              section.
            </p>
          )}

          {!topicsLoading && topics.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
              {topics.map((t) => (
                <button
                  key={t._id}
                  type="button"
                  onClick={() => navigate(`/quizzes?topicId=${t._id}`)}
                  className="text-left p-4 bg-white shadow rounded border border-gray-100 hover:bg-blue-50/40 transition flex flex-col gap-1"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {t.mainCategory} • {t.subCategory}
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    Module {t.order}: {t.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Start quiz for this module →
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (!questions.length) {
    return (
      <Layout>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Quiz</h2>
          <p className="text-sm text-gray-500">
            No flashcards found for this topic to build a quiz.
          </p>
        </div>
      </Layout>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const handleOptionClick = (option) => {
    if (showFeedback) return; // prevent double-answering

    setSelectedOption(option);
    const correct = option === question.answer;
    setIsCorrect(correct);
    setAnswered((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };

  const percent =
    answered > 0 ? Math.round((score / answered) * 100) : 0;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-gray-800">
            <div>
              <h2 className="text-xl font-bold">Quiz</h2>
              <p className="text-xs text-gray-500">
                Topic quiz built from this topic&apos;s flashcards
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-xs text-gray-500">
                Question {index + 1} of {questions.length}
              </p>
              <p className="text-xs text-gray-600">
                Score: {score}/{answered} ({percent}%)
              </p>
              <button
                type="button"
                onClick={resetQuiz}
                className="mt-1 inline-flex items-center justify-center px-2.5 py-1 text-[11px] rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset quiz
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-2">
                Question
              </p>
              <p className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed">
                {question.question}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Choose the correct answer from the options below.
              </p>

              <div className="grid gap-3">
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectOption = opt === question.answer;

                  let optionClasses =
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition";

                  if (!showFeedback) {
                    optionClasses +=
                      " bg-white border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 cursor-pointer";
                  } else if (isCorrectOption) {
                    optionClasses +=
                      " bg-emerald-50 border-emerald-500 text-emerald-800";
                  } else if (isSelected && !isCorrectOption) {
                    optionClasses +=
                      " bg-red-50 border-red-400 text-red-800 line-through";
                  } else {
                    optionClasses += " bg-gray-50 border-gray-200 text-gray-600";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionClick(opt)}
                      className={optionClasses}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="flex items-center justify-between text-xs mt-2">
                  <p
                    className={
                      isCorrect ? "text-emerald-600" : "text-red-600"
                    }
                  >
                    {isCorrect
                      ? "Nice! That’s the correct answer."
                      : "Not quite. Review the flashcards and try again later."}
                  </p>
                  {!isLast && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="text-cyan-700 font-semibold hover:text-cyan-900"
                    >
                      Next question →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Quiz;


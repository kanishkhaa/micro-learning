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

// Main categories and subcategories (matches Bites structure)
const MAIN_CATEGORIES = {
  Programming: ["C", "C++", "Java", "Python"],
  Technology: ["HTML", "CSS", "JavaScript", "React"],
  "CS Fundamentals": ["OS", "CN"],
  DSA: ["OOPS"],
};

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const topicId = searchParams.get("topicId");

  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [groupedTopics, setGroupedTopics] = useState({}); // Nested: main -> sub -> topics

  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0); // Gamification: current streak
  const [maxStreak, setMaxStreak] = useState(0); // Gamification: max streak
  const [timer, setTimer] = useState(30); // Gamification: 30s timer per question
  const [timerId, setTimerId] = useState(null);

  // Load all topics
  useEffect(() => {
    setTopicsLoading(true);
    API.get("/topics")
      .then((res) => {
        const data = res.data || [];
        setTopics(data);

        // Group topics by mainCategory > subCategory > topics
        const grouped = {};
        data.forEach((t) => {
          if (!grouped[t.mainCategory]) grouped[t.mainCategory] = {};
          if (!grouped[t.mainCategory][t.subCategory]) grouped[t.mainCategory][t.subCategory] = [];
          grouped[t.mainCategory][t.subCategory].push(t);
        });
        setGroupedTopics(grouped);
      })
      .catch((err) => console.log(err))
      .finally(() => setTopicsLoading(false));
  }, []);

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

        setQuestions(shuffleArray(withOptions)); // Shuffle questions for variety
        setIndex(0);
        setSelectedOption(null);
        setShowFeedback(false);
        setIsCorrect(false);
        setScore(0);
        setAnswered(0);
        setStreak(0);
        setMaxStreak(0);
        setTimer(30);
      })
      .catch((err) => console.log(err));
  }, [topicId]);

  // Timer effect for gamification
  useEffect(() => {
    if (timer > 0 && !showFeedback && questions.length > 0 && index < questions.length) {
      const id = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      setTimerId(id);
      return () => clearTimeout(id);
    } else if (timer === 0 && !showFeedback && questions.length > 0 && index < questions.length) {
      // Time up: treat as incorrect (don't call handleOptionClick - it returns early when timer=0)
      setSelectedOption("__timeup__");
      setIsCorrect(false);
      setAnswered((prev) => prev + 1);
      setStreak(0);
      setShowFeedback(true);
    }
  }, [timer, showFeedback, questions.length, index]);

  const resetQuiz = () => {
    setIndex(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setScore(0);
    setAnswered(0);
    setStreak(0);
    setMaxStreak(0);
    setTimer(30);
    clearTimeout(timerId);
  };

  const goBack = () => {
    if (selectedSubCategory) {
      setSelectedSubCategory(null);
    } else if (selectedMainCategory) {
      setSelectedMainCategory(null);
    } else {
      navigate("/quizzes"); // Or wherever
    }
  };

  // Render main categories if no selection
  const MAIN_ICONS = { Programming: "💻", Technology: "🌐", "CS Fundamentals": "📚", DSA: "🧩" };
  if (!topicId && !selectedMainCategory) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">🎯 Quiz Arena</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Pick a category, then a sub-topic, and challenge yourself! Earn streaks and beat the clock.
              </p>
            </div>

            {topicsLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-pulse flex gap-4">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-28 w-40 bg-gray-200 rounded-2xl" />
                  ))}
                </div>
              </div>
            )}

            {!topicsLoading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(MAIN_CATEGORIES).map((main) => (
                  <button
                    key={main}
                    type="button"
                    onClick={() => setSelectedMainCategory(main)}
                    className="text-left p-6 bg-white shadow-lg rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col gap-2 group"
                  >
                    <span className="text-3xl mb-1">{MAIN_ICONS[main] || "📂"}</span>
                    <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700">{main}</p>
                    <p className="text-xs text-gray-500">
                      {MAIN_CATEGORIES[main].join(", ")}
                    </p>
                    <p className="text-xs text-blue-600 mt-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Pick & play →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Render subcategories if main selected but no sub
  if (!topicId && selectedMainCategory && !selectedSubCategory) {
    const subs = MAIN_CATEGORIES[selectedMainCategory] || [];

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 rounded-xl bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md font-medium text-sm flex items-center gap-1 transition-all"
              >
                ← Back
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedMainCategory} → Choose topic</h2>
            </div>
            <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
              Select a sub-topic to see modules and start your quiz challenge!
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {subs.map((sub) => {
                const moduleCount = groupedTopics[selectedMainCategory]?.[sub]?.length || 0;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubCategory(sub)}
                    className="text-left p-5 bg-white shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 flex flex-col gap-2 group"
                  >
                    <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700">{sub}</p>
                    <p className="text-xs text-gray-500">
                      {moduleCount} module{moduleCount !== 1 ? "s" : ""} available
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Select & quiz →
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Render modules if sub selected
  if (!topicId && selectedMainCategory && selectedSubCategory) {
    const modules = groupedTopics[selectedMainCategory]?.[selectedSubCategory] || [];

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 rounded-xl bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md font-medium text-sm flex items-center gap-1 transition-all"
              >
                ← {selectedMainCategory}
              </button>
              <h2 className="text-2xl font-bold text-gray-900">{selectedSubCategory} → Modules</h2>
            </div>
            <p className="text-center text-sm text-gray-500 max-w-md mx-auto">
              Pick a module and start your quiz! Beat the clock and keep your streak. 🔥
            </p>

            {modules.length === 0 ? (
              <div className="text-center py-12 bg-white/60 rounded-2xl border border-gray-100">
                <p className="text-gray-500 mb-2">No modules in this subcategory yet.</p>
                <p className="text-xs text-gray-400">Add flashcards from the admin section.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => navigate(`/quizzes?topicId=${t._id}`)}
                    className="text-left p-5 bg-white shadow-lg rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:bg-indigo-50/30 transition-all duration-200 flex flex-col gap-2 group"
                  >
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      Module {t.order}
                    </span>
                    <p className="font-semibold text-gray-900 text-base group-hover:text-indigo-700">
                      {t.name}
                    </p>
                    <p className="text-xs text-indigo-600 mt-1 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Start quiz →
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  if (!questions.length) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center py-12 bg-white/80 rounded-2xl border-2 border-gray-100">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No quiz available</h2>
              <p className="text-sm text-gray-500 mb-6">
                No flashcards found for this topic. Add flashcards from the admin section.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedMainCategory(null);
                  setSelectedSubCategory(null);
                  navigate("/quizzes");
                }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                ← Back to Quiz Arena
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const handleOptionClick = (option) => {
    if (showFeedback || timer === 0) return;

    clearTimeout(timerId);
    setSelectedOption(option);
    const correct = option === question.answer;
    setIsCorrect(correct);
    setAnswered((prev) => prev + 1);
    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setMaxStreak((max) => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
      setIsCorrect(false);
      setTimer(30); // Reset timer
    }
  };

  const percent = answered > 0 ? Math.round((score / answered) * 100) : 0;
  const progress = Math.round(((index + 1) / questions.length) * 100);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-gray-800">
            <div>
              <h2 className="text-2xl font-bold">🎯 Quiz Challenge</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Beat the clock · Keep your streak!
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-gray-200 shadow-sm">
                <span className="text-xs font-semibold text-gray-600">{index + 1}/{questions.length}</span>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-semibold text-blue-600">{score}/{answered} ({percent}%)</span>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-semibold text-amber-800">Streak: {streak}</span>
                <span className="text-[10px] text-amber-600">(max {maxStreak})</span>
              </div>
              <button
                type="button"
                onClick={resetQuiz}
                className="px-3 py-1.5 rounded-xl text-[11px] font-medium border border-gray-200 bg-white/80 text-gray-600 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600 mb-2">
                  Question
                </p>
                <p className="text-lg sm:text-xl font-medium text-gray-900 leading-relaxed">
                  {question.question}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Time left:</p>
                <p className={`text-lg font-bold ${timer <= 10 ? "text-red-600" : "text-gray-900"}`}>
                  {timer}s
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Select the correct answer – Beat the clock!
              </p>

              <div className="grid gap-3">
                {question.options.map((opt) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectOption = opt === question.answer;

                  let optionClasses =
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition shadow-md";

                  if (!showFeedback) {
                    optionClasses +=
                      " bg-white border-gray-200 hover:border-cyan-500 hover:bg-cyan-50 cursor-pointer hover:shadow-lg";
                  } else if (isCorrectOption) {
                    optionClasses +=
                      " bg-emerald-100 border-emerald-500 text-emerald-800 shadow-emerald-200";
                  } else if (isSelected && !isCorrectOption) {
                    optionClasses +=
                      " bg-red-100 border-red-400 text-red-800 line-through shadow-red-200";
                  } else {
                    optionClasses += " bg-gray-50 border-gray-200 text-gray-600";
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionClick(opt)}
                      disabled={showFeedback || timer === 0}
                      className={optionClasses}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <div className="flex items-center justify-between text-xs mt-4 p-4 bg-gray-50 rounded-xl">
                  <p
                    className={`font-semibold ${isCorrect ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {isCorrect
                      ? "Awesome! Correct! 🎉 Keep the streak going!"
                      : "Oops! That's not right. Streak broken. Try again! 💪"}
                  </p>
                  {!isLast && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="text-cyan-700 font-semibold hover:text-cyan-900"
                    >
                      Next Challenge →
                    </button>
                  )}
                </div>
              )}

              {isLast && showFeedback && (
                <div className="text-center space-y-6 mt-8 p-6 bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl border-2 border-emerald-100">
                  <div className="text-5xl">🏆</div>
                  <h3 className="text-2xl font-bold text-gray-900">Quiz Complete!</h3>
                  <div className="flex flex-wrap justify-center gap-4 text-sm">
                    <span className="px-4 py-2 rounded-xl bg-white/80 border border-gray-200 font-semibold">
                      Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-amber-100 border border-amber-200 font-semibold text-amber-800">
                      Max Streak: {maxStreak} 🔥
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.round((score / questions.length) * 100) >= 80 ? "Outstanding! You crushed it! 🎉" : "Good effort! Review the flashcards and try again."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMainCategory(null);
                      setSelectedSubCategory(null);
                      navigate("/quizzes");
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    Back to Quiz Arena
                  </button>
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
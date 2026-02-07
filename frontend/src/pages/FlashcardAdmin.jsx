import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const AdminPanel = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({ mainCategory: "", subCategory: "", name: "", order: 1, _id: null });
  const [flashcards, setFlashcards] = useState([]);
  const [flashForm, setFlashForm] = useState({ question: "", answer: "", editId: null });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  // Load all topics
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const res = await API.get("/topics");
      setTopics(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Load flashcards for selected topic
  useEffect(() => {
    if (!selectedTopic) return;
    loadFlashcards(selectedTopic._id);
  }, [selectedTopic]);

  const loadFlashcards = async (topicId) => {
    try {
      const res = await API.get(`/flashcards/${topicId}`);
      setFlashcards(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Add/Edit Topic
  const handleTopicSubmit = async (e) => {
    e.preventDefault();
    try {
      if (topicForm._id) {
        const res = await API.put(`/topics/${topicForm._id}`, topicForm);
        setTopics(topics.map(t => t._id === res.data._id ? res.data : t));
        setMessage("Topic updated successfully!");
      } else {
        const res = await API.post("/topics", topicForm);
        setTopics([...topics, res.data]);
        setMessage("Topic added successfully!");
      }
      setTopicForm({ mainCategory: "", subCategory: "", name: "", order: 1, _id: null });
    } catch (err) {
      console.log(err);
      setMessage("Error saving topic");
    }
  };

  // Add/Edit Flashcard
  const handleFlashSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTopic) return setMessage("Select a topic first");
    try {
      if (flashForm.editId) {
        const res = await API.put(`/flashcards/${flashForm.editId}`, { question: flashForm.question, answer: flashForm.answer });
        setFlashcards(flashcards.map(f => f._id === res.data._id ? res.data : f));
        setMessage("Flashcard updated!");
      } else {
        const res = await API.post("/flashcards", { topicId: selectedTopic._id, question: flashForm.question, answer: flashForm.answer });
        setFlashcards([...flashcards, res.data]);
        setMessage("Flashcard added!");
      }
      setFlashForm({ question: "", answer: "", editId: null });
    } catch (err) {
      console.log(err);
      setMessage("Error saving flashcard");
    }
  };

  // Delete Topic
  const handleDeleteTopic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) return;
    try {
      await API.delete(`/topics/${id}`);
      setTopics(topics.filter(t => t._id !== id));
      if (selectedTopic?._id === id) setSelectedTopic(null);
      setMessage("Topic deleted!");
    } catch (err) {
      console.log(err);
      setMessage("Error deleting topic");
    }
  };

  // Delete Flashcard
  const handleDeleteFlash = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flashcard?")) return;
    try {
      await API.delete(`/flashcards/${id}`);
      setFlashcards(flashcards.filter(f => f._id !== id));
      setMessage("Flashcard deleted!");
    } catch (err) {
      console.log(err);
      setMessage("Error deleting flashcard");
    }
  };

  // Upload JSON (Topics or Flashcards)
  const handleFileUpload = async (e, type) => {
    e.preventDefault();
    if (!file) return alert("Select a JSON file first");
    if (type === "flashcards" && !selectedTopic) return alert("Select a topic first");

    const formData = new FormData();
    formData.append("file", file);
    if (type === "flashcards") formData.append("topicId", selectedTopic._id);

    try {
      const url = type === "topics" ? "/topics/upload" : "/flashcards/upload";
      const res = await API.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setMessage(`${type === "topics" ? "Topics" : "Flashcards"} uploaded: ${res.data.count}`);
      if (type === "topics") loadTopics();
      else loadFlashcards(selectedTopic._id);
      setFile(null);
    } catch (err) {
      console.log(err);
      setMessage(`Error uploading ${type}`);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Admin Panel</h2>

        {message && <div className="mb-4 text-center text-green-600 font-semibold">{message}</div>}

        {/* ===== Bulk Upload Topics JSON ===== */}
        <div className="mb-6 border p-4 rounded shadow-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-2">Bulk Upload Topics (JSON)</h3>
          <form className="flex gap-2" onSubmit={(e) => handleFileUpload(e, "topics")}>
            <input type="file" accept=".json" onChange={e => setFile(e.target.files[0])} required className="border p-2 rounded"/>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Upload Topics</button>
          </form>
        </div>

        {/* ===== Topics Section ===== */}
        <div className="mb-6 border p-4 rounded shadow-lg bg-gray-50">
          <h3 className="text-xl font-bold mb-2">Topics Management</h3>
          <form className="flex flex-wrap gap-2 mb-4" onSubmit={handleTopicSubmit}>
            <input placeholder="Main Category" className="border p-2 rounded flex-1" value={topicForm.mainCategory} onChange={e => setTopicForm({ ...topicForm, mainCategory: e.target.value })} required />
            <input placeholder="Sub Category" className="border p-2 rounded flex-1" value={topicForm.subCategory} onChange={e => setTopicForm({ ...topicForm, subCategory: e.target.value })} required />
            <input placeholder="Topic Name" className="border p-2 rounded flex-2" value={topicForm.name} onChange={e => setTopicForm({ ...topicForm, name: e.target.value })} required />
            <input type="number" placeholder="Order" className="border p-2 rounded w-24" value={topicForm.order} onChange={e => setTopicForm({ ...topicForm, order: Number(e.target.value) })} required />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{topicForm._id ? "Update" : "Add"}</button>
          </form>

          <div className="space-y-2">
            {topics.map(t => (
              <div key={t._id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                <span className="font-medium">{t.mainCategory} → {t.subCategory} → {t.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => setTopicForm(t)} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
                  <button onClick={() => handleDeleteTopic(t._id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                  <button onClick={() => setSelectedTopic(t)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Select</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Flashcards Section ===== */}
        {selectedTopic && (
          <div className="border p-4 rounded shadow-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-2">Flashcards for: {selectedTopic.name}</h3>

            {/* Upload JSON */}
            <form className="flex gap-2 mb-4" onSubmit={(e) => handleFileUpload(e, "flashcards")}>
              <input type="file" accept=".json" onChange={e => setFile(e.target.files[0])} required className="border p-2 rounded"/>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Upload Flashcards JSON</button>
            </form>

            {/* Add/Edit Flashcard */}
            <form className="flex flex-col gap-2 mb-4" onSubmit={handleFlashSubmit}>
              <textarea placeholder="Question" className="border p-2 rounded" value={flashForm.question} onChange={e => setFlashForm({ ...flashForm, question: e.target.value })} required />
              <textarea placeholder="Answer" className="border p-2 rounded" value={flashForm.answer} onChange={e => setFlashForm({ ...flashForm, answer: e.target.value })} required />
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{flashForm.editId ? "Update" : "Add"} Flashcard</button>
            </form>

            {/* Flashcards List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {flashcards.map(f => (
                <div key={f._id} className="bg-white p-2 rounded shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{f.question}</p>
                    <p className="text-gray-600">{f.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setFlashForm({ question: f.question, answer: f.answer, editId: f._id })} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500">Edit</button>
                    <button onClick={() => handleDeleteFlash(f._id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPanel;

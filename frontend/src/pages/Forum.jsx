import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", description: "" });
  const [newReply, setNewReply] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/forum/posts");
      setPosts(res.data || []);
    } catch (err) {
      console.log(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostWithReplies = async (postId) => {
    try {
      const res = await API.get(`/forum/posts/${postId}`);
      setSelectedPost(res.data.post);
      setReplies(res.data.replies || []);
    } catch (err) {
      console.log(err);
      setSelectedPost(null);
      setReplies([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.description.trim()) return;
    try {
      await API.post("/forum/posts", newPost);
      setNewPost({ title: "", description: "" });
      await fetchPosts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateReply = async (e) => {
    e.preventDefault();
    if (!selectedPost || !newReply.trim()) return;
    try {
      await API.post(`/forum/posts/${selectedPost._id}/replies`, {
        message: newReply,
      });
      setNewReply("");
      await fetchPostWithReplies(selectedPost._id);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
        <div className="p-6 lg:p-8 grid lg:grid-cols-3 gap-6">
          {/* Left: posts list + create */}
          <div className="space-y-4 lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                💬 Discussion Forum
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Ask questions and discuss topics with other learners.
              </p>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2"
            >
              <p className="text-xs font-semibold text-gray-600">
                Start a new discussion
              </p>
              <input
                type="text"
                placeholder="Title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                rows={3}
                placeholder="Describe your question or topic..."
                value={newPost.description}
                onChange={(e) =>
                  setNewPost((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                Post
              </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                Recent posts
              </div>
              {loading && (
                <div className="p-4 text-xs text-gray-400">Loading posts…</div>
              )}
              {!loading && posts.length === 0 && (
                <div className="p-4 text-xs text-gray-500">
                  No posts yet. Be the first to ask a question!
                </div>
              )}
              <div className="max-h-[360px] overflow-y-auto">
                {posts.map((p) => (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => fetchPostWithReplies(p._id)}
                    className={`w-full px-4 py-3 text-left border-t border-gray-100 hover:bg-slate-50 ${
                      selectedPost?._id === p._id ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {p.userId?.name || "Anonymous"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: selected post + replies */}
          <div className="lg:col-span-2">
            {!selectedPost ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-gray-400">
                  Select a post from the left to view the discussion.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPost.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedPost.userId?.name || "Anonymous"} ·{" "}
                    {new Date(selectedPost.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">
                    {selectedPost.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3 max-h-[320px] overflow-y-auto">
                  {replies.length === 0 && (
                    <p className="text-xs text-gray-400">
                      No replies yet. Start the conversation!
                    </p>
                  )}
                  {replies.map((r) => (
                    <div
                      key={r._id}
                      className="text-sm text-gray-800 bg-slate-50 rounded-xl px-3 py-2"
                    >
                      <p className="font-semibold text-xs text-gray-700 mb-0.5">
                        {r.userId?.name || "Anonymous"} ·{" "}
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                      <p className="whitespace-pre-wrap text-[13px]">
                        {r.message}
                      </p>
                    </div>
                  ))}
                </div>

                {!selectedPost.isLocked && (
                  <form
                    onSubmit={handleCreateReply}
                    className="border-t border-gray-100 pt-3 space-y-2"
                  >
                    <textarea
                      rows={2}
                      placeholder="Write a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Reply
                    </button>
                  </form>
                )}
                {selectedPost.isLocked && (
                  <p className="text-xs text-red-500 border-t border-gray-100 pt-3">
                    This post has been locked by an admin. No new replies are
                    allowed.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Forum;


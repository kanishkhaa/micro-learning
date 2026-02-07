import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const TopicBites = () => {
  const [bites, setBites] = useState([]);

  const topic = JSON.parse(localStorage.getItem("topic"));

  useEffect(() => {
    API.get(`/bites?main=${topic.main}&sub=${topic.sub}`)
      .then(res => setBites(res.data));
  }, []);

  return (
    <Layout>
      <div className="p-6">

        <h2 className="text-xl font-bold mb-4">
          {topic.sub} Concepts
        </h2>

        {bites.length === 0 && (
          <p>No content added yet</p>
        )}

        {bites.map(b => (
          <div
            key={b._id}
            className="bg-white p-4 mb-3 rounded shadow"
          >
            <h3 className="font-bold">
              {b.title}
            </h3>

            <p className="text-gray-600 mt-1">
              {b.content}
            </p>
          </div>
        ))}

      </div>
    </Layout>
  );
};

export default TopicBites;

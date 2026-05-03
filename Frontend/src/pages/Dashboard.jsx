import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);

  const { accessToken } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/user/dashboard",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        setGithubData(response.data.github);
        setLeetcodeData(response.data.leetcode);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <p>DASHBOARD IS LOADING....</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>YOUR DASHBOARD</h1>

      {githubData && (
        <div>
          <h2>Github</h2>
          <img src={githubData.avatar} />
          <p>TotalRepos : {githubData.publicRepos} </p>
          <p>Stars : {githubData.totalStars}</p>
          <p>Forks: {githubData.totalForks} </p>
          <p>Score: {githubData.rawScore}</p>
        </div>
      )}

      {leetcodeData && (
        <div>
          <img src={leetcodeData.avatar} alt="avatar" width={60} />
          <p>Total Solved: {leetcodeData.totalSolved}</p>
          <p>Easy: {leetcodeData.easy}</p>
          <p>Medium: {leetcodeData.medium}</p>
          <p>Hard: {leetcodeData.hard}</p>
          <p>Score: {leetcodeData.rawScore}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

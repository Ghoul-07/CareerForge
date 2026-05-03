import userModel from "../../models/user.model.js";
import axios from 'axios'
import { config } from "../../config/config.js";
import resumeAnalysisModel from "../../models/resumeAnalysis.model.js";

// ─── LeetCode GraphQL ─────────────────────────────────────────────────────────

const SOLVED_STATS_QUERY = `
  query userSolvedStats($username: String!) {
    matchedUser(username: $username) {
      profile {
        userAvatar
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

async function fetchLeetCode(username) {
  try {
    
    const { data } = await axios.post(
      "https://leetcode.com/graphql",
      { query: SOLVED_STATS_QUERY, variables: { username } },
      {
        headers: {
          "Content-Type": "application/json",
          Referer: "https://leetcode.com",
          "User-Agent": "Mozilla/5.0 (compatible; profile-analyzer/1.0)",
        },
      }
    );

    if (data.errors || !data.data.matchedUser) return null;

    const { profile, submitStatsGlobal } = data.data.matchedUser;
    const subs = submitStatsGlobal.acSubmissionNum;

    const easy   = subs.find((s) => s.difficulty === "Easy")?.count   ?? 0;
    const medium = subs.find((s) => s.difficulty === "Medium")?.count ?? 0;
    const hard   = subs.find((s) => s.difficulty === "Hard")?.count   ?? 0;
    const total  = subs.find((s) => s.difficulty === "All")?.count    ?? 0;

    return {
      avatar:      profile.userAvatar || null,
      totalSolved: total,
      easy,
      medium,
      hard,
      rawScore:    easy * 1 + medium * 3 + hard * 5,
    };
  } catch {
    return null;
  }
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

async function fetchGitHub(username) {
  
  try {
     
    const [{ data: ghUser }, { data: repos }] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, {
        headers: { 
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.GITHUB_TOKEN}`
        },
      }),
      
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: { 
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${config.GITHUB_TOKEN}`
        },
      }),
    ]);

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    return {
      avatar:      ghUser.avatar_url || null,
      publicRepos: ghUser.public_repos || 0,
      followers:   ghUser.followers || 0,
      totalStars,
      totalForks,
      rawScore:    totalStars * 3 + totalForks * 2 + ghUser.public_repos + ghUser.followers * 2,
    };
  } catch {
    return null;
  }
}

export async function getDashboard(req, res){
  try{
    const user = await userModel.findById(req.user._id)

    const {githubUsername, leetcodeUsername} = user

    if(!githubUsername && !leetcodeUsername){
      return res.status(400).json({message:"No profiles connected"})
    }

    const [githubData, leetcodeData, resumeAnalysis] = await Promise.all([
      githubUsername? fetchGitHub(githubUsername) : null,
      leetcodeUsername? fetchLeetCode(leetcodeUsername) : null,
      resumeAnalysisModel.findOne({user: req.user._id}).sort({createdAt: -1})
    ])

    res.status(200).json({
      message:"Dashboard data fetched",
      github: githubData,
      leetcode: leetcodeData,
      resumeAnalysis : resumeAnalysis ? {
        atsScore: resumeAnalysis.atsScore,
        analyzedAt: resumeAnalysis.updatedAt
      } : null
    })

  } catch(err){
    return res.status(500).json({message: "internal server error"})
  }
}
import userModel from "../../models/user.model.js";
import axios from 'axios'
import { config } from "../../config/config.js";
import resumeAnalysisModel from "../../models/resumeAnalysis.model.js";
import interviewSessionModel from '../../models/interviewSession.model.js'

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
    };
  } catch {
    return null;
  }
}

export async function getDashboard(req, res){
  try{
    const user = await userModel.findById(req.user._id)

    const {githubUsername, leetcodeUsername} = user

    
    const [githubData, leetcodeData, resumeSessions, interviews] = await Promise.all([
      githubUsername? fetchGitHub(githubUsername) : null,
      leetcodeUsername? fetchLeetCode(leetcodeUsername) : null,
      resumeAnalysisModel.find({user: req.user._id}),
      interviewSessionModel.find({user: req.user._id}).sort({createdAt: -1})
    ])


    // Resume stats

    const allResults = resumeSessions.flatMap((session) => session.results || [])
    
    const totalAtsScore = allResults.reduce((sum, result) => sum + (result.atsScore || 0), 0)

    const averageAtsScore = allResults.length > 0 ? Math.round(totalAtsScore / allResults.length) : 0;

    const bestAtsScore = allResults.length > 0 ? Math.max(...allResults.map((result) => result.atsScore || 0)) : 0;


    // Interview stats
    const completedInterviews = interviews.filter(
      (interview) => interview.status === "finished"
    );

    const inProgressInterviews = interviews.filter(
      (interview) => interview.status === "in_progress"
    );

    const totalOverallScore = completedInterviews.reduce(
      (sum, interview) => sum + (interview.finalReport?.overallScore || 0),
      0
    );

    const totalTechnicalScore = completedInterviews.reduce(
      (sum, interview) => sum + (interview.finalReport?.technicalScore || 0),
      0
    );

    const totalCommunicationScore = completedInterviews.reduce(
      (sum, interview) => sum + (interview.finalReport?.communicationScore || 0),
      0
    );

    const averageOverallScore =
      completedInterviews.length > 0
        ? Math.round(totalOverallScore / completedInterviews.length)
        : 0;

    const averageTechnicalScore =
      completedInterviews.length > 0
        ? Math.round(totalTechnicalScore / completedInterviews.length)
        : 0;

    const averageCommunicationScore =
      completedInterviews.length > 0
        ? Math.round(totalCommunicationScore / completedInterviews.length)
        : 0;

    const scoreTrend = completedInterviews.map((interview) => ({
      date: interview.createdAt,
      role: interview.role,
      overallScore: interview.finalReport?.overallScore || 0,
      technicalScore: interview.finalReport?.technicalScore || 0,
      communicationScore: interview.finalReport?.communicationScore || 0,
    }));

    // Weak area frequency
    const weakAreaMap = {};

    completedInterviews.forEach((interview) => {
      interview.finalReport?.weakAreas?.forEach((area) => {
        weakAreaMap[area] = (weakAreaMap[area] || 0) + 1;
      });
    });

    const weakAreaFrequency = Object.entries(weakAreaMap)
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      message: "Dashboard data fetched",

      github: githubData,
      leetcode: leetcodeData,

      resumeStats: {
        totalSessions: resumeSessions.length,
        totalResults: allResults.length,
        averageAtsScore,
        bestAtsScore,
      },

      interviewStats: {
        totalInterviews: interviews.length,
        completedInterviews: completedInterviews.length,
        inProgressInterviews: inProgressInterviews.length,
        averageOverallScore,
        averageTechnicalScore,
        averageCommunicationScore,
        scoreTrend,
        weakAreaFrequency,
      },
    });

  } catch(err){
    
    return res.status(500).json({message: "internal server error"})
  }
}
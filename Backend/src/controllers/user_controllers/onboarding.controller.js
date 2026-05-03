import userModel from '../../models/user.model.js'
import axios from 'axios'
import { config } from '../../config/config.js'

async function verifyGithub(githubUsername){

  try{
    const response = await axios.get(`https://api.github.com/users/${githubUsername}` ,{
      headers : {Authorization: `Bearer ${config.GITHUB_TOKEN}`}
    })
    return true
  }
  catch{
    return false
  }
}
async function verifyLeetcode(username) {
  try{
    const response  = await axios.post('https://leetcode.com/graphql', 
      {
        query: `
        query getUser($username: String!){
          matchedUser(username: $username){
            username
          }
        }`,
        variables: {username}
      },
      {
        headers:{
          'Content-Type' :'application/json',
           Referer: 'https://leetcode.com',
          'User-Agent':'Mozilla/5.0'
        }
      }
    )

    return response.data.data.matchedUser !== null
  }
  catch{
    return false;
  }
}

export async function storeUserProfiles(req, res) {
  const {githubUsername, leetcodeUsername} = req.body

  if(!githubUsername || !leetcodeUsername){
    return res.status(400).json({message:"Both profiles are required"})
  }

  const [isGithubValid, isLeetcodeValid] = await Promise.all([
    githubUsername ? verifyGithub(githubUsername) : false,
    leetcodeUsername? verifyLeetcode(leetcodeUsername) : false
  ])

  if(githubUsername && !isGithubValid){
    return res.status(400).json({message:"Github profile doesn't exist"})
  }
  if(leetcodeUsername && !isLeetcodeValid){
    return res.status(400).json({message:"Leetcode profile doesn't exist"})
  }

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    {
      githubUsername, leetcodeUsername
    },
    {new : true}
  ).select('-password')

  res.status(200).json({
    message:"Profiles successfully stored",
    user:{
      username: user.username,
      email : user.email,
      githubUsername: user.githubUsername,
      leetcodeUsername: user.leetcodeUsername
    }
  })
}


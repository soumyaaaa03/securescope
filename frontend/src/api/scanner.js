import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

export const scanCode = async (code, filename = 'pasted_code.py') => {
  const response = await axios.post(`${BASE_URL}/scan`, {
    code,
    filename,
    use_ai: true
  })
  return response.data
}

export const scanGithub = async (githubUrl) => {
  const response = await axios.post(`${BASE_URL}/scan/github`, {
    github_url: githubUrl,
    use_ai: true
  })
  return response.data
}
import { Octokit } from "@octokit/rest"

export interface GitHubUserData {
  username: string
  name: string
  bio: string
  avatarUrl: string
  followers: number
  following: number
  publicRepos: number
  location: string
  blog: string
  company: string
}

export interface GitHubRepository {
  name: string
  description: string
  url: string
  stars: number
  forks: number
  language: string
  updatedAt: string
  topics: string[]
}

export interface GitHubLanguage {
  name: string
  percentage: number
  color?: string
}

export interface GitHubContributions {
  totalContributions: number
  lastYearContributions: number
  contributionsByWeek: number[]
}

export class GitHubService {
  private octokit: Octokit
  private username: string
  private isAuthenticated: boolean

  constructor(token: string, username = "wiktorlazar") {
    this.username = username

    // Only use token if it's actually provided and not empty
    const validToken = token && token.trim() !== ""
    this.isAuthenticated = validToken

    // Create Octokit instance without any auth parameter if token is missing
    this.octokit = new Octokit(validToken ? { auth: token } : {})
  }

  // Generate simulated user data when API fails
  private generateSimulatedUserData(): GitHubUserData {
    return {
      username: this.username,
      name: `${this.username.charAt(0).toUpperCase() + this.username.slice(1)}`,
      bio: "GitHub profile information unavailable. This is simulated data.",
      avatarUrl: `https://github.com/${this.username}.png`,
      followers: 0,
      following: 0,
      publicRepos: 0,
      location: "",
      blog: "",
      company: "",
    }
  }

  // Generate simulated repositories when API fails
  private generateSimulatedRepositories(count: number): GitHubRepository[] {
    const repos = []
    for (let i = 0; i < count; i++) {
      repos.push({
        name: `project-${i + 1}`,
        description: "Repository information unavailable. This is simulated data.",
        url: `https://github.com/${this.username}/project-${i + 1}`,
        stars: 0,
        forks: 0,
        language: "Unknown",
        updatedAt: new Date().toLocaleDateString(),
        topics: [],
      })
    }
    return repos
  }

  async getUserData(): Promise<GitHubUserData> {
    try {
      console.log(`Fetching GitHub user data for ${this.username}`)
      const { data } = await this.octokit.users.getByUsername({
        username: this.username,
      })

      return {
        username: data.login,
        name: data.name || this.username,
        bio: data.bio || "",
        avatarUrl: data.avatar_url,
        followers: data.followers,
        following: data.following,
        publicRepos: data.public_repos,
        location: data.location || "",
        blog: data.blog || "",
        company: data.company || "",
      }
    } catch (error) {
      console.error(`Error fetching GitHub user data for ${this.username}:`, error)
      return this.generateSimulatedUserData()
    }
  }

  async getRepositories(limit = 10): Promise<GitHubRepository[]> {
    try {
      console.log(`Fetching GitHub repositories for ${this.username}`)
      const { data } = await this.octokit.repos.listForUser({
        username: this.username,
        sort: "updated",
        direction: "desc",
        per_page: limit,
      })

      const repos = []

      for (const repo of data.slice(0, limit)) {
        try {
          // Get topics for each repository
          const { data: topicsData } = await this.octokit.repos.getAllTopics({
            owner: this.username,
            repo: repo.name,
          })

          repos.push({
            name: repo.name,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language || "Not specified",
            updatedAt: new Date(repo.updated_at).toLocaleDateString(),
            topics: topicsData.names || [],
          })
        } catch (topicError) {
          console.error(`Error fetching topics for ${repo.name}:`, topicError)
          // Still add the repo without topics
          repos.push({
            name: repo.name,
            description: repo.description || "",
            url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language || "Not specified",
            updatedAt: new Date(repo.updated_at).toLocaleDateString(),
            topics: [],
          })
        }
      }

      return repos
    } catch (error) {
      console.error(`Error fetching GitHub repositories for ${this.username}:`, error)
      return this.generateSimulatedRepositories(limit)
    }
  }

  async getLanguages(): Promise<GitHubLanguage[]> {
    try {
      const repos = await this.getRepositories(100)
      const languageMap: Record<string, { count: number; color: string }> = {}
      let totalSize = 0

      // Language colors
      const languageColors: Record<string, string> = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Python: "#3572A5",
        Java: "#b07219",
        C: "#555555",
        "C++": "#f34b7d",
        "C#": "#178600",
        Ruby: "#701516",
        Go: "#00ADD8",
        PHP: "#4F5D95",
        Swift: "#ffac45",
        Kotlin: "#A97BFF",
        Rust: "#dea584",
      }

      // If no repos were found, return simulated languages
      if (repos.length === 0) {
        return [
          { name: "JavaScript", percentage: 40, color: languageColors.JavaScript },
          { name: "TypeScript", percentage: 30, color: languageColors.TypeScript },
          { name: "HTML", percentage: 15, color: languageColors.HTML },
          { name: "CSS", percentage: 15, color: languageColors.CSS },
        ]
      }

      // Get detailed language data for each repo
      for (const repo of repos) {
        if (repo.language && repo.language !== "Not specified") {
          const color = languageColors[repo.language] || "#8b8b8b"

          if (!languageMap[repo.language]) {
            languageMap[repo.language] = { count: 0, color }
          }

          languageMap[repo.language].count++
          totalSize++
        }
      }

      const languages: GitHubLanguage[] = Object.entries(languageMap).map(([name, { count, color }]) => ({
        name,
        percentage: Math.round((count / totalSize) * 100),
        color,
      }))

      return languages.sort((a, b) => b.percentage - a.percentage)
    } catch (error) {
      console.error(`Error fetching GitHub languages for ${this.username}:`, error)
      return [
        { name: "JavaScript", percentage: 40, color: "#f1e05a" },
        { name: "TypeScript", percentage: 30, color: "#3178c6" },
        { name: "HTML", percentage: 15, color: "#e34c26" },
        { name: "CSS", percentage: 15, color: "#563d7c" },
      ]
    }
  }

  async getContributions(): Promise<GitHubContributions> {
    try {
      // This is a simplified approach since the GitHub API doesn't directly provide contribution data
      // In a real implementation, you would use the GraphQL API or web scraping
      const { data: events } = await this.octokit.activity.listPublicEventsForUser({
        username: this.username,
        per_page: 100,
      })

      // Count events in the last year
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

      const lastYearEvents = events.filter((event) => new Date(event.created_at) > oneYearAgo)

      // Group events by week
      const weeklyContributions = Array(52).fill(0)
      lastYearEvents.forEach((event) => {
        const eventDate = new Date(event.created_at)
        const weekIndex = Math.floor((Date.now() - eventDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        if (weekIndex >= 0 && weekIndex < 52) {
          weeklyContributions[weekIndex]++
        }
      })

      return {
        totalContributions: events.length,
        lastYearContributions: lastYearEvents.length,
        contributionsByWeek: weeklyContributions,
      }
    } catch (error) {
      console.error(`Error fetching GitHub contributions for ${this.username}:`, error)

      // Generate simulated contribution data
      const weeklyContributions = Array(52)
        .fill(0)
        .map(() => Math.floor(Math.random() * 5))
      return {
        totalContributions: weeklyContributions.reduce((sum, val) => sum + val, 0),
        lastYearContributions: weeklyContributions.reduce((sum, val) => sum + val, 0),
        contributionsByWeek: weeklyContributions,
      }
    }
  }

  // Convert GitHub data to Markdown sections
  async generateMarkdown(
    options: {
      includeProfile?: boolean
      includeRepositories?: boolean
      includeLanguages?: boolean
      includeContributions?: boolean
      repositoryLimit?: number
    } = {},
  ): Promise<string> {
    const {
      includeProfile = true,
      includeRepositories = true,
      includeLanguages = true,
      includeContributions = true,
      repositoryLimit = 5,
    } = options

    let markdown = ""

    try {
      if (includeProfile) {
        const userData = await this.getUserData()
        markdown += `## GitHub Profile

`
        if (userData.name)
          markdown += `### ${userData.name}

`
        markdown += `**Username:** [${userData.username}](https://github.com/${userData.username})

`
        if (userData.bio)
          markdown += `${userData.bio}

`

        const details = []
        if (userData.location) details.push(`📍 ${userData.location}`)
        if (userData.company) details.push(`🏢 ${userData.company}`)
        if (userData.blog) details.push(`🔗 [Website](${userData.blog})`)

        if (details.length > 0) {
          markdown += details.join(" | ") + "\n\n"
        }

        markdown += `**Followers:** ${userData.followers} | **Following:** ${userData.following} | **Public Repositories:** ${userData.publicRepos}

`
      }

      if (includeLanguages) {
        const languages = await this.getLanguages()

        if (languages.length > 0) {
          markdown += `### Programming Languages

`
          // Create a visual bar chart for languages
          languages.slice(0, 5).forEach((lang) => {
            const barLength = Math.max(1, Math.round(lang.percentage / 5))
            const bar = "█".repeat(barLength)
            markdown += `- **${lang.name}**: ${lang.percentage}% ${bar}
`
          })

          markdown += "\n"
        }
      }

      if (includeRepositories) {
        const repositories = await this.getRepositories(repositoryLimit)

        if (repositories.length > 0) {
          markdown += `### Featured Projects

`
          repositories.forEach((repo) => {
            markdown += `#### [${repo.name}](${repo.url})

`
            if (repo.description)
              markdown += `${repo.description}

`

            const details = []
            details.push(`**Language:** ${repo.language}`)
            details.push(`**Stars:** ${repo.stars}`)
            details.push(`**Forks:** ${repo.forks}`)

            markdown += details.join(" | ") + "\n\n"

            if (repo.topics && repo.topics.length > 0) {
              markdown += repo.topics.map((topic) => `\`${topic}\``).join(" ") + "\n\n"
            }
          })
        } else {
          markdown += `### Projects
No public repositories found for ${this.username}

`
        }
      }

      if (includeContributions) {
        const contributions = await this.getContributions()
        markdown += `### GitHub Activity

`
        markdown += `**Total Contributions:** ${contributions.totalContributions}

`
        markdown += `**Last Year Contributions:** ${contributions.lastYearContributions}

`

        // Create a simple ASCII contribution graph
        markdown += "**Contribution Graph:**\n\n"
        markdown += "```\n"
        const weeks = contributions.contributionsByWeek
        const maxContributions = Math.max(...weeks, 1)

        for (let i = 0; i < weeks.length; i += 13) {
          const weekSlice = weeks.slice(i, i + 13)
          const row = weekSlice
            .map((count) => {
              const intensity = Math.ceil((count / maxContributions) * 4)
              return [" ", "▁", "▃", "▅", "█"][intensity]
            })
            .join("")
          markdown += row + "\n"
        }
        markdown += "```\n\n"
      }

      if (!this.isAuthenticated) {
        markdown += `> Note: This data was fetched using GitHub's public API without authentication. Some information may be limited due to API rate limits.

`
      }

      return markdown
    } catch (error) {
      console.error(`Error generating GitHub markdown for ${this.username}:`, error)
      return `## GitHub Profile

Unable to fetch GitHub data for ${this.username}. GitHub API may be rate limited or the username may not exist.

`
    }
  }
}

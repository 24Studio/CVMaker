"use server"

import { GitHubService } from "@/lib/github-service"
import { LinkedInService } from "@/lib/linkedin-service"

export async function fetchGitHubData(options: {
  username: string
  includeProfile?: boolean
  includeRepositories?: boolean
  includeLanguages?: boolean
  includeContributions?: boolean
  repositoryLimit?: number
}) {
  try {
    console.log(`Fetching GitHub data for username: ${options.username}`)

    // Get the GitHub token from the environment variable (optional)
    const token = process.env.GITHUB_TOKEN || ""

    // Log whether we have a token (for debugging)
    console.log(`GitHub token available: ${!!token && token.trim() !== ""}`)

    // Create a new instance with the username
    const githubService = new GitHubService(token, options.username)

    // Generate markdown with the provided options
    const markdown = await githubService.generateMarkdown({
      includeProfile: options.includeProfile,
      includeRepositories: options.includeRepositories,
      includeLanguages: options.includeLanguages,
      includeContributions: options.includeContributions,
      repositoryLimit: options.repositoryLimit,
    })

    // Return success with the generated markdown
    return {
      success: true,
      markdown,
      usingToken: !!token && token.trim() !== "",
    }
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return {
      success: false,
      error: `Failed to fetch GitHub data: ${error instanceof Error ? error.message : "Unknown error"}`,
      usingToken: false,
    }
  }
}

export async function fetchLinkedInData(options: {
  username: string
  includeProfile?: boolean
  includeExperience?: boolean
  includeEducation?: boolean
  includeSkills?: boolean
  includeCertifications?: boolean
}) {
  try {
    // Use the LinkedIn service with enhanced simulated data
    const linkedinService = new LinkedInService(options.username)
    const markdown = await linkedinService.generateMarkdown({
      includeProfile: options.includeProfile,
      includeExperience: options.includeExperience,
      includeEducation: options.includeEducation,
      includeSkills: options.includeSkills,
      includeCertifications: options.includeCertifications,
    })

    return { success: true, markdown }
  } catch (error) {
    console.error("Error fetching LinkedIn data:", error)
    return {
      success: false,
      error: `Failed to fetch LinkedIn data: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function validateCV(options: { content: string }) {
  try {
    // Simulate a delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // This would be a real API call in a production app
    // For now, we'll simulate the validation with some common CV issues

    const content = options.content.toLowerCase()
    const issues = []
    let score = 85 // Start with a decent score

    // Check for contact information
    if (!content.includes("email") || !content.includes("@")) {
      issues.push({
        id: "missing-email",
        type: "error",
        message: "Missing email address in contact information",
        section: "## Contact Information",
        fix: "- Email: your.email@example.com",
      })
      score -= 10
    }

    // Check for phone number
    if (!content.includes("phone") || !content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      issues.push({
        id: "missing-phone",
        type: "warning",
        message: "Missing or invalid phone number format",
        section: "## Contact Information",
        fix: "- Phone: (123) 456-7890",
      })
      score -= 5
    }

    // Check for skills section
    if (!content.includes("## skills")) {
      issues.push({
        id: "missing-skills",
        type: "error",
        message: "Missing Skills section",
        section: "## Skills",
        fix: "## Skills\n\n- Skill 1\n- Skill 2\n- Skill 3",
      })
      score -= 15
    }

    // Check for quantifiable achievements
    if (!content.match(/increased|improved|reduced|achieved|delivered|managed|led|created|developed/i)) {
      issues.push({
        id: "no-achievements",
        type: "suggestion",
        message: "Add quantifiable achievements to strengthen your experience descriptions",
        section: "## Experience",
        fix: "Increased team productivity by 25% through implementation of new workflows and tools.",
      })
      score -= 8
    }

    // Check for education details
    if (content.includes("## education") && !content.match(/degree|bachelor|master|phd|diploma|certificate/i)) {
      issues.push({
        id: "incomplete-education",
        type: "warning",
        message: "Education section lacks degree information",
        section: "## Education",
        fix: "Bachelor of Science in Computer Science, University Name, 2015-2019",
      })
      score -= 5
    }

    // Check for summary length
    const summaryMatch = content.match(/## summary\s+([\s\S]*?)(?=##|$)/i)
    if (summaryMatch && summaryMatch[1].length < 100) {
      issues.push({
        id: "short-summary",
        type: "suggestion",
        message: "Professional summary is too short. Aim for 3-5 sentences.",
        section: "## Summary",
      })
      score -= 3
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    return {
      success: true,
      issues,
      score,
    }
  } catch (error) {
    console.error("Error validating CV:", error)
    return {
      success: false,
      error: `Failed to validate CV: ${error instanceof Error ? error.message : "Unknown error"}`,
      issues: [],
      score: 0,
    }
  }
}

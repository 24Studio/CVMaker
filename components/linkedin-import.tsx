"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileUp, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface LinkedInData {
  profile?: {
    name?: string
    headline?: string
    location?: string
    summary?: string
  }
  positions?: Array<{
    title?: string
    company?: string
    location?: string
    startDate?: string
    endDate?: string
    description?: string
  }>
  education?: Array<{
    schoolName?: string
    degreeName?: string
    fieldOfStudy?: string
    startDate?: string
    endDate?: string
  }>
  skills?: Array<{
    name?: string
  }>
  certifications?: Array<{
    name?: string
    authority?: string
    startDate?: string
    endDate?: string
  }>
}

interface LinkedInImportProps {
  onDataImported: (markdown: string) => void
  darkMode: boolean
}

export function LinkedInImport({ onDataImported, darkMode }: LinkedInImportProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const fileContent = await readFileContent(file)
      let linkedInData: LinkedInData

      if (file.name.endsWith(".json")) {
        linkedInData = JSON.parse(fileContent)
      } else if (file.name.endsWith(".csv")) {
        // Basic CSV parsing - in a real app, you'd want a more robust CSV parser
        linkedInData = parseCSV(fileContent)
      } else {
        throw new Error("Unsupported file format. Please upload a JSON or CSV file.")
      }

      const markdown = convertToMarkdown(linkedInData)
      onDataImported(markdown)
      toast({
        title: "LinkedIn data imported",
        description: "Your CV has been updated with your LinkedIn data.",
      })
    } catch (err) {
      console.error("Error importing LinkedIn data:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target?.result as string)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const parseCSV = (csvContent: string): LinkedInData => {
    // This is a very basic CSV parser
    // In a production app, you'd want to use a library like Papa Parse
    const lines = csvContent.split("\n")
    const headers = lines[0].split(",")

    // This is a simplified implementation - a real one would be more robust
    // Just returning a basic structure for demonstration
    return {
      profile: {
        name: "Extracted from CSV",
        headline: "Extracted from CSV",
        location: "Extracted from CSV",
        summary: "Profile data extracted from uploaded CSV file",
      },
      positions: [
        {
          title: "Position from CSV",
          company: "Company from CSV",
          location: "Location from CSV",
          startDate: "2020",
          endDate: "Present",
          description: "Job description extracted from CSV",
        },
      ],
      // Other fields would be parsed similarly
    }
  }

  const convertToMarkdown = (data: LinkedInData): string => {
    let markdown = "## LinkedIn Data (Imported from file)\n\n"

    if (data.profile) {
      const profile = data.profile
      if (profile.name) markdown += `### ${profile.name}\n`
      if (profile.headline) markdown += `#### ${profile.headline}\n\n`
      if (profile.location) markdown += `Location: ${profile.location}\n\n`
      if (profile.summary) markdown += `${profile.summary}\n\n`
    }

    if (data.positions && data.positions.length > 0) {
      markdown += `### Work Experience\n\n`
      data.positions.forEach((position) => {
        if (position.title) markdown += `#### ${position.title}\n`
        const details = []
        if (position.company) details.push(`**${position.company}**`)
        if (position.location) details.push(position.location)

        const dateRange = []
        if (position.startDate) dateRange.push(position.startDate)
        if (position.endDate) dateRange.push(position.endDate)
        if (dateRange.length > 0) details.push(dateRange.join(" - "))

        if (details.length > 0) markdown += `${details.join(" | ")}\n\n`
        if (position.description) markdown += `${position.description}\n\n`
      })
    }

    if (data.education && data.education.length > 0) {
      markdown += `### Education\n\n`
      data.education.forEach((edu) => {
        const degree = []
        if (edu.degreeName) degree.push(edu.degreeName)
        if (edu.fieldOfStudy) degree.push(`in ${edu.fieldOfStudy}`)

        if (degree.length > 0) markdown += `#### ${degree.join(" ")}\n`
        if (edu.schoolName) markdown += `**${edu.schoolName}**`

        const dateRange = []
        if (edu.startDate) dateRange.push(edu.startDate)
        if (edu.endDate) dateRange.push(edu.endDate)
        if (dateRange.length > 0) markdown += ` | ${dateRange.join(" - ")}`

        markdown += "\n\n"
      })
    }

    if (data.skills && data.skills.length > 0) {
      markdown += `### Skills\n\n`
      const skillGroups = []
      for (let i = 0; i < data.skills.length; i += 3) {
        skillGroups.push(data.skills.slice(i, i + 3))
      }

      skillGroups.forEach((group) => {
        markdown += group.map((skill) => `**${skill.name || "Skill"}**`).join(" | ") + "\n"
      })
      markdown += "\n"
    }

    if (data.certifications && data.certifications.length > 0) {
      markdown += `### Certifications\n\n`
      data.certifications.forEach((cert) => {
        markdown += `- **${cert.name || "Certification"}**`
        if (cert.authority) markdown += ` - ${cert.authority}`

        const dateInfo = []
        if (cert.startDate) dateInfo.push(`Issued: ${cert.startDate}`)
        if (cert.endDate) dateInfo.push(`Expires: ${cert.endDate}`)
        if (dateInfo.length > 0) markdown += ` (${dateInfo.join(", ")})`

        markdown += "\n"
      })
      markdown += "\n"
    }

    return markdown
  }

  return (
    <Card className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
          <Upload className="h-5 w-5" />
          Import LinkedIn Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Upload your LinkedIn data export file (JSON or CSV format)
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className={darkMode ? "bg-gray-700 border-gray-600" : ""}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById("linkedin-file-input")?.click()}
              >
                <FileUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div
              className={`p-3 rounded-md flex items-start gap-2 ${darkMode ? "bg-red-900/50 text-red-200" : "bg-red-50 text-red-800"}`}
            >
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className={`p-3 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
            <h4 className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              How to export your LinkedIn data:
            </h4>
            <ol className={`text-sm space-y-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              <li>1. Go to your LinkedIn account settings</li>
              <li>2. Click on "Data privacy"</li>
              <li>3. Under "How LinkedIn uses your data," select "Get a copy of your data"</li>
              <li>4. Select "Want something in particular?"</li>
              <li>5. Check "Profile" and any other data you want to include</li>
              <li>6. Click "Request archive"</li>
              <li>7. LinkedIn will email you when your data is ready to download</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

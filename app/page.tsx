"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronDown,
  ChevronRight,
  Code,
  Download,
  Eye,
  FileText,
  Folder,
  Github,
  Link2,
  Linkedin,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings,
  Share,
  Star,
  User,
  Sparkles,
  Save,
  BookOpen,
  LogOut,
  MessageCircle,
  PanelLeft,
  Terminal,
  Hash,
  List,
  ListOrdered,
  Quote,
  GripVertical,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { fetchGitHubData, fetchLinkedInData, validateCV } from "./actions"

// Font options
const fontOptions = [
  { value: "inter", label: "Inter (Default)", fontFamily: "Inter, sans-serif" },
  { value: "roboto", label: "Roboto", fontFamily: "'Roboto', sans-serif" },
  { value: "open-sans", label: "Open Sans", fontFamily: "'Open Sans', sans-serif" },
  { value: "lato", label: "Lato", fontFamily: "'Lato', sans-serif" },
  { value: "montserrat", label: "Montserrat", fontFamily: "'Montserrat', sans-serif" },
  { value: "playfair", label: "Playfair Display", fontFamily: "'Playfair Display', serif" },
  { value: "merriweather", label: "Merriweather", fontFamily: "'Merriweather', serif" },
  { value: "source-code", label: "Source Code Pro", fontFamily: "'Source Code Pro', monospace" },
]

// Layout templates
const layoutTemplates = [
  { value: "classic", label: "Classic", description: "Traditional single-column layout" },
  { value: "modern", label: "Modern", description: "Two-column layout with sidebar" },
  { value: "minimal", label: "Minimal", description: "Clean, minimalist design" },
  { value: "creative", label: "Creative", description: "Unique layout with visual elements" },
]

// Background patterns
const backgroundPatterns = [
  { value: "none", label: "None" },
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "lines", label: "Lines" },
]

// Color schemes - simplified and more clear
const colorSchemes = [
  { value: "neutral", label: "Neutral", primary: "#18181b", secondary: "#27272a", accent: "#3f3f46" },
  { value: "blue", label: "Blue", primary: "#2563eb", secondary: "#1d4ed8", accent: "#60a5fa" },
  { value: "green", label: "Green", primary: "#16a34a", secondary: "#15803d", accent: "#4ade80" },
  { value: "purple", label: "Purple", primary: "#9333ea", secondary: "#7e22ce", accent: "#c084fc" },
  { value: "red", label: "Red", primary: "#dc2626", secondary: "#b91c1c", accent: "#f87171" },
]

// Interface for markdown sections
interface MarkdownSection {
  id: string
  type: string
  content: string
}

// Interface for CV validation issues
interface CVIssue {
  id: string
  type: "error" | "warning" | "suggestion"
  message: string
  section: string
  fix?: string
}

// Interface for CV project
interface CVProject {
  id: string
  name: string
  content: string
  lastModified: Date
  isStarred: boolean
}

// SortableItem component for drag and drop
function SortableItem({
  id,
  type,
  content,
  onEdit,
}: { id: string; type: string; content: string; onEdit: (id: string, content: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getTypeIcon = () => {
    switch (type) {
      case "h1":
        return <Hash className="h-4 w-4" />
      case "h2":
        return <Hash className="h-4 w-4" />
      case "h3":
        return <Hash className="h-4 w-4" />
      case "p":
        return <FileText className="h-4 w-4" />
      case "ul":
        return <List className="h-4 w-4" />
      case "ol":
        return <ListOrdered className="h-4 w-4" />
      case "blockquote":
        return <Quote className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = () => {
    switch (type) {
      case "h1":
        return "Heading 1"
      case "h2":
        return "Heading 2"
      case "h3":
        return "Heading 3"
      case "p":
        return "Paragraph"
      case "ul":
        return "Bullet List"
      case "ol":
        return "Numbered List"
      case "blockquote":
        return "Quote"
      case "code":
        return "Code Block"
      default:
        return "Text"
    }
  }

  const getBorderColor = () => {
    switch (type) {
      case "h1":
        return "border-blue-500"
      case "h2":
        return "border-green-500"
      case "h3":
        return "border-purple-500"
      case "ul":
        return "border-amber-500"
      case "ol":
        return "border-orange-500"
      case "blockquote":
        return "border-teal-500"
      case "code":
        return "border-red-500"
      default:
        return "border-gray-300"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 p-2 bg-white dark:bg-zinc-800 rounded-md border-l-4 ${getBorderColor()} shadow-sm group hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <GripVertical className="h-4 w-4 text-zinc-400" />
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">
          {getTypeIcon()}
          <span>{getTypeLabel()}</span>
        </div>
        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => onEdit(id, e.target.value)}
            className="w-full min-h-[40px] text-sm border-none focus-visible:ring-1 p-2 resize-none"
          />
        </div>
      </div>
    </div>
  )
}

const defaultCV = `# Wiktor Lazar, Software Engineer

## Contact Information

- Email: wiktorlazar@example.com
- Phone: (123) 456-7890
- LinkedIn: [linkedin.com/in/wiktorlazar](https://www.linkedin.com/in/wiktorlazar)
- GitHub: [github.com/wiktorlazar](https://github.com/wiktorlazar)

## Summary

Highly motivated and experienced software engineer with a passion for developing innovative solutions. Proven ability to work independently and collaboratively in fast-paced environments.

## Skills

- JavaScript
- TypeScript
- React
- Next.js
- Node.js
- HTML
- CSS
- Git
- Docker
- Kubernetes

## Projects

This section will be automatically populated with data from your GitHub profile.

## Certifications

This section will be automatically populated with data from your LinkedIn profile.

## Experience

This section will be automatically populated with data from your LinkedIn profile.

## Education

This section will be automatically populated with data from your LinkedIn profile.
`

export default function CVEditor() {
  // State for projects
  const [projects, setProjects] = useState<CVProject[]>([
    {
      id: "default-cv",
      name: "Real-time CV editor",
      content: defaultCV,
      lastModified: new Date(),
      isStarred: false,
    },
    {
      id: "modern-cv",
      name: "Modern CV Template",
      content: defaultCV.replace("Wiktor Lazar, Software Engineer", "Modern Professional CV"),
      lastModified: new Date(Date.now() - 86400000),
      isStarred: true,
    },
    {
      id: "minimal-cv",
      name: "Minimalistyczne portfolio",
      content: defaultCV.replace("Wiktor Lazar, Software Engineer", "Minimal Portfolio CV"),
      lastModified: new Date(Date.now() - 172800000),
      isStarred: false,
    },
  ])
  const [activeProjectId, setActiveProjectId] = useState<string>("default-cv")
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false)
  const [newProjectName, setNewProjectName] = useState<string>("")

  // Get active project
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0]

  // Editor state
  const [markdown, setMarkdown] = useState<string>(activeProject.content)
  const [markdownSections, setMarkdownSections] = useState<MarkdownSection[]>([])
  const [fontSize, setFontSize] = useState<number>(16)
  const [spacing, setSpacing] = useState<number>(1.5)
  const [darkMode, setDarkMode] = useState<boolean>(false)
  const [darkCV, setDarkCV] = useState<boolean>(false)
  const [accentColor, setAccentColor] = useState<string>("#2563eb")
  const [autoSync, setAutoSync] = useState<boolean>(false)
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false)
  const [githubTokenMissing, setGithubTokenMissing] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<"raw" | "visual">("raw")
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview")
  const [cvIssues, setCVIssues] = useState<CVIssue[]>([])
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [cvScore, setCVScore] = useState<number>(0)
  const [showIntegrationsDialog, setShowIntegrationsDialog] = useState<boolean>(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string>("")
  const [feedbackType, setFeedbackType] = useState<"bug" | "feature" | "other">("feature")
  const [gitChanges, setGitChanges] = useState<{ commits: number; branches: number; pullRequests: number }>({
    commits: 0,
    branches: 1,
    pullRequests: 0,
  })

  // Advanced styling options - simplified
  const [fontFamily, setFontFamily] = useState<string>("inter")
  const [h1Size, setH1Size] = useState<number>(32)
  const [h2Size, setH2Size] = useState<number>(24)
  const [h3Size, setH3Size] = useState<number>(20)
  const [paragraphSize, setParagraphSize] = useState<number>(16)
  const [cvBackgroundColor, setCvBackgroundColor] = useState<string>(darkCV ? "#18181b" : "#ffffff")
  const [cvTextColor, setCvTextColor] = useState<string>(darkCV ? "#f4f4f5" : "#18181b")
  const [cvPadding, setCvPadding] = useState<number>(32)
  const [cvBorderRadius, setCvBorderRadius] = useState<number>(8)
  const [cvMaxWidth, setCvMaxWidth] = useState<number>(800)
  const [textAlignment, setTextAlignment] = useState<string>("left")
  const [headerAlignment, setHeaderAlignment] = useState<string>("left")
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>("blue")
  const [backgroundPattern, setBackgroundPattern] = useState<string>("none")
  const [layoutTemplate, setLayoutTemplate] = useState<string>("classic")
  const [imageSize, setImageSize] = useState<number>(150)
  const [sectionSpacing, setSectionSpacing] = useState<number>(24)
  const [boldness, setBoldness] = useState<number>(600)
  const [linkStyle, setLinkStyle] = useState<string>("underline")
  const [listStyle, setListStyle] = useState<string>("disc")
  const [useCustomColors, setUseCustomColors] = useState<boolean>(false)

  // Integration settings
  const [githubUsername, setGithubUsername] = useState<string>("wiktorlazar")
  const [linkedinUsername, setLinkedinUsername] = useState<string>("wiktorlazar")
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // GitHub integration options
  const [includeGithubProfile, setIncludeGithubProfile] = useState<boolean>(true)
  const [includeGithubRepos, setIncludeGithubRepos] = useState<boolean>(true)
  const [includeGithubLanguages, setIncludeGithubLanguages] = useState<boolean>(true)
  const [includeGithubContributions, setIncludeGithubContributions] = useState<boolean>(true)
  const [githubRepoLimit, setGithubRepoLimit] = useState<number>(5)

  // LinkedIn integration options
  const [includeLinkedinProfile, setIncludeLinkedinProfile] = useState<boolean>(true)
  const [includeLinkedinExperience, setIncludeLinkedinExperience] = useState<boolean>(true)
  const [includeLinkedinEducation, setIncludeLinkedinEducation] = useState<boolean>(true)
  const [includeLinkedinSkills, setIncludeLinkedinSkills] = useState<boolean>(true)
  const [includeLinkedinCertifications, setIncludeLinkedinCertifications] = useState<boolean>(true)

  // UI state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    app: true,
    components: true,
    ui: false,
    lib: false,
  })

  const cvRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Parse markdown into sections for visual editor
  const parseMarkdownToSections = useCallback((markdownText: string) => {
    const lines = markdownText.split("\n")
    const sections: MarkdownSection[] = []
    let currentSection: MarkdownSection | null = null
    let sectionId = 0

    const finishCurrentSection = () => {
      if (currentSection && currentSection.content.trim()) {
        sections.push({
          ...currentSection,
          id: `section-${sectionId++}`,
        })
      }
      currentSection = null
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Detect section type
      if (line.startsWith("# ")) {
        finishCurrentSection()
        currentSection = { id: "", type: "h1", content: line.substring(2) }
        finishCurrentSection()
      } else if (line.startsWith("## ")) {
        finishCurrentSection()
        currentSection = { id: "", type: "h2", content: line.substring(3) }
        finishCurrentSection()
      } else if (line.startsWith("### ")) {
        finishCurrentSection()
        currentSection = { id: "", type: "h3", content: line.substring(4) }
        finishCurrentSection()
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        if (!currentSection || currentSection.type !== "ul") {
          finishCurrentSection()
          currentSection = { id: "", type: "ul", content: line }
        } else {
          currentSection.content += "\n" + line
        }
      } else if (line.match(/^\d+\. /)) {
        if (!currentSection || currentSection.type !== "ol") {
          finishCurrentSection()
          currentSection = { id: "", type: "ol", content: line }
        } else {
          currentSection.content += "\n" + line
        }
      } else if (line.startsWith("> ")) {
        if (!currentSection || currentSection.type !== "blockquote") {
          finishCurrentSection()
          currentSection = { id: "", type: "blockquote", content: line.substring(2) }
        } else {
          currentSection.content += "\n" + line.substring(2)
        }
      } else if (line.startsWith("```")) {
        if (!currentSection || currentSection.type !== "code") {
          finishCurrentSection()
          currentSection = { id: "", type: "code", content: line }
          // Continue collecting code block content until closing \`\`\`
          let j = i + 1
          while (j < lines.length && !lines[j].startsWith("```")) {
            currentSection.content += "\n" + lines[j]
            j++
          }
          if (j < lines.length) {
            currentSection.content += "\n" + lines[j]
            i = j
          }
          finishCurrentSection()
        }
      } else {
        // Regular paragraph text
        if (line.trim() === "") {
          finishCurrentSection()
        } else {
          if (!currentSection) {
            currentSection = { id: "", type: "p", content: line }
          } else if (currentSection.type === "p") {
            currentSection.content += "\n" + line
          } else {
            finishCurrentSection()
            currentSection = { id: "", type: "p", content: line }
          }
        }
      }
    }

    finishCurrentSection()
    return sections
  }, [])

  // Convert sections back to markdown
  const sectionsToMarkdown = useCallback((sections: MarkdownSection[]) => {
    return sections
      .map((section) => {
        switch (section.type) {
          case "h1":
            return `# ${section.content}`
          case "h2":
            return `## ${section.content}`
          case "h3":
            return `### ${section.content}`
          case "ul":
          case "ol":
          case "p":
          case "blockquote":
          case "code":
            return section.content
          default:
            return section.content
        }
      })
      .join("\n\n")
  }, [])

  // Handle section edit
  const handleSectionEdit = useCallback((id: string, newContent: string) => {
    setMarkdownSections((prev) => {
      const updated = prev.map((section) => (section.id === id ? { ...section, content: newContent } : section))
      return updated
    })
  }, [])

  // Handle section reorder
  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setMarkdownSections((prev) => {
        const oldIndex = prev.findIndex((item) => item.id === active.id)
        const newIndex = prev.findIndex((item) => item.id === over.id)

        const newArray = [...prev]
        const [movedItem] = newArray.splice(oldIndex, 1)
        newArray.splice(newIndex, 0, movedItem)

        return newArray
      })
    }
  }, [])

  // Update markdown when sections change
  useEffect(() => {
    if (editMode === "visual" && markdownSections.length > 0) {
      const newMarkdown = sectionsToMarkdown(markdownSections)
      setMarkdown(newMarkdown)
    }
  }, [markdownSections, sectionsToMarkdown, editMode])

  // Parse markdown into sections when switching to visual mode
  useEffect(() => {
    if (editMode === "visual") {
      const sections = parseMarkdownToSections(markdown)
      setMarkdownSections(sections)
    }
  }, [editMode, markdown, parseMarkdownToSections])

  // Auto-sync data on initial load
  useEffect(() => {
    if (autoSync && !isAutoSyncing) {
      syncAllData()
    }
  }, [autoSync])

  // Update CV background and text colors when dark mode changes
  useEffect(() => {
    if (darkCV) {
      setCvBackgroundColor("#18181b")
      setCvTextColor("#f4f4f5")
    } else {
      setCvBackgroundColor("#ffffff")
      setCvTextColor("#18181b")
    }
  }, [darkCV])

  // Update accent color when color scheme changes
  useEffect(() => {
    if (!useCustomColors) {
      const scheme = colorSchemes.find((scheme) => scheme.value === selectedColorScheme)
      if (scheme) {
        setAccentColor(scheme.primary)
      }
    }
  }, [selectedColorScheme, useCustomColors])

  // Update project content when markdown changes
  useEffect(() => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId ? { ...project, content: markdown, lastModified: new Date() } : project,
      ),
    )
  }, [markdown, activeProjectId])

  // Load project content when active project changes
  useEffect(() => {
    const project = projects.find((p) => p.id === activeProjectId)
    if (project) {
      setMarkdown(project.content)
    }
  }, [activeProjectId, projects])

  // Handle printing/PDF export
  const handlePrint = () => {
    if (cvRef.current) {
      // Store the original styles
      const originalStyles = document.body.style.cssText

      // Hide everything except the CV
      document.body.style.cssText = `
        visibility: hidden;
        background: white;
      `

      if (cvRef.current) {
        cvRef.current.style.visibility = "visible"
        cvRef.current.style.position = "absolute"
        cvRef.current.style.left = "0"
        cvRef.current.style.top = "0"
      }

      // Print the document
      window.print()

      // Restore original styles
      document.body.style.cssText = originalStyles
    }
  }

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value)

    // Simulate Git commit when content changes
    if (Math.random() > 0.7) {
      setGitChanges((prev) => ({
        ...prev,
        commits: prev.commits + 1,
      }))
    }
  }

  const saveToGithub = () => {
    toast({
      title: "Changes committed to GitHub",
      description: "Your CV has been saved to your GitHub repository.",
    })

    setGitChanges((prev) => ({
      ...prev,
      commits: prev.commits + 1,
    }))
  }

  // Sync all data from GitHub and LinkedIn
  const syncAllData = async () => {
    setIsAutoSyncing(true)
    try {
      await syncWithGitHub()
      await syncWithLinkedIn()
    } finally {
      setIsAutoSyncing(false)
    }
  }

  // Update the GitHub integration to better handle the token
  const syncWithGitHub = async () => {
    setIsLoading(true)
    try {
      console.log(`Syncing GitHub data for username: ${githubUsername}`)
      const result = await fetchGitHubData({
        username: githubUsername,
        includeProfile: includeGithubProfile,
        includeRepositories: includeGithubRepos,
        includeLanguages: includeGithubLanguages,
        includeContributions: includeGithubContributions,
        repositoryLimit: githubRepoLimit,
      })

      if (result.success) {
        // Update the githubTokenMissing state based on the response
        setGithubTokenMissing(!result.usingToken)

        // Replace the content between ## Projects and ## Certifications
        const updatedMarkdown = replaceSection(markdown, "## Projects", "## Certifications", result.markdown)
        setMarkdown(updatedMarkdown)

        if (!isAutoSyncing) {
          toast({
            title: "GitHub data imported",
            description: result.usingToken
              ? `Successfully fetched data from ${githubUsername}'s GitHub profile.`
              : `Fetched public data from ${githubUsername}'s GitHub profile (using simulated data where needed).`,
          })
        }
      } else {
        toast({
          title: "Error importing GitHub data",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error in GitHub integration:", error)
      toast({
        title: "Error importing GitHub data",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch LinkedIn data and update markdown
  const syncWithLinkedIn = async () => {
    setIsLoading(true)
    try {
      const result = await fetchLinkedInData({
        username: linkedinUsername,
        includeProfile: includeLinkedinProfile,
        includeExperience: includeLinkedinExperience,
        includeEducation: includeLinkedinEducation,
        includeSkills: includeLinkedinSkills,
        includeCertifications: includeLinkedinCertifications,
      })

      if (result.success) {
        // Replace the content after ## Certifications
        const updatedMarkdown = replaceSectionAfter(markdown, "## Certifications", result.markdown)
        setMarkdown(updatedMarkdown)

        if (!isAutoSyncing) {
          toast({
            title: "LinkedIn data imported",
            description: "Your CV has been updated with the latest LinkedIn data.",
          })
        }
      } else {
        toast({
          title: "Error importing LinkedIn data",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error importing LinkedIn data",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Validate CV content
  const validateCVContent = async () => {
    setIsValidating(true)
    try {
      // This would be a real API call in a production app
      const result = await validateCV({ content: markdown })

      if (result.success) {
        setCVIssues(result.issues)
        setCVScore(result.score)

        toast({
          title: `CV Score: ${result.score}%`,
          description:
            result.issues.length > 0
              ? `Found ${result.issues.length} issues to improve your CV.`
              : "Great job! Your CV looks excellent.",
        })
      } else {
        toast({
          title: "Error validating CV",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error validating CV",
        description: "An unexpected error occurred during validation.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Apply suggested fix to CV
  const applyFix = (issue: CVIssue) => {
    if (!issue.fix) return

    // In a real app, this would be more sophisticated
    // For now, we'll just append the fix to the relevant section
    const updatedMarkdown = replaceSectionContent(markdown, issue.section, (content) => {
      return content + "\n" + issue.fix
    })

    setMarkdown(updatedMarkdown)

    // Remove the issue from the list
    setCVIssues((prev) => prev.filter((i) => i.id !== issue.id))

    toast({
      title: "Fix applied",
      description: `Applied suggested fix for: ${issue.message}`,
    })
  }

  // Helper function to replace content between two section headers
  const replaceSection = (text: string, startMarker: string, endMarker: string, newContent: string) => {
    const startIndex = text.indexOf(startMarker)
    const endIndex = text.indexOf(endMarker)

    if (startIndex === -1) return text

    if (endIndex === -1) {
      return text.substring(0, startIndex) + startMarker + "\n\n" + newContent
    }

    return text.substring(0, startIndex) + startMarker + "\n\n" + newContent + "\n\n" + text.substring(endIndex)
  }

  // Helper function to replace content after a section header
  const replaceSectionAfter = (text: string, marker: string, newContent: string) => {
    const index = text.indexOf(marker)

    if (index === -1) return text

    // Find the next section header if it exists
    const nextSectionMatch = text.substring(index + marker.length).match(/\n## /)

    if (nextSectionMatch) {
      const nextSectionIndex = index + marker.length + nextSectionMatch.index
      return text.substring(0, index) + marker + "\n\n" + newContent + "\n\n" + text.substring(nextSectionIndex)
    } else {
      return text.substring(0, index) + marker + "\n\n" + newContent
    }
  }

  // Helper function to replace content within a specific section
  const replaceSectionContent = (text: string, sectionName: string, replaceFn: (content: string) => string) => {
    const sectionIndex = text.indexOf(sectionName)
    if (sectionIndex === -1) return text

    // Find the next section header if it exists
    const nextSectionMatch = text.substring(sectionIndex + sectionName.length).match(/\n## /)

    if (nextSectionMatch) {
      const nextSectionIndex = sectionIndex + sectionName.length + nextSectionMatch.index
      const sectionContent = text.substring(sectionIndex + sectionName.length, nextSectionIndex)
      const updatedContent = replaceFn(sectionContent)

      return text.substring(0, sectionIndex + sectionName.length) + updatedContent + text.substring(nextSectionIndex)
    } else {
      const sectionContent = text.substring(sectionIndex + sectionName.length)
      const updatedContent = replaceFn(sectionContent)

      return text.substring(0, sectionIndex + sectionName.length) + updatedContent
    }
  }

  // Create a new project
  const createNewProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your new project.",
        variant: "destructive",
      })
      return
    }

    const newId = `project-${Date.now()}`
    const newProject: CVProject = {
      id: newId,
      name: newProjectName,
      content: defaultCV,
      lastModified: new Date(),
      isStarred: false,
    }

    setProjects((prev) => [...prev, newProject])
    setActiveProjectId(newId)
    setNewProjectName("")
    setIsCreatingProject(false)

    toast({
      title: "Project created",
      description: `"${newProjectName}" has been created successfully.`,
    })
  }

  // Delete a project
  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))

    // If the active project is deleted, switch to the first available project
    if (id === activeProjectId) {
      const remainingProjects = projects.filter((p) => p.id !== id)
      if (remainingProjects.length > 0) {
        setActiveProjectId(remainingProjects[0].id)
      }
    }

    toast({
      title: "Project deleted",
      description: "The project has been deleted successfully.",
    })
  }

  // Toggle star status for a project
  const toggleProjectStar = (id: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === id ? { ...project, isStarred: !project.isStarred } : project)),
    )
  }

  // Submit feedback
  const submitFeedback = () => {
    if (!feedbackMessage.trim()) {
      toast({
        title: "Feedback message required",
        description: "Please enter your feedback message.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! We'll review it shortly.",
    })

    setFeedbackMessage("")
    setShowFeedbackDialog(false)
  }

  // Export CV to different formats
  const exportCV = (format: "pdf" | "markdown" | "docx" | "txt") => {
    switch (format) {
      case "pdf":
        handlePrint()
        break
      case "markdown":
        // Create a blob and download it
        const markdownBlob = new Blob([markdown], { type: "text/markdown" })
        const markdownUrl = URL.createObjectURL(markdownBlob)
        const markdownLink = document.createElement("a")
        markdownLink.href = markdownUrl
        markdownLink.download = "cv.md"
        markdownLink.click()
        break
      case "docx":
        toast({
          title: "DOCX Export",
          description: "In a real app, this would convert the markdown to DOCX format and download it.",
        })
        break
      case "txt":
        // Create a blob and download it
        const txtBlob = new Blob([markdown], { type: "text/plain" })
        const txtUrl = URL.createObjectURL(txtBlob)
        const txtLink = document.createElement("a")
        txtLink.href = txtUrl
        txtLink.download = "cv.txt"
        txtLink.click()
        break
    }
  }

  // Toggle folder expansion
  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: !prev[folder],
    }))
  }

  // Apply the theme to the document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Get the current font family object
  const currentFont = fontOptions.find((font) => font.value === fontFamily) || fontOptions[0]

  // Generate background pattern CSS
  const getBackgroundPatternCSS = () => {
    switch (backgroundPattern) {
      case "dots":
        return {
          backgroundImage: `radial-gradient(${darkCV ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }
      case "grid":
        return {
          backgroundImage: `linear-gradient(to right, ${darkCV ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px), 
                           linear-gradient(to bottom, ${darkCV ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }
      case "lines":
        return {
          backgroundImage: `linear-gradient(to right, ${darkCV ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 1px, transparent 1px)`,
          backgroundSize: "20px 1px",
        }
      default:
        return {}
    }
  }

  // Get layout template CSS
  const getLayoutTemplateCSS = () => {
    switch (layoutTemplate) {
      case "modern":
        return {
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "2rem",
        }
      case "minimal":
        return {
          maxWidth: "700px",
          margin: "0 auto",
        }
      case "creative":
        return {
          position: "relative",
          padding: "2rem",
        }
      default:
        return {}
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandPaletteOpen(true)
      }

      // Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        saveToGithub()
      }

      // Toggle preview/code
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault()
        setViewMode(viewMode === "preview" ? "code" : "preview")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [viewMode])

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 transition-colors duration-300 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm transition-colors duration-300 z-10 h-12 flex items-center px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-black dark:text-white"
            >
              <path
                d="M24.9434 13.4211C24.9434 13.4211 25.4232 13.4211 25.4232 12.9474C25.4232 12.4737 25.4232 9.68421 25.4232 9.68421C25.4232 9.68421 25.4232 9.21053 24.9434 9.21053C24.4635 9.21053 21.6041 9.21053 21.6041 9.21053C21.6041 9.21053 21.1243 9.21053 21.1243 8.73684C21.1243 8.26316 21.1243 5.47368 21.1243 5.47368C21.1243 5.47368 21.1243 5 20.6445 5C20.1647 5 17.3053 5 17.3053 5C17.3053 5 16.8255 5 16.8255 5.47368C16.8255 5.94737 16.8255 8.73684 16.8255 8.73684C16.8255 8.73684 16.8255 9.21053 16.3457 9.21053C15.8659 9.21053 13.0065 9.21053 13.0065 9.21053C13.0065 9.21053 12.5267 9.21053 12.5267 9.68421C12.5267 10.1579 12.5267 12.9474 12.5267 12.9474C12.5267 12.9474 12.5267 13.4211 13.0065 13.4211C13.4863 13.4211 16.3457 13.4211 16.3457 13.4211C16.3457 13.4211 16.8255 13.4211 16.8255 13.8947C16.8255 14.3684 16.8255 17.1579 16.8255 17.1579C16.8255 17.1579 16.8255 17.6316 17.3053 17.6316C17.7851 17.6316 20.6445 17.6316 20.6445 17.6316C20.6445 17.6316 21.1243 17.6316 21.1243 18.1053C21.1243 18.5789 21.1243 21.3684 21.1243 21.3684C21.1243 21.3684 21.1243 21.8421 21.6041 21.8421C22.0839 21.8421 24.9434 21.8421 24.9434 21.8421C24.9434 21.8421 25.4232 21.8421 25.4232 22.3158C25.4232 22.7895 25.4232 25.5789 25.4232 25.5789C25.4232 25.5789 25.4232 26.0526 25.9029 26.0526C26.3828 26.0526 29.2422 26.0526 29.2422 26.0526C29.2422 26.0526 29.722 26.0526 29.722 26.5263C29.722 27 29.722 29.7895 29.722 29.7895C29.722 29.7895 29.722 30.2632 30.2018 30.2632C30.6816 30.2632 33.541 30.2632 33.541 30.2632C33.541 30.2632 34.0208 30.2632 34.0208 29.7895C34.0208 29.3158 34.0208 26.5263 34.0208 26.5263C34.0208 26.5263 34.0208 26.0526 34.5006 26.0526C34.9804 26.0526 37.8398 26.0526 37.8398 26.0526C37.8398 26.0526 38.3196 26.0526 38.3196 25.5789C38.3196 25.1053 38.3196 22.3158 38.3196 22.3158C38.3196 22.3158 38.3196 21.8421 38.7994 21.8421C39.2792 21.8421 42.1386 21.8421 42.1386 21.8421C42.1386 21.8421 42.6184 21.8421 42.6184 21.3684C42.6184 20.8947 42.6184 18.1053 42.6184 18.1053C42.6184 18.1053 42.6184 17.6316 42.1386 17.6316C41.6588 17.6316 38.7994 17.6316 38.7994 17.6316C38.7994 17.6316 38.3196 17.6316 38.3196 17.1579C38.3196 16.6842 38.3196 13.8947 38.3196 13.8947C38.3196 13.8947 38.3196 13.4211 37.8398 13.4211C37.36 13.4211 34.5006 13.4211 34.5006 13.4211C34.5006 13.4211 34.0208 13.4211 34.0208 12.9474C34.0208 12.4737 34.0208 9.68421 34.0208 9.68421C34.0208 9.68421 34.0208 9.21053 33.541 9.21053C33.0612 9.21053 30.2018 9.21053 30.2018 9.21053C30.2018 9.21053 29.722 9.21053 29.722 8.73684C29.722 8.26316 29.722 5.47368 29.722 5.47368C29.722 5.47368 29.722 5 29.2422 5C28.7624 5 25.9029 5 25.9029 5C25.9029 5 25.4232 5 25.4232 5.47368C25.4232 5.94737 25.4232 8.73684 25.4232 8.73684C25.4232 8.73684 25.4232 9.21053 24.9434 9.21053C24.4635 9.21053 21.6041 9.21053 21.6041 9.21053"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              <FileText className="h-4 w-4" />
              <span>Real-time CV editor</span>
            </Button>
            <span className="text-zinc-400">/</span>
            <Button variant="ghost" size="sm" className="h-8">
              Fork of Real-time CV editor
            </Button>
            <Badge variant="outline" className="ml-2 h-5 px-1.5">
              Private
            </Badge>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Share CV</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link2 className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Github className="mr-2 h-4 w-4" />
                <span>Share to GitHub</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Linkedin className="mr-2 h-4 w-4" />
                <span>Share to LinkedIn</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => setShowIntegrationsDialog(true)}>
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
              4
            </span>
            <span className="hidden sm:inline">Integrations</span>
          </Button>

          <Button variant="default" size="sm" className="h-8 gap-1">
            Deploy
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Projects */}
        <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="p-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => {}}>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center px-2 py-1.5 text-sm font-medium">
              <User className="mr-2 h-4 w-4" />
              Community
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center px-2 py-1.5 text-sm font-medium">
              <BookOpen className="mr-2 h-4 w-4" />
              Library
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium">
              <div className="flex items-center">
                <Folder className="mr-2 h-4 w-4" />
                Projects
              </div>
            </div>

            <div className="mt-1 space-y-1">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={activeProjectId === project.id ? "secondary" : "ghost"}
                  className="w-full justify-start px-2 py-1.5 h-auto text-sm"
                  onClick={() => setActiveProjectId(project.id)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{project.name}</span>
                  {project.isStarred && <Star className="ml-auto h-3 w-3 text-yellow-400" />}
                </Button>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start px-2 py-1.5 h-auto text-sm"
                onClick={() => setIsCreatingProject(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>

          <div className="mt-auto px-3 py-2">
            <Button
              variant="ghost"
              className="w-full justify-start px-2 py-1.5 h-auto text-sm"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Middle Panel - Editor */}
        <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setViewMode("preview")}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setViewMode("code")}>
                <Code className="h-4 w-4 mr-1" />
                Code
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {viewMode === "preview" ? (
              <div className="h-full overflow-auto p-4">
                <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
                  <ReactMarkdown>{markdown}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex h-full">
                {/* File Explorer */}
                <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center py-1 px-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleFolder("app")}>
                        {expandedFolders.app ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="ml-1 text-sm">app</span>
                    </div>

                    {expandedFolders.app && (
                      <div className="ml-4">
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">actions.ts</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">globals.css</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">layout.tsx</span>
                        </div>
                        <div className="flex items-center py-1 px-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <Eye className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="text-sm font-medium">page.tsx</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center py-1 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleFolder("components")}
                      >
                        {expandedFolders.components ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="ml-1 text-sm">components</span>
                    </div>

                    {expandedFolders.components && (
                      <div className="ml-4">
                        <div className="flex items-center py-1 px-2">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleFolder("ui")}>
                            {expandedFolders.ui ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="ml-1 text-sm">ui</span>
                        </div>

                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">toaster.tsx</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">use-toast.ts</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">linkedin-import.tsx</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center py-1 px-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleFolder("lib")}>
                        {expandedFolders.lib ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="ml-1 text-sm">lib</span>
                    </div>

                    {expandedFolders.lib && (
                      <div className="ml-4">
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">github-service.ts</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">linkedin-service.ts</span>
                        </div>
                        <div className="flex items-center py-1 px-2">
                          <FileText className="h-4 w-4 mr-2 text-zinc-400" />
                          <span className="text-sm">utils.ts</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 overflow-auto bg-white dark:bg-black">
                  <div className="p-4 font-mono text-sm">
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">1</div>
                      <div className="text-green-500">&quot;use client&quot;</div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">2</div>
                      <div></div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">3</div>
                      <div>
                        <span className="text-pink-500">import</span> <span className="text-pink-500">type</span> React{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;react&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">4</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} useState, useRef, useEffect, useCallback{" "}
                        {"}"} <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;react&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">5</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Button {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/button&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">6</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Textarea {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/textarea&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">7</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Slider {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/slider&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">8</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Switch {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/switch&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">9</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Label {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/label&quot;</span>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-400 w-8 text-right pr-2 select-none">10</div>
                      <div>
                        <span className="text-pink-500">import</span> {"{"} Input {"}"}{" "}
                        <span className="text-pink-500">from</span>{" "}
                        <span className="text-green-500">&quot;@/components/ui/input&quot;</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Console/Output */}
        <div className="w-1/3 flex flex-col">
          <div className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Terminal className="h-4 w-4 mr-1" />
                Console
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 bg-zinc-50 dark:bg-zinc-900/20 overflow-auto">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
              No logs available to display
            </div>
          </div>
        </div>
      </div>

      {/* Create New Project Dialog */}
      <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Enter a name for your new CV project.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="My Professional CV"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
              Cancel
            </Button>
            <Button onClick={createNewProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Customize your CV editor experience.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="appearance">
              <TabsList className="mb-4">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="appearance">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="dark-cv">Dark CV</Label>
                    <Switch id="dark-cv" checked={darkCV} onCheckedChange={setDarkCV} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-family">Default Font</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="editor">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-sync">Auto-sync data</Label>
                    <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default-edit-mode">Default Edit Mode</Label>
                    <Select value={editMode} onValueChange={(value) => setEditMode(value as "raw" | "visual")}>
                      <SelectTrigger id="default-edit-mode">
                        <SelectValue placeholder="Select edit mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw">Raw Markdown</SelectItem>
                        <SelectItem value="visual">Visual Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src="https://github.com/wiktorlazar.png" />
                      <AvatarFallback>WL</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">wiktorlazar</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Free Plan</p>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Integrations Dialog */}
      <Dialog open={showIntegrationsDialog} onOpenChange={setShowIntegrationsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Integrations</DialogTitle>
            <DialogDescription>Connect your CV with external services to import data.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  <div>
                    <h4 className="text-sm font-medium">GitHub</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Import projects and contributions</p>
                  </div>
                </div>
                <Button size="sm" onClick={syncWithGitHub} disabled={isLoading}>
                  {isLoading ? "Syncing..." : "Sync"}
                </Button>
              </div>

              <div className="space-y-2 pl-7">
                <div className="flex items-center justify-between">
                  <Label htmlFor="github-username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="github-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="w-48 h-8 text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-github-profile"
                    checked={includeGithubProfile}
                    onCheckedChange={setIncludeGithubProfile}
                  />
                  <Label htmlFor="include-github-profile" className="text-sm">
                    Include profile information
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-github-repos"
                    checked={includeGithubRepos}
                    onCheckedChange={setIncludeGithubRepos}
                  />
                  <Label htmlFor="include-github-repos" className="text-sm">
                    Include repositories
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-github-languages"
                    checked={includeGithubLanguages}
                    onCheckedChange={setIncludeGithubLanguages}
                  />
                  <Label htmlFor="include-github-languages" className="text-sm">
                    Include programming languages
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-5 w-5" />
                  <div>
                    <h4 className="text-sm font-medium">LinkedIn</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Import experience and education</p>
                  </div>
                </div>
                <Button size="sm" onClick={syncWithLinkedIn} disabled={isLoading}>
                  {isLoading ? "Syncing..." : "Sync"}
                </Button>
              </div>

              <div className="space-y-2 pl-7">
                <div className="flex items-center justify-between">
                  <Label htmlFor="linkedin-username" className="text-sm">
                    Username
                  </Label>
                  <Input
                    id="linkedin-username"
                    value={linkedinUsername}
                    onChange={(e) => setLinkedinUsername(e.target.value)}
                    className="w-48 h-8 text-sm"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-linkedin-experience"
                    checked={includeLinkedinExperience}
                    onCheckedChange={setIncludeLinkedinExperience}
                  />
                  <Label htmlFor="include-linkedin-experience" className="text-sm">
                    Include work experience
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-linkedin-education"
                    checked={includeLinkedinEducation}
                    onCheckedChange={setIncludeLinkedinEducation}
                  />
                  <Label htmlFor="include-linkedin-education" className="text-sm">
                    Include education
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-linkedin-skills"
                    checked={includeLinkedinSkills}
                    onCheckedChange={setIncludeLinkedinSkills}
                  />
                  <Label htmlFor="include-linkedin-skills" className="text-sm">
                    Include skills
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>Help us improve the CV editor by sharing your thoughts.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback-type">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={(value) => setFeedbackType(value as any)}>
                <SelectTrigger id="feedback-type">
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Your Feedback</Label>
              <Textarea
                id="feedback-message"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Tell us what you think..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitFeedback}>Submit Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Command Palette */}
      <CommandDialog open={isCommandPaletteOpen} onOpenChange={setIsCommandPaletteOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => {
                saveToGithub()
                setIsCommandPaletteOpen(false)
              }}
            >
              <Save className="mr-2 h-4 w-4" />
              <span>Save to GitHub</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                validateCVContent()
                setIsCommandPaletteOpen(false)
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Validate CV</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setViewMode(viewMode === "preview" ? "code" : "preview")
                setIsCommandPaletteOpen(false)
              }}
            >
              {viewMode === "preview" ? (
                <>
                  <Code className="mr-2 h-4 w-4" />
                  <span>Switch to Code View</span>
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Switch to Preview</span>
                </>
              )}
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                onSelect={() => {
                  setActiveProjectId(project.id)
                  setIsCommandPaletteOpen(false)
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Toaster />
    </div>
  )
}

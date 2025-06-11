"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, X, Copy, ExternalLink, Sun, Moon, Clock, Loader2 } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  url: string
  timestamp: number
}

export default function URLValidator() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [history, setHistory] = useState<ValidationResult[]>([])
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  // Load theme and history from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const savedHistory = localStorage.getItem("urlHistory")

    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  // URL validation regex - supports http/https and no-protocol URLs
  const validateURL = (inputUrl: string): boolean => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

    // Check if it's a valid URL with or without protocol
    return urlPattern.test(inputUrl) || domainPattern.test(inputUrl)
  }

  // Format URL to ensure it has a protocol for linking
  const formatURL = (inputUrl: string): string => {
    if (!/^https?:\/\//i.test(inputUrl)) {
      return `https://${inputUrl}`
    }
    return inputUrl
  }

  // Handle URL validation
  const handleValidation = async () => {
    if (!url.trim()) return

    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const isValid = validateURL(url.trim())
    const result: ValidationResult = {
      isValid,
      url: url.trim(),
      timestamp: Date.now(),
    }

    setValidationResult(result)
    setIsLoading(false)

    // Update history
    const newHistory = [result, ...history.slice(0, 4)]
    setHistory(newHistory)
    localStorage.setItem("urlHistory", JSON.stringify(newHistory))
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidation()
    }
  }

  // Copy URL to clipboard
  const copyToClipboard = async (urlToCopy: string) => {
    try {
      await navigator.clipboard.writeText(formatURL(urlToCopy))
      setShowTooltip("copied")
      setTimeout(() => setShowTooltip(null), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  // Clear history
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("urlHistory")
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">URL Validator</h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Validate URLs quickly and easily</p>
        </header>

        {/* Main Input Section */}
        <main className="space-y-6">
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter URL here..."
                  className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  aria-label="URL input field"
                />
              </div>

              <button
                onClick={handleValidation}
                disabled={!url.trim() || isLoading}
                className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                aria-label="Validate URL"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate URL"
                )}
              </button>
            </div>
          </section>

          {/* Results Section */}
          {validationResult && (
            <section
              className={`rounded-xl shadow-lg p-6 border transition-all duration-500 transform ${
                validationResult.isValid
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 animate-in slide-in-from-bottom-4"
                  : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 animate-in slide-in-from-bottom-4"
              }`}
              role="region"
              aria-label="Validation result"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2 rounded-full ${
                    validationResult.isValid ? "bg-emerald-100 dark:bg-emerald-800" : "bg-rose-100 dark:bg-rose-800"
                  }`}
                >
                  {validationResult.isValid ? (
                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      validationResult.isValid
                        ? "text-emerald-800 dark:text-emerald-200"
                        : "text-rose-800 dark:text-rose-200"
                    }`}
                  >
                    {validationResult.isValid ? "Valid URL" : "Invalid URL"}
                  </h3>

                  <p
                    className={`mb-4 break-all ${
                      validationResult.isValid
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {validationResult.url}
                  </p>

                  {validationResult.isValid && (
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={formatURL(validationResult.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        aria-label={`Open ${validationResult.url} in new tab`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open URL
                      </a>

                      <div className="relative">
                        <button
                          onClick={() => copyToClipboard(validationResult.url)}
                          onMouseEnter={() => setShowTooltip("copy")}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                          aria-label="Copy URL to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                          Copy URL
                        </button>

                        {showTooltip === "copy" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap">
                            Click to copy
                          </div>
                        )}

                        {showTooltip === "copied" && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-green-600 text-white text-sm rounded whitespace-nowrap">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* History Section */}
          {history.length > 0 && (
            <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Validations
                </h2>
                <button
                  onClick={clearHistory}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  aria-label="Clear validation history"
                >
                  Clear History
                </button>
              </div>

              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={`${item.url}-${item.timestamp}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={`p-1 rounded-full ${
                          item.isValid ? "bg-emerald-100 dark:bg-emerald-800" : "bg-rose-100 dark:bg-rose-800"
                        }`}
                      >
                        {item.isValid ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        )}
                      </div>
                      <span className="text-gray-900 dark:text-white truncate">{item.url}</span>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {item.isValid && (
                        <>
                          <a
                            href={formatURL(item.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200"
                            aria-label={`Open ${item.url} in new tab`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(item.url)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                            aria-label="Copy URL to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>Built with React and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  )
}

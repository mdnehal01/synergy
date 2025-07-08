"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Copy, Loader2, Sparkles, RefreshCw, Plus, Type, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TextSelectionPopupProps {
    isOpen: boolean
    selectedText: string
    position: { x: number; y: number }
    onClose: () => void
    onInsertText: (text: string) => void
}

export const TextSelectionPopup = ({ 
    isOpen, 
    selectedText, 
    position,
    onClose, 
    onInsertText 
}: TextSelectionPopupProps) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeAction, setActiveAction] = useState<string | null>(null)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    useEffect(() => {
        if (!isOpen) {
            setActiveAction(null)
        }
    }, [isOpen])

    // 3-second typing animation directly in the editor
    const animateDirectlyInEditor = (text: string) => {
        // Close popup immediately
        onClose()
        
        // Show loading toast
        const loadingToast = toast.loading("Generating content...")
        
        // Split text into words for word-by-word insertion
        const words = text.trim().split(/\s+/).filter(word => word.length > 0)
        if (words.length === 0) return
        
        // Calculate timing to make it exactly 3 seconds
        const totalDuration = 3000 // 3 seconds
        const steps = words.length
        const stepDuration = totalDuration / steps
        
        let currentStep = 0
        let insertedWords = 0
        
        const animationInterval = setInterval(() => {
            if (insertedWords < words.length) {
                // Insert the next word with proper spacing
                let wordToInsert = words[insertedWords]
                
                // Add space before word (except for the first word)
                if (insertedWords > 0) {
                    wordToInsert = ' ' + wordToInsert
                }
                
                onInsertText(wordToInsert)
                insertedWords++
            }
            
            currentStep++
            if (currentStep >= steps) {
                clearInterval(animationInterval)
                
                // Ensure all words are inserted
                if (insertedWords < words.length) {
                    const remainingWords = words.slice(insertedWords)
                    if (remainingWords.length > 0) {
                        const remainingText = ' ' + remainingWords.join(' ')
                        onInsertText(remainingText)
                    }
                }
                
                // Dismiss loading toast and show success
                toast.dismiss(loadingToast)
                toast.success("Content generated and inserted successfully!")
            }
        }, stepDuration)
        
        return () => clearInterval(animationInterval)
    }

    const handleAIAction = async (action: string, prompt: string) => {
        if (!selectedText.trim()) {
            toast.error("No text selected")
            return
        }

        try {
            setIsProcessing(true)
            setActiveAction(action)

            console.log('Making AI request:', { action, prompt: prompt.substring(0, 50) + '...', selectedText: selectedText.substring(0, 50) + '...' })
            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    prompt: `${prompt}\n\nText: "${selectedText}"` 
                }),
            })

            console.log('Response status:', response.status)
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Error response:', errorText)
                
                let error
                try {
                    error = JSON.parse(errorText)
                } catch {
                    error = { message: `HTTP ${response.status}: ${errorText}` }
                }
                
                throw new Error(error.message || "Failed to process text")
            }

            const data = await response.json()
            console.log('Success response:', data)
            
            if (data.content) {
                if (action === "generate") {
                    // For "Generate More", show 3-second animation directly in editor
                    animateDirectlyInEditor(data.content.trim())
                } else {
                    // For other actions, insert immediately
                    onInsertText(data.content)
                    toast.success(`Text ${action}d and inserted successfully!`)
                    onClose()
                }
            } else {
                throw new Error("No content generated")
            }
            
        } catch (error) {
            console.error("AI processing error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to process text")
        } finally {
            setIsProcessing(false)
            setActiveAction(null)
        }
    }

    const handleSummarize = () => {
        handleAIAction("summarize", "Please provide a concise summary of the following text. Return ONLY the summary, do not repeat the original text:")
    }

    const handleRephrase = () => {
        handleAIAction("rephrase", "Please rephrase and rewrite the following text while maintaining its original meaning. Use different words and sentence structure but keep the same message and tone. Return ONLY the rephrased version, do not include the original text:")
    }

    const handleGenerateFurther = () => {
        handleAIAction("generate", "Please expand on the following text by adding more details, examples, or related information. Continue the thought naturally. Return ONLY the additional content that should come after the original text, do not repeat the original text:")
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(selectedText)
            toast.success("Text copied to clipboard!")
            onClose()
        } catch (error) {
            console.error("Copy failed:", error)
            toast.error("Failed to copy text")
        }
    }

    if (!isOpen) return null

    return (
        <div
            ref={popupRef}
            className={cn(
                "fixed z-[100000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3",
                "min-w-[320px] max-w-[500px]"
            )}
            style={{
                left: Math.min(position.x, window.innerWidth - 520),
                top: Math.min(position.y + 10, window.innerHeight - 200),
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-theme-green" />
                    <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                    disabled={isProcessing}
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            {/* Selected Text Preview */}
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs max-h-16 overflow-y-auto">
                <span className="text-gray-600 dark:text-gray-300">
                    {selectedText.length > 100 ? `${selectedText.substring(0, 100)}...` : selectedText}
                </span>
            </div>

            {/* Processing State */}
            {isProcessing && (
                <div className="mb-3 p-3 bg-theme-lightgreen/10 border border-theme-green/20 rounded-lg">
                    <div className="flex items-center gap-2 text-theme-green">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">
                            {activeAction === "summarize" && "Summarizing text..."}
                            {activeAction === "rephrase" && "Rephrasing text..."}
                            {activeAction === "generate" && "Generating more content..."}
                        </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {activeAction === "generate" && "Content will be inserted automatically when ready"}
                    </p>
                </div>
            )}

            {/* Live Generation Preview */}

            {/* Action Buttons */}
            <div className={cn("grid grid-cols-2 gap-2", isProcessing && "opacity-50 pointer-events-none")}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={isProcessing}
                    className="flex items-center gap-1 h-9 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    {isProcessing && activeAction === "summarize" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Type className="h-3 w-3" />
                    )}
                    Summarize
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRephrase}
                    disabled={isProcessing}
                    className="flex items-center gap-1 h-9 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    {isProcessing && activeAction === "rephrase" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <RefreshCw className="h-3 w-3" />
                    )}
                    Rephrase
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateFurther}
                    disabled={isProcessing}
                    className="flex items-center gap-1 h-9 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    {isProcessing && activeAction === "generate" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Plus className="h-3 w-3" />
                    )}
                    Generate More
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={isProcessing}
                    className="flex items-center gap-1 h-9 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    <Copy className="h-3 w-3" />
                    Copy
                </Button>
            </div>

            {/* Help Text */}
            {!isProcessing && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Select an action above to process your text with AI
                    </p>
                </div>
            )}
        </div>
    )
}
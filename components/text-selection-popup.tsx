"use client"

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
    const [generatedContent, setGeneratedContent] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
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
            setGeneratedContent("")
            setIsTyping(false)
            setShowPreview(false)
        }
    }, [isOpen])

    // Typing animation effect
    const typeText = (text: string, speed: number = 30) => {
        setIsTyping(true)
        setGeneratedContent("")
        setShowPreview(true)
        
        let index = 0
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                setGeneratedContent(prev => prev + text[index])
                index++
            } else {
                clearInterval(typeInterval)
                setIsTyping(false)
            }
        }, speed)

        return () => clearInterval(typeInterval)
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
                // For "Generate More", show typing animation
                if (action === "generate") {
                    typeText(data.content.trim())
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
            setShowPreview(false)
        } finally {
            setIsProcessing(false)
            setActiveAction(null)
        }
    }

    const handleInsertGenerated = () => {
        if (generatedContent.trim()) {
            onInsertText(generatedContent)
            toast.success("Generated content inserted successfully!")
            onClose()
        }
    }

    const handleCopyGenerated = async () => {
        if (generatedContent.trim()) {
            try {
                await navigator.clipboard.writeText(generatedContent)
                toast.success("Generated content copied to clipboard!")
            } catch (error) {
                console.error("Copy failed:", error)
                toast.error("Failed to copy content")
            }
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
                top: Math.min(position.y + 10, window.innerHeight - (showPreview ? 400 : 200)),
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
                        {activeAction === "generate" 
                            ? "Generated content will appear below with typing animation"
                            : "Content will be inserted automatically when ready"
                        }
                    </p>
                </div>
            )}

            {/* Generated Content Preview with Typing Animation */}
            {showPreview && (
                <div className="mb-3 border border-theme-green/20 rounded-lg overflow-hidden">
                    <div className="bg-theme-lightgreen/5 px-3 py-2 border-b border-theme-green/20">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-theme-green">Generated Content</span>
                            {isTyping && (
                                <div className="flex items-center gap-1 text-theme-green">
                                    <div className="w-1 h-1 bg-theme-green rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-theme-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-1 h-1 bg-theme-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    <span className="text-xs ml-1">Generating...</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-3">
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="text-gray-500 dark:text-gray-400">{selectedText}</span>
                            <span className="text-theme-green font-medium">{generatedContent}</span>
                            {isTyping && (
                                <span className="inline-block w-2 h-4 bg-theme-green ml-1 animate-pulse"></span>
                            )}
                        </div>
                        
                        {!isTyping && generatedContent && (
                            <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                                <Button
                                    size="sm"
                                    onClick={handleInsertGenerated}
                                    className="bg-theme-green hover:bg-theme-lightgreen flex items-center gap-1 h-7 text-xs"
                                >
                                    <Plus className="h-3 w-3" />
                                    Insert
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyGenerated}
                                    className="flex items-center gap-1 h-7 text-xs"
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className={cn("grid grid-cols-2 gap-2", showPreview && "opacity-50 pointer-events-none")}>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={isProcessing || showPreview}
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
                    disabled={isProcessing || showPreview}
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
                    disabled={isProcessing || showPreview}
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
                    disabled={isProcessing || showPreview}
                    className="flex items-center gap-1 h-9 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    <Copy className="h-3 w-3" />
                    Copy
                </Button>
            </div>

            {/* Help Text */}
            {!showPreview && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Select an action above to process your text with AI
                    </p>
                </div>
            )}
        </div>
    )
}
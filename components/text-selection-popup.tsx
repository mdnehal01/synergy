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
    const [result, setResult] = useState("")
    const [activeAction, setActiveAction] = useState<string | null>(null)
    const [showResult, setShowResult] = useState(false)
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
            setResult("")
            setShowResult(false)
            setActiveAction(null)
        }
    }, [isOpen])

    const handleAIAction = async (action: string, prompt: string) => {
        if (!selectedText.trim()) {
            toast.error("No text selected")
            return
        }

        try {
            setIsProcessing(true)
            setActiveAction(action)
            setResult("")
            setShowResult(true)

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
            setResult(data.content)
            
        } catch (error) {
            console.error("AI processing error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to process text")
            setShowResult(false)
        } finally {
            setIsProcessing(false)
            setActiveAction(null)
        }
    }

    const handleSummarize = () => {
        handleAIAction("summarize", "Please provide a concise summary of the following text. Keep it clear and to the point:")
    }

    const handleRephrase = () => {
        handleAIAction("rephrase", "Please rephrase and rewrite the following text while maintaining its original meaning. Use different words and sentence structure but keep the same message and tone:")
    }

    const handleGenerateFurther = () => {
        handleAIAction("generate", "Please expand on the following text by adding more details, examples, or related information. Continue the thought naturally:")
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

    const handleInsertResult = () => {
        if (result.trim()) {
            onInsertText(result)
            toast.success("Text inserted successfully!")
            onClose()
        }
    }

    const handleCopyResult = async () => {
        if (result.trim()) {
            try {
                await navigator.clipboard.writeText(result)
                toast.success("Result copied to clipboard!")
            } catch (error) {
                console.error("Copy failed:", error)
                toast.error("Failed to copy result")
            }
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
                top: Math.min(position.y + 10, window.innerHeight - 400),
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSummarize}
                    disabled={isProcessing}
                    className="flex items-center gap-1 h-8 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
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
                    className="flex items-center gap-1 h-8 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
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
                    className="flex items-center gap-1 h-8 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
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
                    className="flex items-center gap-1 h-8 text-xs hover:bg-theme-lightgreen/10 hover:border-theme-green"
                >
                    <Copy className="h-3 w-3" />
                    Copy
                </Button>
            </div>

            {/* Loading State */}
            {isProcessing && (
                <div className="flex items-center justify-center py-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 text-theme-green">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Processing...</span>
                    </div>
                </div>
            )}

            {/* Result Display */}
            {showResult && result && (
                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <div className="mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">AI Result:</span>
                    </div>
                    <Textarea
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        className="min-h-[80px] text-xs resize-none mb-2"
                        placeholder="AI result will appear here..."
                    />
                    
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyResult}
                            className="flex items-center gap-1 h-7 text-xs"
                        >
                            <Copy className="h-3 w-3" />
                            Copy
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleInsertResult}
                            className="bg-theme-green hover:bg-theme-lightgreen flex items-center gap-1 h-7 text-xs"
                        >
                            <Plus className="h-3 w-3" />
                            Insert
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
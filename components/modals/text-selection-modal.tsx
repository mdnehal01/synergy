"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Copy, Loader2, Sparkles, RefreshCw, Plus, Type } from "lucide-react"
import { toast } from "sonner"

interface TextSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    selectedText: string
    onInsertText: (text: string) => void
}

export const TextSelectionModal = ({ 
    isOpen, 
    onClose, 
    selectedText, 
    onInsertText 
}: TextSelectionModalProps) => {
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState("")
    const [activeAction, setActiveAction] = useState<string | null>(null)

    const handleAIAction = async (action: string, prompt: string) => {
        if (!selectedText.trim()) {
            toast.error("No text selected")
            return
        }

        try {
            setIsProcessing(true)
            setActiveAction(action)
            setResult("")

            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    prompt: `${prompt}\n\nText: "${selectedText}"` 
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to process text")
            }

            const data = await response.json()
            setResult(data.content)
            
        } catch (error) {
            console.error("AI processing error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to process text")
        } finally {
            setIsProcessing(false)
            setActiveAction(null)
        }
    }

    const handleSummarize = () => {
        handleAIAction("summarize", "Please provide a concise summary of the following text. Keep it clear and to the point:")
    }

    const handleRephrase = () => {
        handleAIAction("rephrase", "Please rephrase the following text while maintaining its original meaning. Make it clearer and more engaging:")
    }

    const handleGenerateFurther = () => {
        handleAIAction("generate", "Please expand on the following text by adding more details, examples, or related information. Continue the thought naturally:")
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(selectedText)
            toast.success("Text copied to clipboard!")
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

    const handleClose = () => {
        setResult("")
        setActiveAction(null)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-theme-green" />
                        AI Text Assistant
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Selected Text Display */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Selected Text:
                        </label>
                        <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
                            {selectedText}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSummarize}
                            disabled={isProcessing}
                            className="flex items-center gap-2 h-auto py-3 hover:bg-theme-lightgreen/10 hover:border-theme-green"
                        >
                            {isProcessing && activeAction === "summarize" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Type className="h-4 w-4" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">Summarize</div>
                                <div className="text-xs text-muted-foreground">Create a brief summary</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleRephrase}
                            disabled={isProcessing}
                            className="flex items-center gap-2 h-auto py-3 hover:bg-theme-lightgreen/10 hover:border-theme-green"
                        >
                            {isProcessing && activeAction === "rephrase" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">Rephrase</div>
                                <div className="text-xs text-muted-foreground">Rewrite differently</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleGenerateFurther}
                            disabled={isProcessing}
                            className="flex items-center gap-2 h-auto py-3 hover:bg-theme-lightgreen/10 hover:border-theme-green"
                        >
                            {isProcessing && activeAction === "generate" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">Generate Further</div>
                                <div className="text-xs text-muted-foreground">Expand with more content</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleCopy}
                            disabled={isProcessing}
                            className="flex items-center gap-2 h-auto py-3 hover:bg-theme-lightgreen/10 hover:border-theme-green"
                        >
                            <Copy className="h-4 w-4" />
                            <div className="text-left">
                                <div className="font-medium">Copy</div>
                                <div className="text-xs text-muted-foreground">Copy to clipboard</div>
                            </div>
                        </Button>
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-muted-foreground">
                                AI Result:
                            </label>
                            <Textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                className="min-h-[120px] resize-none"
                                placeholder="AI result will appear here..."
                            />
                            
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyResult}
                                    className="flex items-center gap-1"
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy Result
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleInsertResult}
                                    className="bg-theme-green hover:bg-theme-lightgreen flex items-center gap-1"
                                >
                                    <Plus className="h-3 w-3" />
                                    Insert into Document
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isProcessing && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2 text-theme-green">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Processing with Gemini AI...</span>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
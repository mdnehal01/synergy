"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { Loader2, Sparkles, FileText, PlusCircle, Copy, Check } from "lucide-react"
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
    const [copied, setCopied] = useState(false)
    const [currentAction, setCurrentAction] = useState<string>("")

    const handleAIAction = async (action: 'summarize' | 'generate' | 'improve' | 'explain') => {
        if (!selectedText.trim()) {
            toast.error("No text selected")
            return
        }

        setIsProcessing(true)
        setCurrentAction(action)
        setResult("")

        try {
            let prompt = ""
            
            switch (action) {
                case 'summarize':
                    prompt = `Please provide a concise summary of the following text:\n\n${selectedText}`
                    break
                case 'generate':
                    prompt = `Based on the following text, generate additional content that continues or expands on the topic:\n\n${selectedText}`
                    break
                case 'improve':
                    prompt = `Please improve and enhance the following text while maintaining its original meaning:\n\n${selectedText}`
                    break
                case 'explain':
                    prompt = `Please provide a detailed explanation of the following text:\n\n${selectedText}`
                    break
            }

            const response = await fetch("/api/ai/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to process text")
            }

            const data = await response.json()
            setResult(data.content)
            toast.success(`Text ${action}d successfully!`)

        } catch (error) {
            console.error("AI processing error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to process text")
        } finally {
            setIsProcessing(false)
            setCurrentAction("")
        }
    }

    const handleCopy = async () => {
        if (!result) return
        
        try {
            await navigator.clipboard.writeText(result)
            setCopied(true)
            toast.success("Result copied to clipboard!")
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error("Failed to copy to clipboard")
        }
    }

    const handleInsert = () => {
        if (!result) return
        
        onInsertText(result)
        toast.success("Text inserted into editor!")
        handleClose()
    }

    const handleClose = () => {
        setResult("")
        setCurrentAction("")
        setIsProcessing(false)
        setCopied(false)
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
                        <label className="text-sm font-medium">Selected Text:</label>
                        <div className="p-3 bg-muted rounded-md border max-h-32 overflow-y-auto">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {selectedText || "No text selected"}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={() => handleAIAction('summarize')}
                            disabled={isProcessing || !selectedText.trim()}
                            className="flex items-center gap-2 hover:bg-theme-lightgreen/10 hover:text-theme-green hover:border-theme-green"
                        >
                            {isProcessing && currentAction === 'summarize' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            Summarize
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleAIAction('generate')}
                            disabled={isProcessing || !selectedText.trim()}
                            className="flex items-center gap-2 hover:bg-theme-lightgreen/10 hover:text-theme-green hover:border-theme-green"
                        >
                            {isProcessing && currentAction === 'generate' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <PlusCircle className="h-4 w-4" />
                            )}
                            Generate More
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleAIAction('improve')}
                            disabled={isProcessing || !selectedText.trim()}
                            className="flex items-center gap-2 hover:bg-theme-lightgreen/10 hover:text-theme-green hover:border-theme-green"
                        >
                            {isProcessing && currentAction === 'improve' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Improve Text
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => handleAIAction('explain')}
                            disabled={isProcessing || !selectedText.trim()}
                            className="flex items-center gap-2 hover:bg-theme-lightgreen/10 hover:text-theme-green hover:border-theme-green"
                        >
                            {isProcessing && currentAction === 'explain' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            Explain
                        </Button>
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">AI Result:</label>
                            <Textarea
                                value={result}
                                onChange={(e) => setResult(e.target.value)}
                                className="min-h-[120px] resize-none"
                                placeholder="AI result will appear here..."
                            />
                            
                            {/* Result Actions */}
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="flex items-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                                
                                <Button
                                    size="sm"
                                    onClick={handleInsert}
                                    className="bg-theme-green hover:bg-theme-lightgreen flex items-center gap-2"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    Insert into Editor
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

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { useAIGeneration } from "@/hooks/use-ai-generation"
import { toast } from "sonner"

interface AIGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  onContentGenerate: (content: string) => void
  isGenerating: boolean
}

export function AIGenerationModal({
  isOpen,
  onClose,
  onContentGenerate,
  isGenerating
}: AIGenerationModalProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const { setGenerating } = useAIGeneration()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    try {
      setGenerating(true)
      setGeneratedContent("")

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
      toast.success("Content generated successfully with Gemini!")
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to generate content")
    } finally {
      setGenerating(false)
    }
  }

  const handleInsert = () => {
    if (generatedContent) {
      onContentGenerate(generatedContent)
      handleClose()
    }
  }

  const handleClose = () => {
    setPrompt("")
    setGeneratedContent("")
    onClose()
  }

  const handleRegenerate = () => {
    setGeneratedContent("")
    handleGenerate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Content Generator (Powered by Gemini)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              What would you like me to write about?
            </label>
            <Textarea
              placeholder="e.g., Write a blog post about the benefits of remote work, Create a product description for a new smartphone, Explain quantum computing in simple terms..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with Gemini
                </>
              )}
            </Button>
            
            {generatedContent && !isGenerating && (
              <Button 
                variant="outline"
                onClick={handleRegenerate}
              >
                Regenerate
              </Button>
            )}
          </div>

          {generatedContent && (
            <div className="space-y-3">
              <label className="text-sm font-medium block">Generated Content:</label>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border max-h-[300px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedContent}
                </pre>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleInsert}
                  className="bg-theme-green hover:bg-theme-lightgreen"
                >
                  Insert Content
                </Button>
              </div>
            </div>
          )}

          {!generatedContent && !isGenerating && (
            <div className="flex justify-end">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
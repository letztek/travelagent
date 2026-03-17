'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { parseImportData, finalizeImport } from '../actions'
import { fileToBase64 } from '@/lib/utils/file-conversion'
import { ImportReview } from './ImportReview'
import { ImportParserResult } from '@/lib/skills/import-parser'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']

export function ImportWizard() {
  const router = useRouter()
  const [files, setFiles] = useState<File[]>([])
  const [textInput, setTextInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedData, setParsedData] = useState<ImportParserResult | null>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const droppedFiles = Array.from(e.dataTransfer.files)
    validateAndAddFiles(droppedFiles)
  }, [files])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files))
    }
  }

  const validateAndAddFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`不支援的檔案格式：${file.name}。請上傳 PDF 或圖片檔。`)
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`檔案過大：${file.name}。請上傳小於 10MB 的檔案。`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleImport = async () => {
    if (files.length === 0 && !textInput.trim()) {
      setError('請上傳檔案或貼上行程文字。')
      return
    }

    setIsProcessing(true)
    setError(null)
    
    try {
      const base64Files = await Promise.all(files.map(fileToBase64))
      const result = await parseImportData(textInput, base64Files)
      
      if (result.success && result.data) {
        setParsedData(result.data)
      } else {
        setError(result.error || '解析失敗，請稍後再試。')
      }
    } catch (err: any) {
      setError(err.message || '系統發生預期外的錯誤。')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = async (formData: any) => {
    if (!parsedData) return
    setIsProcessing(true)
    setError(null)

    try {
      const metadata = {
        origin: formData.origin,
        destinations: formData.destinations,
        travel_dates: { start: formData.startDate, end: formData.endDate },
        travelers: { adult: Number(formData.adults), child: Number(formData.children), infant: 0, senior: 0 },
        budget_range: formData.budget,
        preferences: { dietary: [], accommodation: [] },
        notes: '從檔案匯入'
      }

      const result = await finalizeImport(metadata as any, parsedData.itinerary)

      if (result.success && result.itineraryId) {
        router.push(`/itineraries/${result.itineraryId}`)
      } else {
        setError(result.error || '建檔失敗')
      }
    } catch (err: any) {
      setError(err.message || '建檔發生錯誤')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    setParsedData(null)
    setFiles([])
    setTextInput('')
  }

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="text-red-500" />
    if (type.includes('wordprocessingml')) return <FileText className="text-blue-500" />
    if (type.startsWith('image/')) return <ImageIcon className="text-green-500" />
    return <FileText />
  }

  if (parsedData) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20 max-w-6xl mx-auto">
            {error}
          </div>
        )}
        <ImportReview 
          data={parsedData} 
          onConfirm={handleConfirm} 
          onCancel={handleCancel} 
        />
        {isProcessing && (
          <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg flex items-center gap-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>正在建立專案與行程...</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>上傳檔案</CardTitle>
          <CardDescription>支援 PDF, JPG, PNG，單檔最大 10MB。</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">拖曳檔案至此，或點擊選擇檔案</p>
              <p className="text-xs text-muted-foreground">可以一次上傳多個檔案</p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,image/jpeg,image/png"
              className="hidden"
              id="file-upload"
              onChange={handleFileInput}
            />
            <Button asChild variant="outline" className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                瀏覽檔案
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium">已選擇的檔案 ({files.length})</h3>
              <div className="grid gap-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeFile(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-medium">或者，直接貼上純文字內容</h3>
            <Textarea 
              placeholder="貼上行程表文字，例如：Day 1: 抵達東京 -> 淺草寺..." 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {error && (
            <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleImport} 
              disabled={isProcessing || (files.length === 0 && !textInput.trim())}
              className="w-full sm:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AI 正在解析內容...
                </>
              ) : (
                '開始解析行程'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

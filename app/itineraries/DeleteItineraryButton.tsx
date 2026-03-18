'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteItinerary } from './actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteItineraryButtonProps {
  id: string
}

export default function DeleteItineraryButton({ id }: DeleteItineraryButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteItinerary(id)
      if (result.success) {
        toast.success("刪除成功", {
          description: "該行程已從系統移除。",
        })
        setOpen(false)
        router.refresh()
      } else {
        toast.error("刪除失敗", {
          description: result.error || "無法執行刪除操作，請稍後再試。",
        })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors h-12 w-12 rounded-xl"
          disabled={isPending}
          onClick={(e) => e.stopPropagation()}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-900">確定要刪除此行程嗎？</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500">
            此操作無法復原。刪除後，該行程資料將被永久移除，但其對應的「旅遊需求」仍會保留。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full border-slate-200">取消</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                刪除中...
              </>
            ) : '確定刪除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

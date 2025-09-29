// src/hooks/use-toast.js
import { toast as sonnerToast } from "sonner"

export const useToast = () => {
  return {
    toast: sonnerToast
  }
}
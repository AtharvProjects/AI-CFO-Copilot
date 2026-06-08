"use client"

import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Send, X, Bot, Sparkles, ArrowRight, MessageSquare, RefreshCw } from "lucide-react"
import api from "../../services/api"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

const ColorOrb = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }
  const dimValue = parseInt(dimension.replace("px", ""), 10)
  const blurStrength = dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)
  const shadowRange = dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)
  const maskRadius = dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  return (
    <div
      className={cn("color-orb", className)}
      style={{
        width: dimension,
        height: dimension,
        "--base": palette.base,
        "--accent1": palette.accent1,
        "--accent2": palette.accent2,
        "--accent3": palette.accent3,
        "--spin-duration": `${spinDuration}s`,
        "--blur": `${blurStrength}px`,
        "--dot": `${dimValue * 0.01}px`,
        "--shadow": `${shadowRange}px`,
        "--mask": maskRadius,
      }}
    >
      <style>{`
        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
        }
        .color-orb::before {
          content: "";
          grid-area: stack;
          width: 100%;
          height: 100%;
          background: conic-gradient(from 0deg, var(--accent1), var(--accent2), var(--accent3), var(--accent1));
          filter: blur(var(--blur));
          animation: orb-spin var(--spin-duration) linear infinite;
        }
        @keyframes orb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const FORM_WIDTH = 400
const FORM_HEIGHT = 280

export function MorphPanel() {
  const navigate = useNavigate()
  const wrapperRef = React.useRef(null)
  const textareaRef = React.useRef(null)

  const [showForm, setShowForm] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [response, setResponse] = React.useState(null)
  const [query, setQuery] = React.useState("")

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    setIsProcessing(false)
    setResponse(null)
    setQuery("")
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      setIsProcessing(true)
      const res = await api.post('/chat/ask', { 
        message: query
      })
      setResponse(res.data.response)
    } catch (error) {
      toast.error("Pod connection failed. Try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  React.useEffect(() => {
    function clickOutsideHandler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && showForm) {
        // Only close if not processing
        if (!isProcessing) triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, isProcessing, triggerClose])

  return (
    <div className="fixed bottom-8 right-8 z-[9999] font-sans">
      <motion.div
        ref={wrapperRef}
        className={cn(
          "bg-white relative flex flex-col overflow-hidden border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500",
          showForm ? "rounded-[2rem]" : "rounded-full"
        )}
        initial={false}
        animate={{
          width: showForm ? FORM_WIDTH : 160,
          height: showForm ? (response ? 320 : FORM_HEIGHT) : 48,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div 
              key="dock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={triggerOpen}
              className="flex h-full w-full items-center justify-center gap-3 px-6 cursor-pointer hover:bg-slate-50 transition-colors select-none"
            >
              <ColorOrb dimension="22px" tones={{ base: "oklch(22.64% 0 0)" }} />
              <span className="truncate font-black text-[10px] uppercase tracking-[0.2em] text-slate-600">
                Ask AI Copilot
              </span>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex h-full flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-center py-4 px-6 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                      <Bot size={14} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                     CFO Intelligence Pod
                   </p>
                </div>
                <button 
                  disabled={isProcessing}
                  onClick={triggerClose}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-30"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {response ? (
                    <motion.div 
                      key="response"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 flex flex-col h-full"
                    >
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                           <Sparkles size={14} /> AI Recommendation
                        </div>
                        <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                          "{response}"
                        </p>
                      </div>
                      <div className="pt-6 flex gap-3">
                         <button 
                           onClick={() => navigate('/chat')}
                           className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                         >
                           Open Full Advisor <MessageSquare size={14} />
                         </button>
                         <button 
                           onClick={() => setResponse(null)}
                           className="px-6 py-3 border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                         >
                           Back
                         </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form 
                      key="input"
                      onSubmit={handleSubmit}
                      className="flex flex-col h-full"
                    >
                      <textarea
                        ref={textareaRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask me anything about your finances..."
                        disabled={isProcessing}
                        className="flex-1 w-full resize-none p-6 outline-none bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-300 disabled:opacity-50"
                        required
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(e)
                          }
                        }}
                      />
                      <div className="p-4 bg-slate-50/50 flex justify-end items-center border-t border-slate-50">
                         <button
                            type="submit"
                            disabled={isProcessing || !query.trim()}
                            className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <>Analyzing Pods <RefreshCw size={14} className="animate-spin" /></>
                            ) : (
                              <>Send Query <Send size={14} /></>
                            )}
                          </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default MorphPanel

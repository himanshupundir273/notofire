'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  onRecorded: (file: File) => void
  onRemove: () => void
  recording: File | null
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function VoiceRecorder({ onRecorded, onRemove, recording }: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (recording) {
      const url = URL.createObjectURL(recording)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAudioUrl(null)
    }
  }, [recording])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const mr = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const ext = mimeType.includes('webm') ? 'webm' : 'm4a'
        const file = new File([blob], `voice-note-${Date.now()}.${ext}`, { type: mimeType })
        onRecorded(file)
        stream.getTracks().forEach(t => t.stop())
      }

      mr.start()
      setIsRecording(true)
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } catch {
      alert('Microphone access denied. Please allow microphone access to record.')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }

  function togglePlay() {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(p => !p)
  }

  function handleRemove() {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
    setElapsed(0)
    onRemove()
  }

  // Active recording UI
  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <div className="relative flex-shrink-0">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping" />
        </div>
        <span className="text-sm font-mono font-semibold text-red-700 tabular-nums">
          {formatTime(elapsed)}
        </span>
        <span className="text-sm text-red-600 flex-1">Recording…</span>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={stopRecording}
          className="gap-2 flex-shrink-0"
        >
          <Square className="h-3.5 w-3.5 fill-current" />
          Stop
        </Button>
      </div>
    )
  }

  // Recorded preview UI
  if (recording && audioUrl) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-green-800">Voice note recorded</p>
          <p className="text-xs text-green-600 truncate">{recording.name}</p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
          title="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    )
  }

  // Idle — show record button
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={startRecording}
      className="gap-2 border-dashed"
    >
      <Mic className="h-4 w-4 text-red-500" />
      Record Voice Note
    </Button>
  )
}

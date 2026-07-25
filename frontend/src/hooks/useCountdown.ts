import { useState, useEffect } from 'react'
import { REGISTRATION_DEADLINE } from '../constants'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export const useCountdown = (deadline: Date = REGISTRATION_DEADLINE): TimeLeft => {
  const calculate = (): TimeLeft => {
    const diff = deadline.getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      isExpired: false,
    }
  }

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculate)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculate()), 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return timeLeft
}

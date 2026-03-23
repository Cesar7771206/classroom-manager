'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TypingTitleProps {
  text: string
  className?: string
}

export default function TypingTitle({ text, className = '' }: TypingTitleProps) {
  const [displayText, setDisplayText] = useState('')
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    let currentText = ''
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        currentText += text[index]
        setDisplayText(currentText)
        index++
      } else {
        setIsAnimating(false)
        clearInterval(interval)
      }
    }, 100) // Speed of typing

    return () => clearInterval(interval)
  }, [text])

  return (
    <h1 className={className}>
      {displayText}
      {isAnimating && (
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-[4px] h-[1em] bg-accent ml-1 align-middle"
        />
      )}
    </h1>
  )
}

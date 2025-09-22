import { useState } from 'react'

type Props = {
  height?: number
  className?: string
}

export default function KMRLLogo({ height = 28, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const sources = ['/KMRL-logo.png', '/kmrl-logo.svg', '/kmrl-logo.png']
  const [srcIndex, setSrcIndex] = useState(0)

  if (failed) {
    return (
      <span
        className={`font-extrabold tracking-wide text-teal-600 dark:text-teal-400 ${className}`}
        style={{ fontSize: Math.max(14, Math.round(height * 0.7)) }}
        aria-label="Kochi Metro Rail Limited"
      >
        KMRL
      </span>
    )
  }

  return (
    <img
      src={sources[srcIndex]}
      onError={() => {
        const next = srcIndex + 1
        if (next < sources.length) {
          setSrcIndex(next)
        } else {
          setFailed(true)
        }
      }}
      alt="Kochi Metro Rail Limited"
      height={height}
      style={{ height, width: 'auto' }}
      className={className}
    />
  )
}

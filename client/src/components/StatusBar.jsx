import { useState, useEffect } from 'react'
import { parseBeijingTime } from '../utils/beijingTime'

export default function StatusBar({ lastPunchTime }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!lastPunchTime) return

    function calcMinutes() {
      const diff = Date.now() - parseBeijingTime(lastPunchTime).getTime()
      return Math.floor(diff / 60000)
    }

    setElapsed(calcMinutes())
    const timer = setInterval(() => setElapsed(calcMinutes()), 60000)
    return () => clearInterval(timer)
  }, [lastPunchTime])

  if (!lastPunchTime) {
    return (
      <div className="status-bar-content">
        <span className="status-label">今天尚未打卡</span>
      </div>
    )
  }

  const timeStr = parseBeijingTime(lastPunchTime).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  return (
    <div className="status-bar-content">
      <span className="status-item">
        <span className="status-label">上次打卡</span>
        <span className="status-value">{timeStr}</span>
      </span>
      <span className="status-item">
        <span className="status-label">已用时</span>
        <span className="status-value">{elapsed} 分钟</span>
      </span>
    </div>
  )
}

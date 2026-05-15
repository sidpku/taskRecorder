import { useState } from 'react'
import './ExportDialog.css'

export default function ExportDialog({ isOpen, onClose }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exporting, setExporting] = useState(false)

  function formatDate(date) {
    return date.toISOString().slice(0, 10)
  }

  function setToday() {
    const today = formatDate(new Date())
    setStartDate(today)
    setEndDate(today)
  }

  function setThisWeek() {
    const now = new Date()
    const day = now.getDay()
    const diff = day === 0 ? 6 : day - 1
    const monday = new Date(now)
    monday.setDate(now.getDate() - diff)
    setStartDate(formatDate(monday))
    setEndDate(formatDate(now))
  }

  async function handleExport() {
    if (!startDate || !endDate) return
    setExporting(true)
    try {
      const response = await fetch(`/api/export?start=${startDate}&end=${endDate}`)
      if (!response.ok) throw new Error('导出失败')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `time-records-${startDate}-to-${endDate}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-dialog" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">CSV 导出</h2>

        {/* 快捷按钮 */}
        <div className="export-shortcuts">
          <button className="shortcut-btn" onClick={setToday}>今天</button>
          <button className="shortcut-btn" onClick={setThisWeek}>本周</button>
        </div>

        {/* 日期选择 */}
        <div className="export-dates">
          <div className="date-field">
            <label className="date-label">开始日期</label>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-field">
            <label className="date-label">结束日期</label>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          className="export-btn"
          onClick={handleExport}
          disabled={!startDate || !endDate || exporting}
        >
          {exporting ? '导出中...' : '导出 CSV'}
        </button>
      </div>
    </div>
  )
}

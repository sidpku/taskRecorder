import { useState, useEffect, useRef, useCallback } from 'react'
import { createPunch, createTag, updatePunch, createFragment } from '../api'
import { toBeijingISOString } from '../utils/beijingTime'

export default function PunchPanel({ selectedTags, onClearTags, isFirstPunch, onPunch, onTagsChange, lastPunch, date, onFragmentCreated }) {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  // 备注相关状态
  const [notes, setNotes] = useState('')
  const notesTimerRef = useRef(null)
  const lastSavedNotesRef = useRef('')

  // 碎片时间相关状态
  const [fragDuration, setFragDuration] = useState('')
  const [fragDesc, setFragDesc] = useState('')
  const [fragLoading, setFragLoading] = useState(false)

  // 加载最后一条打卡的备注
  useEffect(() => {
    if (lastPunch && lastPunch.notes != null) {
      setNotes(lastPunch.notes)
      lastSavedNotesRef.current = lastPunch.notes
    } else {
      setNotes('')
      lastSavedNotesRef.current = ''
    }
  }, [lastPunch?.id])

  // 保存备注的函数
  const saveNotes = useCallback(async (text) => {
    if (!lastPunch || text === lastSavedNotesRef.current) return
    try {
      await updatePunch(lastPunch.id, date, { notes: text })
      lastSavedNotesRef.current = text
    } catch (e) {
      console.error('保存备注失败:', e)
    }
  }, [lastPunch, date])

  // 防抖自动保存（2秒）
  useEffect(() => {
    if (!lastPunch) return
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    notesTimerRef.current = setTimeout(() => {
      saveNotes(notes)
    }, 2000)
    return () => {
      if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    }
  }, [notes, saveNotes, lastPunch])

  function buildDescription() {
    const parts = []
    if (selectedTags.length > 0) {
      parts.push(selectedTags.join(', '))
    }
    if (description.trim()) {
      parts.push(description.trim())
    }
    return parts.join(', ')
  }

  async function handlePunch() {
    // 打卡前先保存当前备注
    if (lastPunch && notes !== lastSavedNotesRef.current) {
      await saveNotes(notes)
    }

    const desc = buildDescription()
    setLoading(true)
    try {
      await createPunch({
        time: toBeijingISOString(),
        description: desc
      })
      onClearTags?.()
      setDescription('')
      setNotes('')  // 新时间段开始，清空备注
      lastSavedNotesRef.current = ''
      onPunch?.()
    } catch (e) {
      console.error(e)
      alert('打卡失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveAsTag() {
    const name = description.trim()
    if (!name) return
    try {
      await createTag({ name })
      setDescription('')
      onTagsChange?.()
    } catch (e) {
      console.error(e)
      alert('创建标签失败')
    }
  }

  // 备注失焦时保存
  function handleNotesBlur() {
    if (notesTimerRef.current) clearTimeout(notesTimerRef.current)
    saveNotes(notes)
  }

  // 碎片时间提交
  async function handleFragmentSubmit() {
    const duration = parseInt(fragDuration, 10)
    if (!duration || duration <= 0) {
      alert('请输入有效的分钟数')
      return
    }
    setFragLoading(true)
    try {
      await createFragment({ duration, description: fragDesc.trim() || '' })
      setFragDuration('')
      setFragDesc('')
      onFragmentCreated?.()
    } catch (e) {
      console.error(e)
      alert('记录碎片时间失败')
    } finally {
      setFragLoading(false)
    }
  }

  return (
    <div className="punch-panel-content">
      {isFirstPunch && (
        <div className="first-punch-hint">记录一天的开始</div>
      )}

      {/* 已选标签提示 */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-hint">
          已选标签：{selectedTags.join(', ')}
        </div>
      )}

      {/* 描述输入区 */}
      <div className="desc-input-row">
        <input
          type="text"
          className="desc-input"
          placeholder="输入描述..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handlePunch() }}
        />
        <button
          className="save-tag-btn"
          onClick={handleSaveAsTag}
          disabled={!description.trim()}
          title="保存为标签"
        >
          + 标签
        </button>
      </div>

      {/* 打卡按钮 */}
      <button
        className="punch-btn"
        onClick={handlePunch}
        disabled={loading}
      >
        {loading ? '打卡中...' : '打卡'}
      </button>

      {/* 备注输入区 */}
      {lastPunch && (
        <div className="notes-area">
          <textarea
            className="notes-input"
            placeholder="记录当前工作备注..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            rows={3}
          />
        </div>
      )}

      {/* 碎片时间输入区 */}
      {!isFirstPunch && (
        <div className="fragment-area">
          <div className="fragment-title">碎片时间</div>
          <div className="fragment-inputs">
            <input
              type="number"
              className="fragment-duration-input"
              placeholder="分钟"
              min="1"
              value={fragDuration}
              onChange={e => setFragDuration(e.target.value)}
            />
            <input
              type="text"
              className="fragment-desc-input"
              placeholder="碎片描述（如休息、喝水）"
              value={fragDesc}
              onChange={e => setFragDesc(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleFragmentSubmit() }}
            />
          </div>
          <button
            className="fragment-submit-btn"
            onClick={handleFragmentSubmit}
            disabled={fragLoading || !fragDuration}
          >
            {fragLoading ? '记录中...' : '记录碎片'}
          </button>
        </div>
      )}
    </div>
  )
}

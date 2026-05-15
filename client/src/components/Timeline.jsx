import { useState } from 'react'
import { updatePunch, deletePunch, deleteFragment } from '../api'

function Timeline({ punches, fragments = [], date, onDataChange, onFragmentChange }) {
  const [editingId, setEditingId] = useState(null)
  const [editDesc, setEditDesc] = useState('')
  const [editTime, setEditTime] = useState('')
  const [expandedNotes, setExpandedNotes] = useState({})

  // 将打卡列表转为时间段列表
  const timeEntries = []
  for (let i = 1; i < punches.length; i++) {
    timeEntries.push({
      id: punches[i].id,
      startTime: punches[i - 1].time,
      endTime: punches[i].time,
      description: punches[i].description,
      notes: punches[i - 1].notes,
      startPunchId: punches[i - 1].id,
      endPunchId: punches[i].id
    })
  }

  // 将碎片归属到对应时间段
  function getFragmentsForEntry(entry) {
    return fragments.filter(f => {
      const fEnd = new Date(f.endTime).getTime()
      const eStart = new Date(entry.startTime).getTime()
      const eEnd = new Date(entry.endTime).getTime()
      return fEnd > eStart && fEnd <= eEnd
    })
  }

  // 计算时长（分钟）
  function calcDuration(startTime, endTime) {
    const diffMs = new Date(endTime) - new Date(startTime)
    return Math.round(diffMs / 60000)
  }

  // 计算净时长
  function calcNetDuration(entry) {
    const total = calcDuration(entry.startTime, entry.endTime)
    const entryFragments = getFragmentsForEntry(entry)
    const fragTotal = entryFragments.reduce((sum, f) => sum + (f.duration || 0), 0)
    return total - fragTotal
  }

  // 格式化时间显示
  function formatTime(timeStr) {
    if (!timeStr) return ''
    const d = new Date(timeStr)
    if (isNaN(d.getTime())) return timeStr
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  // 倒序展示（最新的在上面）
  const sortedEntries = [...timeEntries].reverse()

  // 进入编辑模式
  function handleEdit(entry) {
    setEditingId(entry.id)
    setEditDesc(entry.description || '')
    setEditTime(entry.endTime)
  }

  // 取消编辑
  function handleCancel() {
    setEditingId(null)
    setEditDesc('')
    setEditTime('')
  }

  // 保存编辑
  async function handleSave(entry) {
    try {
      await updatePunch(entry.endPunchId, date, {
        description: editDesc,
        time: editTime
      })
      setEditingId(null)
      onDataChange()
    } catch (e) {
      alert('保存失败: ' + e.message)
    }
  }

  // 删除时间段
  async function handleDelete(entry) {
    if (!window.confirm('确定要删除这个时间段吗？删除后相邻时间段会重新配对。')) {
      return
    }
    try {
      await deletePunch(entry.endPunchId, date)
      onDataChange()
    } catch (e) {
      alert('删除失败: ' + e.message)
    }
  }

  // 删除碎片
  async function handleDeleteFragment(fragId) {
    if (!window.confirm('确定要删除这条碎片记录吗？')) return
    try {
      await deleteFragment(fragId, date)
      onFragmentChange?.()
    } catch (e) {
      alert('删除碎片失败: ' + e.message)
    }
  }

  // 切换备注展开
  function toggleNoteExpand(entryId) {
    setExpandedNotes(prev => ({ ...prev, [entryId]: !prev[entryId] }))
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="timeline-empty">
        <p>暂无时间段记录</p>
        <p className="timeline-empty-hint">打卡两次以上即可生成时间段</p>
      </div>
    )
  }

  return (
    <div className="timeline-list">
      {sortedEntries.map(entry => {
        const entryFragments = getFragmentsForEntry(entry)
        const hasFragments = entryFragments.length > 0
        const totalDuration = calcDuration(entry.startTime, entry.endTime)
        const netDuration = calcNetDuration(entry)

        return (
          <div key={entry.id} className="timeline-entry-group">
            <div
              className={`timeline-item ${editingId === entry.id ? 'timeline-item--editing' : ''}`}
            >
              {editingId === entry.id ? (
                // 编辑模式
                <div className="timeline-item-edit">
                  <div className="timeline-item-times">
                    <span className="time-display">{entry.startTime}</span>
                    <span className="time-separator">→</span>
                    <input
                      type="time"
                      className="time-input"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                    />
                  </div>
                  <input
                    type="text"
                    className="desc-input"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="描述这段时间做了什么..."
                  />
                  <div className="timeline-item-actions">
                    <button className="btn-save" onClick={() => handleSave(entry)}>保存</button>
                    <button className="btn-cancel" onClick={handleCancel}>取消</button>
                  </div>
                </div>
              ) : (
                // 展示模式
                <div className="timeline-item-display">
                  <div className="timeline-item-times">
                    <span className="time-display">{entry.startTime}</span>
                    <span className="time-separator">→</span>
                    <span className="time-display">{entry.endTime}</span>
                    <span className="time-duration">
                      {hasFragments ? (
                        <>{netDuration} 分钟 <span className="duration-detail">（总 {totalDuration}）</span></>
                      ) : (
                        <>{totalDuration} 分钟</>
                      )}
                    </span>
                  </div>
                  <div className="timeline-item-desc">
                    {entry.description || <span className="desc-empty">无描述</span>}
                  </div>
                  {/* 备注显示 */}
                  {entry.notes && (
                    <div className={`timeline-item-notes ${expandedNotes[entry.id] ? 'expanded' : ''}`}>
                      <div className="notes-content">{entry.notes}</div>
                      {entry.notes.split('\n').length > 3 && (
                        <button className="notes-toggle" onClick={() => toggleNoteExpand(entry.id)}>
                          {expandedNotes[entry.id] ? '收起' : '展开'}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="timeline-item-actions">
                    <button className="btn-edit" onClick={() => handleEdit(entry)}>编辑</button>
                    <button className="btn-delete" onClick={() => handleDelete(entry)}>删除</button>
                  </div>
                </div>
              )}
            </div>

            {/* 碎片条目 */}
            {entryFragments.length > 0 && editingId !== entry.id && (
              <div className="fragment-list">
                {entryFragments.map(frag => (
                  <div key={frag.id} className="fragment-item">
                    <span className="fragment-marker">◦</span>
                    <div className="fragment-info">
                      <span className="fragment-time">
                        {formatTime(frag.startTime)} ~ {formatTime(frag.endTime)}
                      </span>
                      <span className="fragment-dur">{frag.duration} 分钟</span>
                      {frag.description && (
                        <span className="fragment-desc-text">{frag.description}</span>
                      )}
                    </div>
                    <button
                      className="fragment-delete-btn"
                      onClick={() => handleDeleteFragment(frag.id)}
                      title="删除碎片"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default Timeline

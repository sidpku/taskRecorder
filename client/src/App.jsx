import { useState, useEffect, useCallback } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import PunchPanel from './components/PunchPanel'
import TagManager from './components/TagManager'
import ExportDialog from './components/ExportDialog'
import Timeline from './components/Timeline'
import { getPunches, getTags, getFragments, createPunch } from './api'

function App() {
  const [punches, setPunches] = useState([])
  const [tags, setTags] = useState([])
  const [fragments, setFragments] = useState([])
  const [date] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedTags, setSelectedTags] = useState([])

  const fetchFragments = useCallback(async () => {
    try {
      const data = await getFragments(date)
      setFragments(data)
    } catch (e) {
      console.error('获取碎片时间失败:', e)
    }
  }, [date])

  const fetchTags = useCallback(async () => {
    try {
      const data = await getTags()
      setTags(data)
    } catch (e) {
      console.error('获取标签失败:', e)
    }
  }, [])

  const fetchPunches = useCallback(async () => {
    try {
      const data = await getPunches(date)
      setPunches(data)
    } catch (e) {
      console.error('获取打卡数据失败:', e)
    }
  }, [date])

  useEffect(() => {
    fetchPunches()
    fetchTags()
    fetchFragments()
  }, [fetchPunches, fetchTags, fetchFragments])

  const isFirstPunch = punches.length === 0
  const lastPunch = punches.length > 0 ? punches[punches.length - 1] : null
  const lastPunchTime = lastPunch ? lastPunch.time : null

  function toggleTag(tagName) {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(n => n !== tagName)
        : [...prev, tagName]
    )
  }

  // 标签直接打卡（点击标签即打卡）
  async function handleTagPunch(tagName) {
    try {
      await createPunch({
        time: new Date().toISOString(),
        description: tagName
      })
      setSelectedTags([])
      fetchPunches()
      fetchFragments()
    } catch (e) {
      console.error(e)
      alert('打卡失败，请重试')
    }
  }

  return (
    <div className="app-layout">
      <main className="main-panel">
        {/* 顶部状态栏 */}
        <section className="app-section status-bar">
          <StatusBar lastPunchTime={lastPunchTime} />
        </section>

        {/* 打卡操作区 */}
        <section className="app-section punch-panel">
          <PunchPanel
            selectedTags={selectedTags}
            onClearTags={() => setSelectedTags([])}
            isFirstPunch={isFirstPunch}
            onPunch={() => { fetchPunches(); fetchFragments() }}
            onTagsChange={fetchTags}
            lastPunch={lastPunch}
            date={date}
            onFragmentCreated={() => { fetchFragments(); fetchPunches() }}
          />
        </section>

        {/* 时间线列表 */}
        <section className="app-section timeline">
          <Timeline
            punches={punches}
            fragments={fragments}
            date={date}
            onDataChange={() => { fetchPunches(); fetchFragments() }}
            onFragmentChange={fetchFragments}
          />
        </section>
      </main>

      <aside className="side-panel">
        {/* 标签按钮区 */}
        <section className="side-section side-tags">
          <h3 className="side-section-title">标签</h3>
          {tags.length > 0 ? (
            <div className="tag-buttons">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-btn ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
                  style={{
                    '--tag-color': tag.color || '#4f46e5',
                    borderColor: selectedTags.includes(tag.name) ? (tag.color || '#4f46e5') : undefined,
                    backgroundColor: selectedTags.includes(tag.name) ? (tag.color || '#4f46e5') : undefined,
                    color: selectedTags.includes(tag.name) ? '#fff' : undefined
                  }}
                  onClick={() => toggleTag(tag.name)}
                  onDoubleClick={() => handleTagPunch(tag.name)}
                  title="单击选中，双击直接打卡"
                >
                  <span className="tag-btn-dot" style={{ background: tag.color || '#4f46e5' }}></span>
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="side-empty-hint">暂无标签，请在下方添加</div>
          )}
        </section>

        {/* 标签管理 */}
        <section className="side-section side-tag-manager">
          <h3 className="side-section-title">标签管理</h3>
          <TagManager onTagsChange={fetchTags} />
        </section>

        {/* CSV 导出 */}
        <section className="side-section side-export">
          <h3 className="side-section-title">CSV 导出</h3>
          <ExportDialog />
        </section>
      </aside>
    </div>
  )
}

export default App

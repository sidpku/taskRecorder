import { useState, useEffect, useCallback } from 'react'
import './App.css'
import StatusBar from './components/StatusBar'
import PunchPanel from './components/PunchPanel'
import TagManager from './components/TagManager'
import ExportDialog from './components/ExportDialog'
import Timeline from './components/Timeline'
import { getPunches, getTags, getFragments } from './api'

function App() {
  const [showTagManager, setShowTagManager] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [punches, setPunches] = useState([])
  const [tags, setTags] = useState([])
  const [fragments, setFragments] = useState([])
  const [date] = useState(() => new Date().toISOString().slice(0, 10))

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

  return (
    <div className="app">
      {/* 顶部状态栏 */}
      <header className="app-section status-bar">
        <StatusBar lastPunchTime={lastPunchTime} />
      </header>

      {/* 打卡操作区 */}
      <section className="app-section punch-panel">
        <PunchPanel
          tags={tags}
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

      {/* 操作按钮区 */}
      <footer className="app-section actions-bar">
        <button className="action-btn" onClick={() => setShowTagManager(true)}>标签管理</button>
        <button className="action-btn" onClick={() => setShowExportDialog(true)}>CSV 导出</button>
      </footer>

      {/* 弹窗 */}
      <TagManager
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
        onTagsChange={fetchTags}
      />
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </div>
  )
}

export default App

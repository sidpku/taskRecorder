import { useState, useEffect } from 'react'
import { getTags, createTag, updateTag, deleteTag } from '../api'
import './TagManager.css'

export default function TagManager({ onTagsChange }) {
  const [tags, setTags] = useState([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('#000000')

  useEffect(() => {
    loadTags()
  }, [])

  async function loadTags() {
    try {
      const data = await getTags()
      setTags(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    try {
      await createTag({ name })
      setNewName('')
      await loadTags()
      onTagsChange?.()
    } catch (e) {
      console.error(e)
    }
  }

  function startEdit(tag) {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return
    try {
      await updateTag(editingId, { name: editName.trim(), color: editColor })
      setEditingId(null)
      await loadTags()
      onTagsChange?.()
    } catch (e) {
      console.error(e)
    }
  }

  function cancelEdit() {
    setEditingId(null)
  }

  async function handleDelete(id) {
    if (!confirm('确定删除该标签吗？')) return
    try {
      await deleteTag(id)
      await loadTags()
      onTagsChange?.()
    } catch (e) {
      console.error(e)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div className="tag-manager-inline">
      {/* 添加标签 */}
      <div className="tag-add-row">
        <input
          type="text"
          className="tag-input"
          placeholder="输入标签名称"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="tag-add-btn" onClick={handleAdd}>添加</button>
      </div>

      {/* 标签列表 */}
      <ul className="tag-list">
        {tags.map(tag => (
          <li key={tag.id} className="tag-item">
            {editingId === tag.id ? (
              <div className="tag-edit-row">
                <input
                  type="color"
                  className="tag-color-picker"
                  value={editColor}
                  onChange={e => setEditColor(e.target.value)}
                />
                <input
                  type="text"
                  className="tag-input tag-edit-input"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <button className="tag-action-btn save" onClick={handleSaveEdit}>保存</button>
                <button className="tag-action-btn cancel" onClick={cancelEdit}>取消</button>
              </div>
            ) : (
              <div className="tag-display-row">
                <span className="tag-color-dot" style={{ background: tag.color }}></span>
                <span className="tag-name">{tag.name}</span>
                <button className="tag-action-btn edit" onClick={() => startEdit(tag)}>编辑</button>
                <button className="tag-action-btn delete" onClick={() => handleDelete(tag.id)}>删除</button>
              </div>
            )}
          </li>
        ))}
        {tags.length === 0 && (
          <li className="tag-empty">暂无标签，请添加</li>
        )}
      </ul>
    </div>
  )
}

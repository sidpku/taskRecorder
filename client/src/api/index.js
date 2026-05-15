const BASE = '/api'

export async function getPunches(date) {
  const res = await fetch(`${BASE}/punches?date=${date}`)
  if (!res.ok) throw new Error('获取打卡记录失败')
  return res.json()
}

export async function createPunch(data) {
  const res = await fetch(`${BASE}/punches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('创建打卡失败')
  return res.json()
}

export async function updatePunch(id, date, data) {
  const res = await fetch(`${BASE}/punches/${id}?date=${date}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('更新打卡失败')
  return res.json()
}

export async function deletePunch(id, date) {
  const res = await fetch(`${BASE}/punches/${id}?date=${date}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('删除打卡失败')
}

export async function getTags() {
  const res = await fetch(`${BASE}/tags`)
  if (!res.ok) throw new Error('获取标签失败')
  return res.json()
}

export async function createTag(data) {
  const res = await fetch(`${BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('创建标签失败')
  return res.json()
}

export async function updateTag(id, data) {
  const res = await fetch(`${BASE}/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('更新标签失败')
  return res.json()
}

export async function deleteTag(id) {
  const res = await fetch(`${BASE}/tags/${id}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('删除标签失败')
  return res.json()
}

export async function exportCSV(start, end) {
  const res = await fetch(`${BASE}/export?start=${start}&end=${end}`)
  if (!res.ok) throw new Error('导出CSV失败')
  return res.blob()
}

export async function getFragments(date) {
  const res = await fetch(`${BASE}/fragments?date=${date}`)
  if (!res.ok) throw new Error('获取碎片时间失败')
  return res.json()
}

export async function createFragment(data) {
  const res = await fetch(`${BASE}/fragments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error('创建碎片时间失败')
  return res.json()
}

export async function deleteFragment(id, date) {
  const res = await fetch(`${BASE}/fragments/${id}?date=${date}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('删除碎片时间失败')
}

import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, BarChart3, Bell, BookOpen, Camera, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleDot, Clock3, Coffee, Droplets, Dumbbell, Edit3, FileText, Flame, Footprints,
  HeartPulse, HelpCircle, Info, Keyboard, Leaf, Menu, Mic, Minus, Moon, MoreHorizontal, Package,
  Plus, PhoneCall, Receipt, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Trash2, Undo2, Utensils, Volume2, X, Zap,
} from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { demoEntries, foodLibrary, initialEntries, initialSettings, TODAY } from './data'
import { summarizeEntries } from './analytics'
import { i18n, languageOptions, tx } from './i18n'
import type { Entry, EntryKind, Language, Settings, SymptomRecord } from './types'
import { useTranslation } from 'react-i18next'

type Icon = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

const kindMeta: Record<EntryKind, { label: string; icon: Icon; color: string; path: string }> = {
  meal: { label: '饮食', icon: Utensils, color: 'sage', path: '/log/food' },
  bowel: { label: '排便', icon: CircleDot, color: 'clay', path: '/log/bowel' },
  symptom: { label: '身体感觉', icon: Activity, color: 'rose', path: '/log/symptom' },
  water: { label: '饮水', icon: Droplets, color: 'sky', path: '/log/water' },
  exercise: { label: '运动', icon: Dumbbell, color: 'amber', path: '/log/exercise' },
  sleep: { label: '睡眠', icon: Moon, color: 'indigo', path: '/log/sleep' },
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const localeForLanguage: Record<Language, string> = { zh: 'zh-CN', en: 'en-GB', fi: 'fi-FI' }
const currentLanguage = (): Language => i18n.language === 'en' || i18n.language === 'fi' ? i18n.language : 'zh'
const appLocale = () => localeForLanguage[currentLanguage()]
const prettyDate = (date: string) => new Intl.DateTimeFormat(appLocale(), { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${date}T12:00:00`))
const localize = (value: unknown) => tx(String(value))
const foodInitial = (value: string) => tx(value).trim().slice(0, 1).toUpperCase() || '?'
const localizedDuration = (hours: number, minutes: number) => minutes ? `${hours}${tx('小时')} ${minutes}${tx('分钟')}` : `${hours}${tx('小时')}`
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const formatTime = (date: string, time: string) => `${date.slice(5).replace('-', '/')} ${time}`
const recordStreak = (entries: Entry[]) => {
  const dates = new Set(entries.map((entry) => entry.date))
  let streak = 0
  const cursor = new Date(`${TODAY}T12:00:00`)
  while (dates.has(dateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1) }
  return streak
}

const parseEntries = (): Entry[] => {
  try {
    const stored = JSON.parse(localStorage.getItem('gutlog-entries') || 'null')
    return Array.isArray(stored)
      ? stored.filter((entry): entry is Entry => Boolean(entry && typeof entry === 'object' && entry.id && entry.kind && entry.date && entry.time)).map((entry) => ({ ...entry, details: entry.details && typeof entry.details === 'object' ? entry.details : {} }))
      : initialEntries
  } catch {
    return initialEntries
  }
}

const parseSettings = (): Settings => {
  try {
    const stored = JSON.parse(localStorage.getItem('gutlog-settings') || 'null')
    if (!stored || typeof stored !== 'object') return initialSettings
    return {
      ...initialSettings,
      ...stored,
      name: typeof stored.name === 'string' ? stored.name : initialSettings.name,
      email: typeof stored.email === 'string' ? stored.email : initialSettings.email,
      language: stored.language === 'en' || stored.language === 'fi' ? stored.language : initialSettings.language,
      aiInsights: typeof stored.aiInsights === 'boolean' ? stored.aiInsights : initialSettings.aiInsights,
      dailyReminder: typeof stored.dailyReminder === 'boolean' ? stored.dailyReminder : initialSettings.dailyReminder,
      weeklyReport: typeof stored.weeklyReport === 'boolean' ? stored.weeklyReport : initialSettings.weeklyReport,
      tracking: { ...initialSettings.tracking, ...(stored.tracking && typeof stored.tracking === 'object' ? stored.tracking : {}) },
      appearance: stored.appearance === 'dark' || stored.appearance === 'system' ? stored.appearance : 'light',
    }
  } catch {
    return initialSettings
  }
}

const derivedEntryFields = (entry: Entry): Pick<Entry, 'title' | 'summary'> => {
  const details = entry.details || {}
  if (entry.kind === 'meal') {
    const foods = Array.isArray(details.foods) ? details.foods.map(String).map((food) => food.replace(/\s+\d+(?:\.\d+)?\s*(?:碗|根|杯|份|个|g)$/i, '')) : []
    return { title: String(details.meal || entry.title || '饮食'), summary: foods.length ? foods.join(' + ') : entry.summary }
  }
  if (entry.kind === 'bowel') {
    const sensations = Array.isArray(details.sensations) ? details.sensations.filter((value) => value !== '没有').map(String) : []
    const warningSigns = Array.isArray(details.warningSigns) ? details.warningSigns.map(String) : []
    return { title: `排便 · Type ${String(details.type || '不确定')}`, summary: `${String(details.feeling || '未记录')}${sensations.length ? ` · ${sensations.join('、')}` : ''}${warningSigns.length ? ' · 已记录异常信号' : ''}` }
  }
  if (entry.kind === 'water') return { title: '饮水', summary: `${Number(details.amount || 0)} ml · ${String(details.beverage || '水')}` }
  if (entry.kind === 'symptom') {
    const symptom = String(details.symptom || entry.title || '身体感觉')
    const rawSeverity = details.severity
    const severity = typeof rawSeverity === 'number' ? ['', '轻微', '中等', '严重'][rawSeverity] || '未记录' : String(rawSeverity || '未记录')
    const summary = symptom.includes('腹痛') ? `${String(details.painLevel || 0)}/10 · ${String(details.location || '未记录')} · ${String(details.duration || '未记录')}` : `${severity} · ${String(details.onset || '未记录')} · ${String(details.duration || '未记录')}`
    const warningSummary = Array.isArray(details.warningSigns) && details.warningSigns.length ? ' · 已记录异常信号' : ''
    return { title: symptom, summary: `${summary}${warningSummary}` }
  }
  if (entry.kind === 'sleep') {
    const hours = Number(details.hours || 0)
    const minutes = Number(details.minutes || 0)
    const duration = minutes ? `${hours}小时${minutes}分钟` : `${hours}小时`
    return { title: '睡眠', summary: details.quality && details.quality !== '未记录' ? `${duration} · ${String(details.quality)}` : duration }
  }
  if (entry.kind === 'exercise') {
    const minutes = String(details.minutes || 0)
    const intensity = String(details.intensity || '未记录')
    const title = String(details.exercise || entry.title || '运动')
    return { title, summary: title === '跑步' ? `${minutes} 分钟 · ${String(details.distance || 0)} km · ${intensity}` : title === '步行' ? `${minutes} 分钟 · ${String(details.steps || 0)} 步 · ${String(details.distance || 0)} km` : `${minutes} 分钟 · ${intensity}` }
  }
  return { title: entry.title, summary: entry.summary }
}

const localizedEntryFields = (entry: Entry): Pick<Entry, 'title' | 'summary'> => {
  const details = entry.details || {}
  if (entry.kind === 'meal') {
    const foods = Array.isArray(details.foods) ? details.foods.map(String).map((food) => food.replace(/\s+\d+(?:\.\d+)?\s*(?:碗|根|杯|份|个|g|kg|ml)$/i, '')) : []
    return { title: localize(details.meal || entry.title || '饮食'), summary: foods.length ? foods.map(localize).join(' + ') : localize(entry.summary) }
  }
  if (entry.kind === 'bowel') {
    const sensations = Array.isArray(details.sensations) ? details.sensations.filter((value) => value !== '没有').map(localize) : []
    const warningSigns = Array.isArray(details.warningSigns) ? details.warningSigns.map(localize) : []
    return { title: `${tx('排便')} · Type ${String(details.type || '不确定')}`, summary: `${localize(details.feeling || '未记录')}${sensations.length ? ` · ${sensations.join('、')}` : ''}${warningSigns.length ? ` · ${tx('已记录异常信号')}` : ''}` }
  }
  if (entry.kind === 'water') return { title: tx('饮水'), summary: `${Number(details.amount || 0)} ml · ${localize(details.beverage || '水')}` }
  if (entry.kind === 'symptom') {
    const symptomValue = String(details.symptom || entry.title || '身体感觉')
    const symptom = symptomValue.split('、').map(localize).join('、')
    const rawSeverity = details.severity
    const severity = typeof rawSeverity === 'number' ? ['', '轻微', '中等', '严重'][rawSeverity] || '未记录' : String(rawSeverity || '未记录')
    const summary = symptomValue.includes('腹痛') ? `${String(details.painLevel || 0)}/10 · ${localize(details.location || '未记录')} · ${localize(details.duration || '未记录')}` : `${localize(severity)} · ${localize(details.onset || '未记录')} · ${localize(details.duration || '未记录')}`
    const warningSummary = Array.isArray(details.warningSigns) && details.warningSigns.length ? ` · ${tx('已记录异常信号')}` : ''
    return { title: symptom, summary: `${summary}${warningSummary}` }
  }
  if (entry.kind === 'sleep') {
    const hours = Number(details.hours || 0)
    const minutes = Number(details.minutes || 0)
    const duration = localizedDuration(hours, minutes)
    return { title: tx('睡眠'), summary: details.quality && details.quality !== '未记录' ? `${duration} · ${localize(details.quality)}` : duration }
  }
  if (entry.kind === 'exercise') {
    const minutes = String(details.minutes || 0)
    const intensity = localize(details.intensity || '未记录')
    const title = localize(details.exercise || entry.title || '运动')
    const rawTitle = String(details.exercise || entry.title || '运动')
    return { title, summary: rawTitle === '跑步' ? `${minutes} ${tx('分钟')} · ${String(details.distance || 0)} km · ${intensity}` : rawTitle === '步行' ? `${minutes} ${tx('分钟')} · ${String(details.steps || 0)} ${tx('步')} · ${String(details.distance || 0)} km` : `${minutes} ${tx('分钟')} · ${intensity}` }
  }
  return { title: localize(entry.title), summary: localize(entry.summary) }
}

const currentTime = () => new Date().toTimeString().slice(0, 5)
const mealForCurrentTime = () => {
  const hour = new Date().getHours()
  return hour < 10 ? '早餐' : hour < 14 ? '午餐' : hour < 18 ? '下午茶' : '晚餐'
}
const greetingForCurrentTime = () => {
  const hour = new Date().getHours()
  return hour < 5 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好'
}
const initialsForName = (name: string) => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'PD'

function App() {
  useTranslation()
  const [entries, setEntries] = useState<Entry[]>(parseEntries)
  const [undoEntry, setUndoEntry] = useState<Entry | null>(null)
  const [saveNotice, setSaveNotice] = useState('')
  const saveNoticeTimer = useRef<number | null>(null)
  const [settings, setSettings] = useState<Settings>(parseSettings)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false)

  useEffect(() => { localStorage.setItem('gutlog-entries', JSON.stringify(entries)) }, [entries])
  useEffect(() => { localStorage.setItem('gutlog-settings', JSON.stringify(settings)) }, [settings])
  useEffect(() => {
    if (i18n.language !== settings.language) void i18n.changeLanguage(settings.language)
  }, [settings.language])
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!media) return
    const update = () => setSystemDark(media.matches)
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])
  useEffect(() => () => { if (saveNoticeTimer.current) window.clearTimeout(saveNoticeTimer.current) }, [])

  const announce = (message: string) => {
    setSaveNotice(message)
    if (saveNoticeTimer.current) window.clearTimeout(saveNoticeTimer.current)
    saveNoticeTimer.current = window.setTimeout(() => setSaveNotice(''), 2200)
  }

  const addEntry = (entry: Omit<Entry, 'id' | 'date'> & Partial<Pick<Entry, 'date'>>) => {
    setEntries((current) => [...current, { ...entry, id: uid(), date: entry.date || TODAY }])
    announce(`${tx(kindMeta[entry.kind].label)} · ${tx('已添加')}`)
  }
  const updateEntry = (id: string, patch: Partial<Entry>) => {
    setEntries((current) => current.map((item) => {
      if (item.id !== id) return item
      const details = patch.details
        ? Object.entries({ ...item.details, ...patch.details }).reduce<Entry['details']>((next, [key, value]) => {
            if (value !== undefined) next[key] = value
            return next
          }, {})
        : item.details
      const merged = { ...item, ...patch, details }
      const derived = derivedEntryFields(merged)
      return { ...merged, title: patch.title && patch.title !== item.title ? patch.title : derived.title, summary: patch.summary && patch.summary !== item.summary ? patch.summary : derived.summary }
    }))
    announce(tx('修改已保存'))
  }
  const deleteEntry = (id: string) => {
    const removed = entries.find((item) => item.id === id)
    if (!removed) return
    setUndoEntry(removed)
    window.setTimeout(() => setUndoEntry((pending) => pending?.id === removed.id ? null : pending), 5000)
    setEntries((current) => current.filter((item) => item.id !== id))
  }
  const undoDelete = () => { if (undoEntry) { setEntries((current) => [...current, undoEntry]); setUndoEntry(null) } }
  const resetData = () => setEntries(initialEntries)
  const loadDemo = () => setEntries(demoEntries())
  const deleteAllData = () => { setEntries([]); localStorage.removeItem('gutlog-water-last-amount'); localStorage.removeItem('gutlog-water-drinks'); announce(tx('所有记录已删除')) }
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ entries, settings }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `poop-diary-${TODAY}.json`; anchor.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className={settings.appearance === 'dark' || (settings.appearance === 'system' && systemDark) ? 'app dark' : 'app'}>
      <AppShell settings={settings} tracking={settings.tracking} saveNotice={saveNotice} toast={undoEntry} onUndo={undoDelete} onToastClose={() => setUndoEntry(null)}>
        <Routes>
          <Route path="/" element={<Home entries={entries} name={settings.name} tracking={settings.tracking} />} />
          <Route path="/diary" element={<Diary entries={entries} onDelete={deleteEntry} />} />
          <Route path="/insights" element={<Insights entries={entries} aiInsights={settings.aiInsights} />} />
          <Route path="/report" element={<Report entries={entries} aiInsights={settings.aiInsights} />} />
          <Route path="/profile" element={<Profile settings={settings} setSettings={setSettings} onReset={resetData} onLoadDemo={loadDemo} onDeleteData={deleteAllData} onExport={exportData} />} />
          <Route path="/log/:type" element={<LogPage onAdd={addEntry} onUpdate={updateEntry} entries={entries} />} />
          <Route path="*" element={<Home entries={entries} name={settings.name} tracking={settings.tracking} />} />
        </Routes>
      </AppShell>
    </div>
  )
}

export default App

function AppShell({ children, settings, tracking, saveNotice, toast, onUndo, onToastClose }: { children: ReactNode; settings: Settings; tracking: Settings['tracking']; saveNotice: string; toast: Entry | null; onUndo: () => void; onToastClose: () => void }) {
  const location = useLocation()
  const [notice, setNotice] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const isFlow = location.pathname.startsWith('/log/')
  const isProfile = location.pathname === '/profile'
  useEffect(() => { const open = () => setLogOpen(true); window.addEventListener('gutlog-open-sheet', open); return () => window.removeEventListener('gutlog-open-sheet', open) }, [])
  return (
    <div className={isProfile ? 'app-frame profile-frame' : 'app-frame'}>
      {!isFlow && <header className="topbar">
        <Link to="/" className="brand"><span className="brand-mark"><Leaf size={16} /></span><span>Poop Diary</span></Link>
        <div className="topbar-right"><span className="status-chip"><span className="status-dot" /> {settings.aiInsights ? tx('AI insights on') : tx('Private mode')}</span><button className="icon-button" aria-label={tx("通知")} onClick={() => setNotice(!notice)}><Bell size={18} /></button><div className="avatar">{initialsForName(settings.name)}</div>{notice && <div className="notice-popover"><strong>{tx("今日提醒")}</strong><span>{tx("今日记录已更新。")}</span></div>}</div>
      </header>}
      <main className={isFlow ? 'main flow-main' : 'main'}>{children}</main>
      {!isFlow && <BottomNavigation onAdd={() => setLogOpen(true)} />}
      {!isFlow && <LogSheet open={logOpen} onClose={() => setLogOpen(false)} tracking={tracking} />}
      {saveNotice && <div className={`save-toast ${toast ? 'with-undo' : ''}`} role="status" aria-live="polite"><Check size={15} /> {saveNotice}</div>}
      {toast && <div className="undo-toast"><span><Trash2 size={15} /> {tx("已删除这条记录")}</span><button onClick={onUndo}><Undo2 size={14} /> {tx("撤销")}</button><button className="toast-close" onClick={onToastClose} aria-label={tx("关闭")}><X size={14} /></button></div>}
    </div>
  )
}

function BottomNavigation({ onAdd }: { onAdd: () => void }) {
  const items = [
    { to: '/', label: '今天', icon: HeartPulse }, { to: '/diary', label: '日记', icon: BookOpen }, { to: '/insights', label: '洞察', icon: BarChart3 }, { to: '/profile', label: '我的', icon: Settings2 },
  ]
  return <nav className="bottom-nav"><NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><HeartPulse size={18} /><span>{tx("今天")}</span></NavLink><NavLink to="/diary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><BookOpen size={18} /><span>{tx("日记")}</span></NavLink><button className="nav-add" onClick={onAdd} aria-label={tx("添加记录")}><Plus size={24} /><span>{tx("记录")}</span></button><NavLink to="/insights" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><BarChart3 size={18} /><span>{tx("洞察")}</span></NavLink><NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><Settings2 size={18} /><span>{tx("我的")}</span></NavLink></nav>
}
const isActiveNav = (to: string) => window.location.pathname === to

function LogSheet({ open, onClose, tracking }: { open: boolean; onClose: () => void; tracking: Settings['tracking'] }) {
  const navigate = useNavigate()
  if (!open) return null
  const go = (path: string) => { onClose(); navigate(path) }
  const items: { kind: EntryKind; label: string; icon: Icon; color: string; path: string }[] = [{ kind: 'bowel', label: '排便', icon: CircleDot, color: 'clay', path: '/log/bowel?quick=1' }, { kind: 'meal', label: '饮食', icon: Utensils, color: 'sage', path: '/log/food?quick=1' }, { kind: 'symptom', label: '身体感觉', icon: Activity, color: 'rose', path: '/log/symptom?quick=1' }, { kind: 'water', label: '饮水', icon: Droplets, color: 'sky', path: '/log/water?quick=1' }, { kind: 'exercise', label: '运动', icon: Dumbbell, color: 'amber', path: '/log/exercise' }, { kind: 'sleep', label: '睡眠', icon: Moon, color: 'indigo', path: '/log/sleep' }]
  const visibleItems = items.filter((item) => tracking[item.kind])
  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="log-sheet" aria-label={tx("选择记录类型")}><div className="sheet-handle" /><div className="sheet-heading"><div><h2>{tx("记录")}</h2></div><button className="icon-button subtle" onClick={onClose} aria-label={tx("关闭")}><X size={17} /></button></div>{visibleItems.length ? <div className="sheet-grid">{visibleItems.map(({ label, icon: SheetIcon, color, path }) => <button className="sheet-item" key={label} onClick={() => go(path)}><span className={`choice-icon ${color}`}><SheetIcon size={21} /></span><span><strong>{tx(label)}</strong></span><ChevronRight size={15} /></button>)}</div> : <div className="sheet-empty"><Info size={18} /><span>{tx("请先在“我的”里打开至少一个记录项目。")}</span></div>}</section></div>
}

function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{tx(eyebrow)}</div>}<h1>{tx(title)}</h1>{subtitle && <p>{tx(subtitle)}</p>}</div>{action}</div>
}

function Home({ entries, name, tracking }: { entries: Entry[]; name: string; tracking: Settings['tracking'] }) {
  const navigate = useNavigate()
  const todayEntries = entries.filter((entry) => entry.date === TODAY).sort((a, b) => a.time.localeCompare(b.time))
  const metrics = {
    meal: todayEntries.filter((e) => e.kind === 'meal').length,
    bowel: todayEntries.filter((e) => e.kind === 'bowel').length,
    symptom: todayEntries.filter((e) => e.kind === 'symptom').length,
    exercise: todayEntries.filter((e) => e.kind === 'exercise').length,
    water: todayEntries.filter((e) => e.kind === 'water').reduce((sum, e) => sum + Number(e.details.amount || 0), 0),
    sleep: todayEntries.find((e) => e.kind === 'sleep')?.details,
  }
  const streak = recordStreak(entries)
  const totalLogged = todayEntries.length
  const firstName = name.trim().split(/\s+/)[0] || '你'
  const greeting = greetingForCurrentTime()
  const waterGoal = 2000
  const waterPercent = Math.min(100, Math.round((metrics.water / waterGoal) * 100))
  const quickItems = ([
    { kind: 'meal', label: '饮食', path: '/log/food?quick=1' },
    { kind: 'bowel', label: '排便', path: '/log/bowel?quick=1' },
    { kind: 'symptom', label: '身体感觉', path: '/log/symptom?quick=1' },
    { kind: 'water', label: '饮水', path: '/log/water?quick=1' },
    { kind: 'exercise', label: '运动', path: '/log/exercise' },
    { kind: 'sleep', label: '睡眠', path: '/log/sleep' },
  ] as { kind: EntryKind; label: string; path: string }[]).filter((item) => tracking[item.kind])
  return <div className="page home-page">
    <section className="today-header"><div><span className="eyebrow">{prettyDate(TODAY)}</span><h1>{tx(greeting)}，{firstName}</h1><p>{totalLogged ? `${tx('今天')} ${totalLogged} ${tx('条记录')}` : tx("今天还没有记录")}</p></div><div className="streak-badge"><span>{tx("连续记录")}</span><strong>{streak} <small>{tx("天")}</small></strong></div></section>
    <section className="home-quick-section" aria-labelledby="home-quick-title"><div className="section-heading home-quick-heading"><div><h2 id="home-quick-title">{tx("快速记录")}</h2></div></div><div className="home-quick-row">{quickItems.map(({ kind, label, path }) => { const QuickIcon = kindMeta[kind].icon; return <Link to={path} className={`home-quick-item ${kindMeta[kind].color}`} key={kind}><span className="home-quick-icon"><QuickIcon size={17} /></span><span className="home-quick-copy"><strong>{tx(label)}</strong></span><ChevronRight size={14} className="home-quick-arrow" /></Link> })}</div></section>
    <section className="section-block home-stats"><div className="section-heading"><div><h2>{tx("今日概览")}</h2></div></div><div className="metric-grid compact-metrics"><MetricCard kind="meal" value={`${metrics.meal}`} label={tx("餐次")} suffix={tx("次")} /><MetricCard kind="bowel" value={`${metrics.bowel}`} label={tx("排便")} suffix={tx("次")} /><MetricCard kind="symptom" value={`${metrics.symptom}`} label={tx("身体感觉")} suffix={tx("条")} /><MetricCard kind="exercise" value={`${metrics.exercise}`} label={tx("运动")} suffix={tx("次")} /><MetricCard kind="sleep" value={metrics.sleep ? `${metrics.sleep.hours}h ${metrics.sleep.minutes}m` : '—'} label={tx("睡眠")} suffix={tx("昨晚")} /></div><Link to="/log/water?quick=1" className="water-inline"><span className="water-inline-icon"><Droplets size={17} /></span><span className="water-inline-copy"><strong>{tx("饮水")}</strong><small>{metrics.water} / {waterGoal} ml</small></span><span className="water-inline-track"><i style={{ width: `${waterPercent}%` }} /></span><ChevronRight size={16} /></Link></section>
    <section className="section-block diary-preview"><div className="section-heading"><div><span className="eyebrow">{tx("记录 ·")} {totalLogged} {tx("条")}</span><h2>{tx("今天的记录")}</h2></div><Link to="/diary" className="text-link">{tx("查看全部")} <ArrowRight size={15} /></Link></div>{todayEntries.length === 0 ? <EmptyState /> : <div className="timeline">{todayEntries.slice(0, 6).map((entry) => <TimelineEntry entry={entry} key={entry.id} onClick={() => navigate(`/diary?entry=${encodeURIComponent(entry.id)}`)} />)}</div>}{todayEntries.length > 6 && <Link to="/diary" className="timeline-more">{tx("查看全部")} {todayEntries.length} {tx("条记录")} <ArrowRight size={14} /></Link>}</section>
  </div>
}

function MetricCard({ kind, value, label, suffix }: { kind: EntryKind; value: string; label: string; suffix: string }) { const meta = kindMeta[kind]; const IconComp = meta.icon; return <Link to={meta.path} className={`metric-card metric-${meta.color}`} aria-label={`${tx('记录')}${label}`}><div className="metric-top"><IconComp size={17} /><span>{label}</span></div><div className="metric-value">{value}<small>{suffix}</small></div><div className="metric-rule" /><ChevronRight size={14} className="metric-arrow" /></Link> }

function TimelineEntry({ entry, compact = false, onClick }: { entry: Entry; compact?: boolean; onClick?: () => void }) { const meta = kindMeta[entry.kind]; const EntryIcon = meta.icon; const display = localizedEntryFields(entry); return <div className={`timeline-entry ${compact ? 'compact' : ''} ${onClick ? 'is-clickable' : ''}`} onClick={onClick} onKeyDown={(event) => { if (onClick && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onClick() } }} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}><span className="timeline-time">{entry.time}</span><span className={`timeline-dot ${meta.color}`}><EntryIcon size={14} /></span><div className="timeline-content"><strong>{display.title}</strong><span>{display.summary}</span></div>{onClick && <ChevronRight size={15} className="timeline-arrow" />}</div> }

function EmptyState() { return <div className="empty-state"><div className="empty-icon"><Leaf size={22} /></div><strong>{tx("今天还没有记录")}</strong><button className="primary-button small" onClick={() => window.dispatchEvent(new CustomEvent('gutlog-open-sheet'))}><Plus size={15} /> {tx("添加第一条")}</button></div> }

function Diary({ entries, onDelete }: { entries: Entry[]; onDelete: (id: string) => void }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(TODAY)
  const [selected, setSelected] = useState<Entry | null>(null)
  const dayEntries = entries.filter((entry) => entry.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
  useEffect(() => {
    const entryId = new URLSearchParams(location.search).get('entry')
    if (!entryId) return
    const entry = entries.find((item) => item.id === entryId)
    if (entry) { setSelectedDate(entry.date); setSelected(entry) }
  }, [entries, location.search])
  const shiftDate = (amount: number) => { const d = new Date(`${selectedDate}T12:00:00`); d.setDate(d.getDate() + amount); setSelectedDate(dateKey(d)) }
  const dateWindow = Array.from({ length: 5 }, (_, i) => { const d = new Date(`${selectedDate}T12:00:00`); d.setDate(d.getDate() + i - 2); return dateKey(d) })
  const closeDetail = () => { setSelected(null); if (location.search) navigate('/diary', { replace: true }) }
  return <div className="page diary-page"><PageHeader eyebrow="YOUR BODY, IN CONTEXT" title={tx("日记")} action={<button className="primary-button" onClick={() => window.dispatchEvent(new CustomEvent('gutlog-open-sheet'))}><Plus size={17} /> {tx("记录")}</button>} />
    <div className="date-navigator"><button className="icon-button subtle" onClick={() => shiftDate(-1)} aria-label={tx("前一天")}><ChevronLeft size={18} /></button><div className="date-window">{dateWindow.map((date) => <button key={date} className={`date-cell ${date === selectedDate ? 'selected' : ''}`} onClick={() => setSelectedDate(date)}><span>{new Date(`${date}T12:00:00`).getDate()}</span><small>{new Date(`${date}T12:00:00`).toLocaleDateString(appLocale(), { weekday: 'short' })}</small>{date === TODAY && <i />}</button>)}</div><button className="icon-button subtle" onClick={() => shiftDate(1)} aria-label={tx("后一天")}><ChevronRight size={18} /></button></div>
    <div className="diary-day-heading"><div><span className="eyebrow">{selectedDate === TODAY ? tx('TODAY') : tx('SELECTED DAY')}</span><h2>{prettyDate(selectedDate)}</h2></div><span className="entry-count">{dayEntries.length} {tx('entries')}</span></div>
    {dayEntries.length === 0 ? <div className="empty-day"><BookOpen size={24} /><strong>{tx("这天还没有记录")}</strong></div> : <div className="diary-list">{dayEntries.map((entry) => <DiaryCard key={entry.id} entry={entry} onClick={() => setSelected(entry)} />)}</div>}
    {selected && <DetailModal entry={selected} onClose={closeDetail} onDelete={() => { onDelete(selected.id); closeDetail() }} />}
  </div>
}

function DiaryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) { const meta = kindMeta[entry.kind]; const EntryIcon = meta.icon; const display = localizedEntryFields(entry); return <button className="diary-card" onClick={onClick}><div className={`diary-card-icon ${meta.color}`}><EntryIcon size={19} /></div><div className="diary-card-main"><div className="diary-card-title"><strong>{display.title}</strong><span>{entry.time}</span></div><p>{display.summary}</p><div className="diary-card-tag">{tx(meta.label)}</div></div><ChevronRight size={18} className="diary-chevron" /></button> }

function DetailModal({ entry, onClose, onDelete }: { entry: Entry; onClose: () => void; onDelete: () => void }) {
  const navigate = useNavigate()
  const meta = kindMeta[entry.kind]
  const openEditor = () => { onClose(); navigate(`${kindMeta[entry.kind].path}?edit=${encodeURIComponent(entry.id)}`) }
  const formatDetailValue = (key: string, value: Entry['details'][string]) => {
    if (key === 'foods' && Array.isArray(value)) return value.map((item) => localize(String(item).replace(/\s+\d+(?:\.\d+)?\s*(?:碗|根|杯|份|个|g|kg|ml)$/i, ''))).join(' + ')
    if (key === 'symptoms' && Array.isArray(value)) return value.map((item) => {
      if (!item || typeof item !== 'object' || !('name' in item)) return localize(item)
      const severity = 'severity' in item ? tx(symptomSeverityLabels[symptomSeverityLevel(item.severity)]) : ''
      return `${localize(item.name)}${severity ? ` · ${severity}` : ''}`
    }).join(' · ')
    if (Array.isArray(value)) return value.map(localize).join(' · ')
    return typeof value === 'string' ? localize(value) : String(value)
  }
  const display = localizedEntryFields(entry)
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><div className="modal detail-modal"><div className="modal-head"><div><span className="eyebrow">{tx(meta.label).toUpperCase()} · {entry.time}</span><h2>{tx("记录详情")}</h2></div><button className="icon-button" onClick={onClose} aria-label={tx("关闭")}><X size={18} /></button></div><div className="detail-hero"><div className={`diary-card-icon ${meta.color}`}><meta.icon size={24} /></div><div><strong>{display.title}</strong><span>{formatTime(entry.date, entry.time)}</span></div></div><div className="detail-summary">{display.summary}</div><div className="detail-grid">{Object.entries(entry.details).filter(([key, value]) => value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0) && !(key === 'severity' && Array.isArray(entry.details.symptoms))).map(([key, value]) => <div className="detail-line" key={key}><span>{tx(detailLabel(key))}</span><strong>{formatDetailValue(key, value)}</strong></div>)}</div><div className="modal-actions"><button className="danger-button" onClick={onDelete}><Trash2 size={16} /> {tx("删除记录")}</button><button className="primary-button" onClick={openEditor}><Edit3 size={16} /> {tx("编辑")}</button></div></div></div>
}
const detailLabel = (key: string) => ({ foods: '食物', meal: '餐次', amount: '份量', beverage: '饮品', type: '形状', typeName: '形状说明', feeling: '感受', sensations: '其他感觉', warningSigns: '需要留意', symptom: '症状', symptoms: '各症状程度', severity: '程度', onset: '开始时间', duration: '持续时间', quality: '质量', hours: '小时', minutes: '分钟', awakenings: '夜醒', wakingFeeling: '醒来感觉', distance: '距离', intensity: '强度', exerciseType: '训练类型', steps: '步数', bed: '入睡', wake: '起床', source: '记录方式', stress: '压力', movement: '运动', waterMl: '饮水', product: '产品', brand: '品牌', serving: '份量', ingredients: '配料', calories: '热量', protein: '蛋白质', carbs: '碳水', fat: '脂肪', fiber: '膳食纤维', sugar: '糖' } as Record<string, string>)[key] || key

function Insights({ entries, aiInsights }: { entries: Entry[]; aiInsights: boolean }) {
  const [range, setRange] = useState<7 | 14 | 30>(7)
  const [expanded, setExpanded] = useState(false)
  const [showRelated, setShowRelated] = useState(false)
  const insightStats = summarizeEntries(entries, TODAY, range)
  const { rangeEntries, bowel: bowelEntries, symptoms: symptomEntries, dairyMeals, dairyAssociatedMeals, dairyAssociatedBloating, bloating: bloatingEvents } = insightStats
  const loggedDays = insightStats.loggedDays
  const enoughForPatterns = loggedDays >= 7
  const patternAvailable = aiInsights && enoughForPatterns
  const consistency = Math.min(100, Math.round((loggedDays / range) * 100))
  const activeDays = new Set(rangeEntries.map((entry) => entry.date))
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(`${TODAY}T12:00:00`)
    date.setDate(date.getDate() - (6 - index))
    return { date: dateKey(date), label: new Intl.DateTimeFormat(appLocale(), { weekday: 'short' }).format(date) }
  })
  const max = Math.max(4, ...[1, 2, 3, 4, 5].map((type) => bowelEntries.filter((entry) => entry.details.type === String(type)).length))
  const symptomText = (entry: Entry) => `${entry.title} ${entry.summary} ${String(entry.details.symptom || '')} ${JSON.stringify(entry.details.symptoms || '')}`
  const symptomByDay = [1, 2, 3, 4, 5, 6, 0].map((day) => symptomEntries.filter((entry) => /腹胀|bloating/i.test(symptomText(entry)) && new Date(`${entry.date}T12:00:00`).getDay() === day).length)
  const painByDay = [1, 2, 3, 4, 5, 6, 0].map((day) => symptomEntries.filter((entry) => /腹痛/.test(symptomText(entry)) && new Date(`${entry.date}T12:00:00`).getDay() === day).length)
  const relatedIds = new Set([...dairyMeals, ...dairyAssociatedBloating].map((entry) => entry.id))
  const related = rangeEntries.filter((entry) => relatedIds.has(entry.id))
  return <div className="page insights-page"><PageHeader eyebrow={tx('PATTERNS OVER TIME')} title={tx("洞察")} action={<button className="secondary-button" onClick={() => setRange(range === 7 ? 30 : 7)}><SlidersHorizontal size={16} /> {tx("范围")}</button>} />
    <div className="range-tabs">{([7, 14, 30] as const).map((value) => <button key={value} className={range === value ? 'active' : ''} onClick={() => setRange(value)}>{value} {tx('Days')}</button>)}</div>
    <div className="insights-grid"><section className="insight-panel"><div className="panel-heading"><div><span className="eyebrow">{tx('BOWEL TYPES')}</span><h2>{tx("排便形状")}</h2></div><span className="panel-period">{tx("过去")} {range} {tx("天")}</span></div><div className="bar-chart">{[1, 2, 3, 4, 5].map((type) => { const count = bowelEntries.filter((entry) => entry.details.type === String(type)).length; return <div className="bar-row" key={type}><span className="bar-label">Type {type}</span><div className="bar-track"><div className="bar-fill clay" style={{ width: `${Math.max(count ? (count / max) * 100 : 7, 7)}%` }} /></div><b>{count || 0}</b></div> })}</div><div className="chart-note"><Info size={15} /> {tx("点击记录查看详情")}</div></section>
      <section className="insight-panel"><div className="panel-heading"><div><span className="eyebrow">{tx('SYMPTOMS')}</span><h2>{tx("身体感觉")}</h2></div><span className="panel-period">{tx("过去")} {range} {tx("天")}</span></div><div className="symptom-chart">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => <div className="symptom-day" key={day}><div className="symptom-columns"><span style={{ height: `${Math.min(100, symptomByDay[i] * 34 + 7)}%` }} /><span style={{ height: `${Math.min(100, painByDay[i] * 34 + 7)}%` }} /></div><small>{tx(day)}</small></div>)}</div><div className="legend"><span><i className="legend-dot rose" /> {tx("腹胀")}</span><span><i className="legend-dot amber" /> {tx("腹痛")}</span></div></section></div>
    <section className={`pattern-card ${expanded ? 'expanded' : ''} ${!patternAvailable ? 'pattern-locked' : ''}`}><div className="pattern-icon">{patternAvailable ? <Sparkles size={19} /> : <Clock3 size={19} />}</div><div className="pattern-main"><span className="eyebrow">{!aiInsights ? tx('AI INSIGHTS OFF') : patternAvailable ? tx('AI PATTERN · OBSERVATION') : tx('PATTERNS ARE IN PROGRESS')}</span><h2>{!aiInsights ? tx("智能分析已关闭") : patternAvailable ? tx("可能的模式") : `${tx('再记录')} ${Math.max(0, 7 - loggedDays)} ${tx('天')}`}</h2><p>{!aiInsights ? <>{tx("在“我的”里打开 AI Insights。")}</> : patternAvailable ? (dairyMeals.length ? <>{tx('Bloating was recorded after')} <strong>{dairyAssociatedMeals.length} / {dairyMeals.length} {tx('meals')}</strong> {tx('containing dairy')}.</> : <>{tx("暂无乳制品记录。")}</>) : <>{tx("至少需要 7 个记录日。")}</>}</p>{aiInsights && <div className="pattern-stats"><span><b>{dairyMeals.length}</b> {tx('dairy-containing meals')}</span><span><b>{dairyAssociatedMeals.length}</b> {tx('followed by bloating')}</span></div>}{patternAvailable && expanded && <div className="pattern-detail"><div><span>{tx('Dairy meals')}</span><strong>{dairyMeals.length ? `${dairyAssociatedMeals.length} / ${dairyMeals.length} ${tx('associated with bloating')}` : tx("暂时没有乳制品记录")}</strong></div><div><span>{tx("样本范围")}</span><strong>{loggedDays} {tx("个记录日 · 过去")} {range} {tx("天")}</strong></div><p>{tx('This is an observation from your logged data, not a diagnosis.')}</p></div>}<div className="pattern-actions">{patternAvailable ? <><button className="text-button" onClick={() => setExpanded(!expanded)}>{expanded ? tx("收起详情") : tx("查看依据")} <ChevronDown size={15} className={expanded ? 'rotate-180' : ''} /></button>{expanded && <button className="primary-button small" onClick={() => setShowRelated(true)}>{tx("查看相关记录")} <ArrowRight size={15} /></button>}</> : <span className="muted-small">{!aiInsights ? tx("我的 · 智能分析") : `${tx('已记录')} ${loggedDays} / 7 ${tx('天')}`}</span>}</div></div></section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">{tx('CONSISTENCY')}</span><h2>{tx("记录节奏")}</h2></div></div><div className="consistency-row"><div><strong>{rangeEntries.length}</strong><span>{tx("过去")} {range} {tx("天记录")}</span></div><div><strong>{loggedDays}</strong><span>{tx("活跃天数")}</span></div><div><strong>{consistency}%</strong><span>{tx("覆盖率")}</span></div><div className="week-dots">{weekDays.map((day) => <span className={activeDays.has(day.date) ? 'filled' : ''} key={day.date}>{day.label}</span>)}</div></div></section>
    <div className="report-link-row"><Link to="/report" className="secondary-button"><FileText size={16} /> {tx("查看 14 天报告")} <ArrowRight size={15} /></Link></div>
    {showRelated && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowRelated(false) }}><div className="modal related-modal"><div className="modal-head"><div><span className="eyebrow">{tx('PATTERN CONTEXT')}</span><h2>{tx("相关记录")}</h2></div><button className="icon-button" onClick={() => setShowRelated(false)} aria-label={tx("关闭")}><X size={18} /></button></div><p className="modal-subtitle">{tx("乳制品和腹胀记录。")}</p>{related.length ? <div className="related-list">{related.slice(0, 8).map((entry) => <TimelineEntry entry={entry} key={entry.id} compact />)}</div> : <div className="related-empty"><Info size={17} /><span>{tx("没有相关记录。")}</span></div>}</div></div>}
  </div>
}

function Report({ entries, aiInsights }: { entries: Entry[]; aiInsights: boolean }) {
  const stats = summarizeEntries(entries, TODAY, 14)
  const { rangeEntries, bowel, symptoms, meals, types, zones, dairyMeals, dairyAssociatedMeals, nonDairyMeals, nonDairyAssociatedMeals, bloating, loggedDays } = stats
  const totalBowel = bowel.length
  const enoughForPatterns = loggedDays >= 7
  const zoneTotal = Math.max(1, totalBowel)
  const topType = types.reduce((best, count, index) => count > best.count ? { type: index + 1, count } : best, { type: 1, count: 0 })
  const standout = totalBowel === 0
    ? tx('排便记录不足。')
    : zones.ideal >= zones.hard && zones.ideal >= zones.loose
      ? `${tx('理想区间占')} ${Math.round((zones.ideal / zoneTotal) * 100)}%${tx('整体更接近理想区间。')}`
      : zones.hard > zones.ideal
        ? tx('偏硬记录较多。')
        : tx('偏稀记录较多。')
  return <div className="page report-page"><PageHeader eyebrow={tx('14 DAY REPORT')} title={tx("你的两周记录")} action={<Link to="/insights" className="secondary-button"><ArrowLeft size={16} /> {tx("返回洞察")}</Link>} />
    <section className="report-summary"><div><span className="eyebrow">{tx('COVERAGE')}</span><strong>{loggedDays}<small> {tx("/ 14 天")}</small></strong><p>{rangeEntries.length ? `${tx('共整理')} ${rangeEntries.length} ${tx('条记录')}` : tx("还没有两周记录")}</p></div><div className="report-summary-ring"><span>{Math.round((loggedDays / 14) * 100)}%</span><small>{tx("覆盖率")}</small></div></section>
    <section className="report-stat-grid"><div><span>{tx("排便")}</span><strong>{totalBowel}</strong><small>{tx("次")}</small></div><div><span>{tx("身体感觉")}</span><strong>{symptoms.length}</strong><small>{tx("条")}</small></div><div><span>{tx("饮食")}</span><strong>{meals.length}</strong><small>{tx("餐")}</small></div><div><span>{tx("乳制品餐")}</span><strong>{dairyMeals.length}</strong><small>{tx("餐")}</small></div></section>
    <section className="report-section"><div className="section-heading"><div><span className="eyebrow">{tx('STOOL')}</span><h2>{tx("排便形状")}</h2></div><span className="panel-period">{tx('Hard · Ideal · Loose')}</span></div><div className="report-zone-bars"><div className="report-zone-row"><span><i className="zone-dot hard" />{tx("偏硬 Type 1–2")}</span><div className="report-zone-track"><i style={{ width: `${(zones.hard / zoneTotal) * 100}%` }} /></div><strong>{zones.hard}</strong></div><div className="report-zone-row"><span><i className="zone-dot ideal" />{tx("理想 Type 3–4")}</span><div className="report-zone-track ideal"><i style={{ width: `${(zones.ideal / zoneTotal) * 100}%` }} /></div><strong>{zones.ideal}</strong></div><div className="report-zone-row"><span><i className="zone-dot loose" />{tx("偏稀 Type 5–7")}</span><div className="report-zone-track loose"><i style={{ width: `${(zones.loose / zoneTotal) * 100}%` }} /></div><strong>{zones.loose}</strong></div></div><div className="report-type-grid">{types.map((count, index) => <div key={index}><span>Type {index + 1}</span><strong>{count}</strong></div>)}</div><p className="report-note">{tx("出现最多的是 Type")} {topType.type}（{topType.count} {tx("次）。Bristol 分类用于记录形状，不代表诊断。")}</p></section>
    <section className="report-section report-evidence"><div className="section-heading"><div><span className="eyebrow">{tx('WHAT STOOD OUT')}</span><h2>{tx("重点记录")}</h2></div></div>{aiInsights ? <><p className="report-lead">{standout}</p>{enoughForPatterns ? <div className="evidence-list"><div><span>{tx("乳制品餐")}</span><strong>{dairyMeals.length} {tx("餐")}</strong></div><div><span>{tx("腹胀记录")}</span><strong>{bloating} {tx("条")}</strong></div><div><span>{tx("乳制品餐后腹胀")}</span><strong>{dairyMeals.length ? `${dairyAssociatedMeals.length} / ${dairyMeals.length} ${tx('餐')}` : tx("暂无样本")}</strong></div><div><span>{tx("非乳制品餐后腹胀")}</span><strong>{nonDairyMeals.length ? `${nonDairyAssociatedMeals.length} / ${nonDairyMeals.length} ${tx('餐')}` : tx("暂无样本")}</strong></div></div> : <div className="report-empty"><Clock3 size={17} /><span>{tx("记录日少于 7 天。")}</span></div>}</> : <div className="report-empty"><ShieldCheck size={17} /><span>{tx("智能分析已关闭。")}</span></div>}</section>
    <section className="report-section report-disclaimer"><ShieldCheck size={18} /><div><strong>{tx("这是记录摘要，不是诊断")}</strong><p>{tx("仅供记录参考，不代表医疗判断。")}</p></div></section>
  </div>
}

function Profile({ settings, setSettings, onReset, onLoadDemo, onDeleteData, onExport }: { settings: Settings; setSettings: (next: Settings) => void; onReset: () => void; onLoadDemo: () => void; onDeleteData: () => void; onExport: () => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(settings.name)
  const [profileNotice, setProfileNotice] = useState('')
  const toggleTracking = (kind: EntryKind) => setSettings({ ...settings, tracking: { ...settings.tracking, [kind]: !settings.tracking[kind] } })
  return <div className="page profile-page">
    <PageHeader title={tx("我的")} action={<button className="icon-button subtle" onClick={() => setEditing(true)} aria-label={tx("编辑资料")}><MoreHorizontal size={19} /></button>} />
    <section className="profile-identity">
      <div className="profile-avatar">{initialsForName(settings.name)}</div>
      <div className="profile-copy">
        {editing ? <input className="inline-input" value={name} onChange={(e) => setName(e.target.value)} /> : <h2>{settings.name}</h2>}
        <span>{settings.email}</span>
        <button className="text-button" onClick={() => { if (editing) setSettings({ ...settings, name }); setEditing(!editing) }}>{editing ? <><Check size={14} /> {tx("保存姓名")}</> : <><Edit3 size={14} /> {tx("编辑资料")}</>}</button>
      </div>
    </section>
    <div className="settings-layout">
      <div className="settings-column">
        <SettingsSection title={tx("记录项目")}>
          <div className="setting-list">
            {(Object.keys(kindMeta) as EntryKind[]).map((kind) => {
              const meta = kindMeta[kind]
              const SettingIcon = meta.icon
              return <div className="setting-row" key={kind}>
                <span className={`setting-icon ${meta.color}`}><SettingIcon size={17} /></span>
                <div className="setting-copy"><strong>{tx(meta.label)}</strong></div>
                <Toggle label={tx(meta.label)} checked={settings.tracking[kind]} onChange={() => toggleTracking(kind)} />
              </div>
            })}
          </div>
        </SettingsSection>
        <SettingsSection title={tx("智能分析")}>
          <div className="setting-row"><span className="setting-icon sage"><Sparkles size={17} /></span><div className="setting-copy"><strong>{tx('AI Insights')}</strong></div><Toggle label={tx('AI Insights')} checked={settings.aiInsights} onChange={() => setSettings({ ...settings, aiInsights: !settings.aiInsights })} /></div>
        </SettingsSection>
      </div>
      <div className="settings-column">
        <SettingsSection title={tx("提醒")}>
          <div className="setting-row"><span className="setting-icon amber"><Bell size={17} /></span><div className="setting-copy"><strong>{tx("每日提醒")}</strong><span>{tx("每天 20:00")}</span></div><Toggle label={tx("每日提醒")} checked={settings.dailyReminder} onChange={() => setSettings({ ...settings, dailyReminder: !settings.dailyReminder })} /></div>
          <div className="setting-row"><span className="setting-icon sky"><BarChart3 size={17} /></span><div className="setting-copy"><strong>{tx("每周报告")}</strong><span>{tx("每周日")}</span></div><Toggle label={tx("每周报告")} checked={settings.weeklyReport} onChange={() => setSettings({ ...settings, weeklyReport: !settings.weeklyReport })} /></div>
        </SettingsSection>
        <SettingsSection title={tx("数据与隐私")}>
          <button className="action-row" onClick={onExport}><FileText size={17} /><span>{tx("导出我的数据")}</span><ChevronRight size={16} /></button>
          <button className="action-row" onClick={() => setProfileNotice('已打开 AI 数据设置')}><ShieldCheck size={17} /><span>{tx("AI 数据设置")}</span><ChevronRight size={16} /></button>
          <button className="action-row" onClick={onLoadDemo}><Receipt size={17} /><span>{tx("载入 14 天演示数据")}</span><ChevronRight size={16} /></button>
          <button className="action-row danger-text" onClick={() => { onReset(); setProfileNotice('已恢复演示数据') }}><Trash2 size={17} /><span>{tx("重置演示数据")}</span><ChevronRight size={16} /></button>
          <button className="action-row danger-text" onClick={() => { if (window.confirm(tx('确定删除所有记录吗？此操作无法撤销。'))) { onDeleteData(); setProfileNotice('所有记录已删除') } }}><Trash2 size={17} /><span>{tx("删除我的数据")}</span><ChevronRight size={16} /></button>
          {profileNotice && <div className="privacy-note"><Info size={15} /> {tx(profileNotice)}</div>}
        </SettingsSection>
        <SettingsSection title={tx("外观")}>
          <div className="appearance-tabs">{(['light', 'dark', 'system'] as const).map((appearance) => <button key={appearance} className={settings.appearance === appearance ? 'selected' : ''} onClick={() => setSettings({ ...settings, appearance })}>{appearance === 'light' ? tx("浅色") : appearance === 'dark' ? tx("深色") : tx("跟随系统")}</button>)}</div>
        </SettingsSection>
        <SettingsSection title={tx("语言")}>
          <div className="appearance-tabs language-tabs">{languageOptions.map(({ code, label }) => <button key={code} className={settings.language === code ? 'selected' : ''} onClick={() => setSettings({ ...settings, language: code as Language })}>{label}</button>)}</div>
        </SettingsSection>
      </div>
    </div>
  </div>
}
function SettingsSection({ title, children }: { title: string; children: ReactNode }) { return <section className="settings-section"><div className="section-heading"><h2>{title}</h2></div>{children}</section> }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <button type="button" role="switch" aria-label={label} aria-checked={checked} className={`toggle ${checked ? 'on' : ''}`} onClick={onChange}><span /></button> }

type FlowKind = 'food' | 'bowel' | 'symptom' | 'water' | 'exercise' | 'sleep'
type Food = { name: string; qty: string; unit: string }
type EntryDraft = Omit<Entry, 'id' | 'date'> & Partial<Pick<Entry, 'date'>>
type EntryWriter = (entry: EntryDraft) => void
const flowEntryKinds: Record<FlowKind, EntryKind> = { food: 'meal', bowel: 'bowel', symptom: 'symptom', water: 'water', exercise: 'exercise', sleep: 'sleep' }

function FlowShell({ title, eyebrow, step, total, children, onBack, onClose, hideProgress = false }: { title: string; eyebrow: string; step: string; total?: string; children: ReactNode; onBack?: () => void; onClose?: () => void; hideProgress?: boolean }) {
  const navigate = useNavigate()
  return <div className="flow-shell"><div className="flow-topbar"><button className="icon-button" onClick={onBack || (() => navigate('/'))} aria-label={tx("返回")}><ArrowLeft size={19} /></button><div className="flow-brand"><span className="brand-mark"><Leaf size={15} /></span>Poop Diary</div><button className="icon-button" onClick={onClose || (() => navigate('/'))} aria-label={tx("关闭")}><X size={18} /></button></div>{!hideProgress && total && <div className="flow-progress"><span style={{ width: `${(Number(step) / Number(total)) * 100}%` }} /></div>}<div className="flow-content"><span className="eyebrow">{tx(eyebrow)}</span><h1>{tx(title)}</h1>{total && <div className="flow-step">{step} / {total}</div>}{children}</div></div>
}

function LogPage({ onAdd, onUpdate, entries }: { onAdd: EntryWriter; onUpdate: (id: string, patch: Partial<Entry>) => void; entries: Entry[] }) {
  const { type } = useParams<{ type: FlowKind }>()
  const location = useLocation()
  const quick = new URLSearchParams(location.search).get('quick') === '1'
  const detailsMode = new URLSearchParams(location.search).get('details') === '1'
  const editId = new URLSearchParams(location.search).get('edit')
  const editEntry = editId ? entries.find((entry) => entry.id === editId) : undefined
  const save = (draft: EntryDraft) => {
    if (editEntry) {
      const { date, ...patch } = draft
      onUpdate(editEntry.id, { ...patch, ...(date ? { date } : {}) })
      return
    }
    onAdd(draft)
  }
  if (editEntry && type && editEntry.kind !== flowEntryKinds[type]) return <Navigate to="/diary" replace />
  if (type === 'food') return quick && !editEntry ? <QuickFoodFlow onAdd={onAdd} /> : <FoodFlow onSave={save} editEntry={editEntry} />
  if (type === 'bowel') return <BowelFlow onSave={save} editEntry={editEntry} quick={quick || Boolean(editEntry)} />
  if (type === 'symptom') return (quick || editEntry) && !detailsMode ? <QuickSymptomFlow onSave={save} editEntry={editEntry} /> : <SymptomFlow onSave={save} editEntry={editEntry} />
  if (type === 'water') return <WaterFlow onSave={save} editEntry={editEntry} entries={entries} />
  if (type === 'exercise') return <ExerciseFlow onSave={save} editEntry={editEntry} />
  if (type === 'sleep') return <SleepFlow onSave={save} editEntry={editEntry} />
  return <Navigate to="/" replace />
}

function ChoiceTile({ icon: IconComp, title, description, onClick, color = 'sage' }: { icon: Icon; title: string; description?: string; onClick: () => void; color?: string }) { return <button className="choice-tile" onClick={onClick}><span className={`choice-icon ${color}`}><IconComp size={22} /></span><span className="choice-copy"><strong>{tx(title)}</strong>{description && <small>{tx(description)}</small>}</span><ChevronRight size={17} className="choice-arrow" /></button> }
function PrimaryFooter({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) { return <div className="flow-footer"><button className="primary-button wide" onClick={onClick} disabled={disabled}>{tx(label)}<ArrowRight size={17} /></button></div> }
function Field({ label, children, helper }: { label: string; children: ReactNode; helper?: string }) { return <label className="field"><span>{tx(label)}</span>{children}{helper && <small>{tx(helper)}</small>}</label> }
function PillSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) { return <div className="pill-select">{options.map((option) => <button className={value === option ? 'selected' : ''} key={option} onClick={() => onChange(option)}>{tx(option)}</button>)}</div> }
function Stepper({ value, onChange, min = 0, max = 99999, step = 1, suffix }: { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  const precision = step < 1 ? String(step).split('.')[1]?.length || 1 : 0
  const format = (next: number) => precision ? Number(next.toFixed(precision)) : Math.round(next)
  const adjust = (delta: number) => onChange(format(Math.min(max, Math.max(min, value + delta))))
  return <div className="stepper"><button type="button" onClick={() => adjust(-step)} disabled={value <= min} aria-label={tx("减少")}><Minus size={16} /></button><strong>{precision ? value.toFixed(precision) : value}</strong>{suffix && <span>{suffix}</span>}<button type="button" onClick={() => adjust(step)} disabled={value >= max} aria-label={tx("增加")}><Plus size={16} /></button></div>
}
function FoodNamePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const options = Array.from(new Set([value, ...foodLibrary].filter(Boolean)))
  return <div className="food-name-picker"><button type="button" className="choice-tile compact-tile" onClick={() => setOpen((current) => !current)}><span className="food-avatar sage">{foodInitial(value)}</span><span className="choice-copy"><strong>{value ? tx(value) : tx("选择食物")}</strong></span><ChevronDown size={16} className={open ? 'rotate-180' : ''} /></button>{open && <div className="food-name-options">{options.map((option) => <button type="button" className={option === value ? 'selected' : ''} key={option} onClick={() => { onChange(option); setOpen(false) }}>{tx(option)}{option === value && <Check size={14} />}</button>)}</div>}</div>
}

const quickSymptoms = ['腹胀', '腹痛', '恶心', '胃灼热', '放屁增多', '便意频繁']
const symptomSeverityLabels = ['', '轻微', '中等', '严重']
const symptomSeverityLevel = (value: unknown) => {
  if (typeof value === 'number') return Math.max(1, Math.min(3, Math.round(value)))
  if (value === '严重') return 3
  if (value === '中等') return 2
  return 1
}
const readSymptomRecords = (value: unknown): SymptomRecord[] => Array.isArray(value)
  ? value.filter((item): item is SymptomRecord => Boolean(item && typeof item === 'object' && !Array.isArray(item) && typeof (item as SymptomRecord).name === 'string' && typeof (item as SymptomRecord).severity === 'number'))
  : []

function QuickSymptomFlow({ onSave, editEntry }: { onSave: EntryWriter; editEntry?: Entry }) {
  const navigate = useNavigate()
  const isEditing = Boolean(editEntry)
  const initialLevels = () => {
    if (!editEntry) return {}
    const details = editEntry.details || {}
    const summary = String(editEntry.summary || '')
    const structured = readSymptomRecords(details.symptoms)
    if (structured.length) return Object.fromEntries(structured.filter(({ name }) => quickSymptoms.includes(name)).map(({ name, severity }) => [name, symptomSeverityLevel(severity)]))
    const source = String(details.symptom || editEntry.title || '')
    const names = quickSymptoms.filter((name) => source.includes(name) || summary.includes(name))
    const fallbackLevel = symptomSeverityLevel(details.severity)
    return Object.fromEntries(names.map((name) => {
      const match = summary.match(new RegExp(`${name}\\s*[·•]\\s*(轻微|中等|严重)`))
      return [name, match ? symptomSeverityLevel(match[1]) : fallbackLevel]
    }))
  }
  const [levels, setLevels] = useState<Record<string, number>>(initialLevels)
  const [warningSigns, setWarningSigns] = useState<string[]>(() => Array.isArray(editEntry?.details.warningSigns) ? editEntry!.details.warningSigns!.map(String) : [])
  const [showSafety, setShowSafety] = useState(() => Boolean(editEntry?.details.warningSigns && Array.isArray(editEntry.details.warningSigns) && editEntry.details.warningSigns.length))
  const warningOptions = ['呼吸困难或胸痛', '剧烈或加重的疼痛', '头晕或快要晕倒', '持续呕吐或无法喝水', '高热或明显虚弱', '大量出血或黑便']
  const emergencyWarning = warningSigns.some((item) => ['呼吸困难或胸痛', '剧烈或加重的疼痛', '头晕或快要晕倒', '大量出血或黑便'].includes(item))
  const cycle = (name: string) => setLevels((current) => ({ ...current, [name]: ((current[name] || 0) + 1) % 4 }))
  const toggleWarning = (warning: string) => setWarningSigns((current) => current.includes(warning) ? current.filter((item) => item !== warning) : [...current, warning])
  const save = (clear = false) => {
    const active = clear ? [] : Object.entries(levels).filter(([, level]) => level > 0)
    if (!clear && !active.length && !warningSigns.length) return
    const symptom = clear ? '没什么' : active.length ? active.map(([name]) => name).join('、') : '需要关注'
    const summary = clear ? warningSigns.length ? '已记录异常信号' : '今天感觉还好' : active.map(([name, level]) => `${name} · ${symptomSeverityLabels[level]}`).join(' · ')
    const warningSummary = warningSigns.length && !summary.includes('异常信号') ? ' · 已记录异常信号' : ''
    onSave({
      kind: 'symptom',
      time: editEntry?.time || currentTime(),
      title: symptom,
      summary: `${summary}${warningSummary}`,
      details: {
        ...(editEntry?.details || {}),
        symptom,
        severity: clear ? '无' : active.length ? Math.max(...active.map(([, level]) => level)) : '未记录',
        symptoms: active.map(([name, level]) => ({ name, severity: level })),
        warningSigns,
      },
    })
    navigate(isEditing ? '/diary' : '/')
  }
  const addDetails = () => {
    const first = Object.entries(levels).find(([, level]) => level > 0)
    const query = isEditing ? `?edit=${encodeURIComponent(editEntry!.id)}&details=1` : ''
    navigate(`/log/symptom${query}`, {
      state: first ? { symptom: first[0], severity: symptomSeverityLabels[first[1]] } : null,
    })
  }
  if (warningSigns.length) return <SafetyStopScreen warningSigns={warningSigns} emergencyWarning={emergencyWarning} onBack={() => { setWarningSigns([]); setShowSafety(false) }} />
  return <FlowShell title={tx("现在感觉怎么样？")} eyebrow={isEditing ? `${tx('身体感觉')} · ${tx('编辑记录')}` : tx('+ 身体感觉')} step="1" onBack={() => navigate(isEditing ? '/diary' : '/')}><SafetySignals options={warningOptions} warningSigns={warningSigns} showSafety={showSafety} onToggleOpen={() => setShowSafety((open) => !open)} onToggle={toggleWarning} emergencyWarning={emergencyWarning} /><div className="symptom-chip-grid">{quickSymptoms.map((name) => { const level = levels[name] || 0; return <button key={name} type="button" className={`symptom-chip level-${level}`} onClick={() => cycle(name)} aria-label={`${tx(name)} · ${level ? tx(symptomSeverityLabels[level]) : tx('未记录')}`} aria-pressed={level > 0}><span className="symptom-chip-label">{tx(name)}</span><span className="symptom-chip-footer">{level > 0 ? <><span className="symptom-chip-status">{tx(symptomSeverityLabels[level])}</span><span className="symptom-chip-meter" aria-hidden="true">{[1, 2, 3].map((mark) => <span key={mark} className={mark <= level ? 'filled' : ''} />)}</span></> : <Plus className="symptom-chip-add" size={16} aria-hidden="true" />}</span></button> })}</div><button className="fine-button" onClick={() => save(true)}><Check size={17} /> {isEditing ? tx("保存为没什么") : tx("我感觉很好")}</button><button className="text-button center symptom-details-link" onClick={addDetails}>{tx("添加持续时间等细节")} <ArrowRight size={14} /></button><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存身体感觉')} onClick={() => save()} disabled={!Object.values(levels).some(Boolean) && !warningSigns.length} /></FlowShell>
}

function QuickFoodFlow({ onAdd }: { onAdd: (entry: Omit<Entry, 'id' | 'date'> & Partial<Pick<Entry, 'date'>>) => void }) {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const usual = ['燕麦粥 + 香蕉', '米饭 + 鸡肉', '咖啡 + 吐司']
  const save = (value = text) => { const foods = value.split(/[、,，+]/).map((food) => food.trim()).filter(Boolean); if (!foods.length) return; const hour = new Date().getHours(); const meal = hour < 10 ? '早餐' : hour < 14 ? '午餐' : hour < 18 ? '下午茶' : '晚餐'; onAdd({ kind: 'meal', time: new Date().toTimeString().slice(0, 5), title: meal, summary: foods.join(' + '), details: { foods, meal, source: 'quick-input' } }); navigate('/') }
  return <FlowShell title={tx("吃了什么？")} eyebrow={tx("+ 饮食")} step="1" onBack={() => navigate('/')}><div className="quick-food-input"><Utensils size={18} /><input autoFocus value={text} onChange={(event) => setText(event.target.value)} placeholder={tx("例如：燕麦粥、香蕉、咖啡")} /></div><div className="usual-row"><span className="eyebrow">{tx("常吃")}</span>{usual.map((value) => <button key={value} onClick={() => save(value)}>{tx(value)}<Plus size={13} /></button>)}</div><button className="text-button center" onClick={() => navigate('/log/food')}>{tx("更多记录方式")} <ArrowRight size={14} /></button><PrimaryFooter label={tx("保存饮食")} onClick={() => save()} disabled={!text.trim()} /></FlowShell>
}

function FoodFlow({ onSave, editEntry }: { onSave: EntryWriter; editEntry?: Entry }) {
  const navigate = useNavigate()
  const isEditing = Boolean(editEntry)
  const initialFoodDetails = Array.isArray(editEntry?.details.foods) ? editEntry?.details.foods.map((value) => {
    const text = String(value)
    const match = text.match(/^(.*?)(?:\s+)(\d+(?:\.\d+)?)\s*(碗|根|杯|份|个|g|kg|ml)$/i)
    return match ? { name: match[1].trim(), qty: match[2], unit: match[3] } : { name: text, qty: '1', unit: '份' }
  }) : []
  const [step, setStep] = useState(isEditing ? 'meal' : 'method')
  const [photoMode, setPhotoMode] = useState<'food' | 'package' | 'label'>('food')
  const [foods, setFoods] = useState<Food[]>(initialFoodDetails)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [meal, setMeal] = useState(String(editEntry?.details.meal || mealForCurrentTime()))
  const [time, setTime] = useState(editEntry?.time || currentTime())
  const [search, setSearch] = useState('')
  const [voiceText, setVoiceText] = useState('我吃了燕麦粥和香蕉，还喝了一杯咖啡。')
  const [ingredients, setIngredients] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [packageTab, setPackageTab] = useState<'ingredients' | 'nutrition'>('ingredients')
  const [mealSource, setMealSource] = useState<'photoResult' | 'packageConfirm' | 'voiceResult' | 'manualDetail'>(isEditing ? 'manualDetail' : 'photoResult')
  const [saved, setSaved] = useState(false)
  const voiceDefaults: Food[] = [{ name: '燕麦粥', qty: '1', unit: '碗' }, { name: '香蕉', qty: '1', unit: '根' }, { name: '咖啡', qty: '1', unit: '杯' }]
  const parseVoice = (text: string) => {
    const hits = foodLibrary.filter((food) => text.includes(food)).sort((a, b) => b.length - a.length)
    const names = hits.filter((food, index, all) => !all.slice(0, index).some((longer) => longer.includes(food)))
    return (names.length ? names : voiceDefaults.map((food) => food.name)).map((name) => ({ name, qty: '1', unit: name === '香蕉' ? '根' : name === '咖啡' ? '杯' : name === '燕麦粥' ? '碗' : '份' }))
  }
  const back = () => { if (step === 'method') navigate('/'); else if (step === 'photoType' || step === 'voiceInput') setStep('method'); else if (step === 'manualSearch') setStep(isEditing ? 'meal' : 'method'); else if (step.startsWith('photo')) setStep('photoType'); else if (step.startsWith('package')) setStep('photoType'); else if (step === 'voiceResult') setStep('voiceInput'); else if (step === 'voiceEdit') setStep('voiceResult'); else if (step === 'manualDetail') setStep(isEditing ? 'meal' : 'manualSearch'); else if (step === 'meal') { if (isEditing) navigate('/diary'); else setStep(mealSource) } else setStep('method') }
  const finish = (source = mealSource, title = meal) => {
    const packageDetails = source === 'packageConfirm' ? {
      product: '燕麦能量杯', brand: 'Oat Daily', serving: '1 cup · 60 g', ingredients: ingredients ? '燕麦、牛奶、糖、亚麻籽、海盐' : '未读取配料表', calories: '284 kcal', protein: '10.2 g', carbs: '42 g', fat: '7.8 g', fiber: '6.4 g', sugar: '9.2 g',
    } : {}
    onSave({ kind: 'meal', time, title, summary: foods.map((food) => food.name).join(' + ') || '燕麦粥 + 香蕉', details: { ...(isEditing ? editEntry?.details : {}), foods: foods.map((food) => `${food.name} ${food.qty}${food.unit}`), meal, source, ...packageDetails } })
    setSaved(true)
    setTimeout(() => navigate(isEditing ? '/diary' : '/'), 700)
  }
  const updateFood = (index: number, patch: Partial<Food>) => setFoods((items) => items.map((food, i) => i === index ? { ...food, ...patch } : food))
  const beginPhoto = (mode: typeof photoMode) => { setPhotoMode(mode); setPackageTab(mode === 'label' ? 'nutrition' : 'ingredients'); setPhotoLoading(true); setStep(mode === 'food' ? 'photoCamera' : 'packageFront'); setTimeout(() => setPhotoLoading(false), 800) }
  if (saved) return <div className="saved-screen"><div className="saved-check"><Check size={30} /></div><span className="eyebrow">{isEditing ? tx('UPDATED IN DIARY') : tx('SAVED TO TODAY')}</span><h1>{isEditing ? tx("修改好了。") : tx("记录好了。")}</h1><p>{isEditing ? tx("这条饮食记录已经更新。") : tx("已加入今天的记录。")}</p></div>
  if (step === 'method') return <FlowShell title={tx("你吃了什么？")} eyebrow={tx("饮食 · 第一步")} step="1" total="4" onBack={() => navigate('/')}><div className="flow-stack"><ChoiceTile icon={Camera} title={tx("拍照记录")} onClick={() => setStep('photoType')} color="sage" /><ChoiceTile icon={Mic} title={tx("说出来")} onClick={() => setStep('voiceInput')} color="rose" /><ChoiceTile icon={Keyboard} title={tx("自己输入")} onClick={() => setStep('manualSearch')} color="sky" /></div><div className="recent-block"><div className="mini-heading"><span>{tx("最近记录")}</span><button className="text-button" onClick={() => navigate('/diary')}>{tx("查看全部")} <ArrowRight size={14} /></button></div><div className="recent-foods"><button onClick={() => { setFoods([{ name: '燕麦粥', qty: '1', unit: '碗' }]); setStep('meal') }}><span className="food-avatar sage">{tx("燕")}</span><span>{tx("燕麦粥")}</span><small>{tx("昨天 08:10")}</small></button><button onClick={() => { setFoods([{ name: '香蕉', qty: '1', unit: '根' }]); setStep('meal') }}><span className="food-avatar amber">{tx("香")}</span><span>{tx("香蕉")}</span><small>{tx("常吃")}</small></button></div></div></FlowShell>
  if (step === 'photoType') return <FlowShell title={tx("拍什么？")} eyebrow={tx("饮食 · 拍照记录")} step="2" total="4" onBack={back}><div className="camera-choice"><ChoiceTile icon={Utensils} title={tx("拍食物")} onClick={() => beginPhoto('food')} color="sage" /><ChoiceTile icon={Package} title={tx("拍包装")} onClick={() => beginPhoto('package')} color="amber" /><ChoiceTile icon={FileText} title={tx("拍营养成分表")} onClick={() => beginPhoto('label')} color="sky" /></div></FlowShell>
  if (step === 'photoCamera') return <FlowShell title={photoLoading ? tx('正在识别…') : tx('拍食物')} eyebrow={tx("饮食 · 相机")} step="2" total="4" onBack={back}><div className="camera-stage"><div className="camera-frame"><div className="scan-corner tl" /><div className="scan-corner tr" /><div className="scan-corner bl" /><div className="scan-corner br" /><div className={`scan-object ${photoLoading ? 'scanning' : ''}`}>{photoLoading ? <Sparkles size={33} /> : <Utensils size={41} />}</div><span>{photoLoading ? tx("正在识别盘中内容") : tx("点击快门")}</span></div><div className="camera-toolbar"><button className="shutter" onClick={() => { setFoods([{ name: '米饭', qty: '1', unit: '碗' }, { name: '鸡肉', qty: '120', unit: 'g' }, { name: '西兰花', qty: '80', unit: 'g' }]); setStep('photoResult') }} disabled={photoLoading} aria-label={tx("拍照")}><span /></button></div></div></FlowShell>
  if (step === 'photoResult') return <FlowShell title={tx("识别到了这些")} eyebrow={tx("饮食 · 识别结果")} step="3" total="4" onBack={back}><div className="recognition-note"><Sparkles size={17} /><span>{tx("请确认食物和份量。")}</span></div><div className="recognition-list">{foods.map((food, index) => <button className="recognition-row" key={`${food.name}-${index}`} onClick={() => { setSelectedFood(food); setStep('foodEdit') }}><span className="food-avatar sage">{foodInitial(food.name)}</span><span className="recognition-name"><strong>{tx(food.name)}</strong><small>{food.qty} {tx(food.unit)}</small></span><span className="confidence"><span>{tx("置信度")}</span><b>{[98, 91, 76][index] || 84}%</b></span><ChevronRight size={17} /></button>)}</div><div className="flow-inline-actions"><button className="secondary-button" onClick={() => setStep('photoCamera')}><Camera size={16} /> {tx("重新拍摄")}</button><button className="primary-button" onClick={() => setStep('meal')}>{tx("确认")} <ArrowRight size={16} /></button></div></FlowShell>
  if (step === 'foodEdit' && selectedFood) { const index = foods.findIndex((item) => item.name === selectedFood.name); return <FlowShell title={selectedFood.name} eyebrow={tx("饮食 · 修改识别结果")} step="3" total="4" onBack={() => setStep('photoResult')}><div className="edit-food-form"><Field label={tx("食物名称")}><FoodNamePicker value={selectedFood.name} onChange={(name) => { const next = { ...selectedFood, name }; setSelectedFood(next); updateFood(index, { name }) }} /></Field><Field label={tx("数量")}><Stepper value={Number(selectedFood.qty) || 1} onChange={(value) => { const next = { ...selectedFood, qty: String(value) }; setSelectedFood(next); updateFood(index, { qty: String(value) }) }} min={0} max={9999} step={selectedFood.unit === 'g' ? 10 : 1} suffix={selectedFood.unit} /></Field><Field label={tx("单位")}><PillSelect options={['碗', 'g', '个', '杯', '份']} value={selectedFood.unit} onChange={(unit) => { const next = { ...selectedFood, unit }; setSelectedFood(next); updateFood(index, { unit }) }} /></Field><button className="secondary-button wide" onClick={() => setStep('photoResult')}><Check size={16} /> {tx("完成修改")}</button></div></FlowShell> }
   if (step === 'packageFront') return <FlowShell title={photoMode === 'label' ? (photoLoading ? tx('正在读取营养成分表…') : tx('拍摄营养成分表')) : (photoLoading ? tx('正在识别包装…') : tx('拍摄包装正面'))} eyebrow={tx("饮食 · 包装识别")} step="2" total="4" onBack={() => setStep('photoType')}><div className="package-scan"><div className="package-visual"><Package size={48} /><span>{photoMode === 'label' ? tx('Nutrition label') : tx("燕麦能量杯")}</span><small>{photoMode === 'label' ? tx('PER SERVING') : tx('OAT DAILY')}</small></div><div className="scan-status">{photoLoading ? <><span className="loading-dot" /> {tx("正在读取信息")}</> : <><Check size={15} /> {photoMode === 'label' ? tx("营养信息已识别") : tx("产品已识别")}</>}</div>{!photoLoading && <><div className="product-facts"><div><span>{photoMode === 'label' ? tx('Calories') : tx("产品名称")}</span><strong>{photoMode === 'label' ? '284 kcal' : tx("燕麦能量杯")}</strong></div><div><span>{photoMode === 'label' ? tx('Protein') : tx("品牌")}</span><strong>{photoMode === 'label' ? '10.2 g' : 'Oat Daily'}</strong></div><div><span>{photoMode === 'label' ? tx('Fiber') : tx("份量")}</span><strong>{photoMode === 'label' ? '6.4 g' : tx('1 cup · 60 g')}</strong></div></div><PrimaryFooter label={tx("继续")} onClick={() => setStep(photoMode === 'label' ? 'packageNutrition' : 'packageIngredients')} /></>}</div></FlowShell>
  if (step === 'packageIngredients') return <FlowShell title={tx("是否读取配料？")} eyebrow={tx("饮食 · 包装识别")} step="3" total="4" onBack={() => setStep('packageFront')}><div className="flow-stack"><ChoiceTile icon={Search} title={tx("读取配料表")} onClick={() => { setIngredients(true); setStep('packageNutrition') }} color="sage" /><ChoiceTile icon={ArrowRight} title={tx("跳过")} onClick={() => setStep('packageConfirm')} color="muted" /></div></FlowShell>
   if (step === 'packageNutrition') return <FlowShell title={tx("配料与营养")} eyebrow={tx("饮食 · 包装识别")} step="3" total="4" onBack={() => setStep(photoMode === 'label' ? 'packageFront' : 'packageIngredients')}><div className="package-tabs"><button className={packageTab === 'ingredients' ? 'active' : ''} onClick={() => setPackageTab('ingredients')}>{tx('Ingredients')}</button><button className={packageTab === 'nutrition' ? 'active' : ''} onClick={() => setPackageTab('nutrition')}>{tx('Nutrition')}</button></div>{packageTab === 'ingredients' ? <div className="ingredients-list"><span>{tx("燕麦")}</span><span>{tx("牛奶")}</span><span>{tx("糖")}</span><span>{tx("亚麻籽")}</span><span>{tx("海盐")}</span></div> : <div className="nutrition-grid"><div><span>{tx('Calories')}</span><strong>284 kcal</strong></div><div><span>{tx('Protein')}</span><strong>10.2 g</strong></div><div><span>{tx('Carbs')}</span><strong>42 g</strong></div><div><span>{tx('Fat')}</span><strong>7.8 g</strong></div><div><span>{tx('Fiber')}</span><strong>6.4 g</strong></div><div><span>{tx('Sugar')}</span><strong>9.2 g</strong></div></div>}<PrimaryFooter label={tx("完成识别")} onClick={() => setStep('packageConfirm')} /></FlowShell>
   if (step === 'packageConfirm') return <FlowShell title={tx("识别完成")} eyebrow={tx("饮食 · 确认保存")} step="4" total="4" onBack={() => setStep(photoMode === 'label' ? 'packageFront' : 'packageIngredients')}><div className="package-summary"><span className="eyebrow">{tx('PRODUCT')}</span><h2>{tx("燕麦能量杯")}</h2><p>Oat Daily · {tx('1 cup · 60 g')}</p><div className="summary-block"><span>{tx("配料")}</span><strong>{ingredients ? tx("燕麦、牛奶、糖、亚麻籽、海盐") : tx("未读取配料表")}</strong></div><div className="summary-block"><span>{tx("营养")}</span><strong>284 kcal · {tx('Protein')} 10.2 g · {tx('Fiber')} 6.4 g</strong></div></div><PrimaryFooter label={tx("确认并选择餐次")} onClick={() => { setFoods([{ name: '燕麦能量杯', qty: '1', unit: '份' }]); setMealSource('packageConfirm'); setStep('meal') }} /></FlowShell>
  if (step === 'voiceInput') return <FlowShell title={tx("语音记录")} eyebrow={tx("饮食 · 语音记录")} step="2" total="4" onBack={back}><div className="voice-card"><div className="voice-orb"><Mic size={29} /><span /></div><strong>{tx("按住说话")}</strong><p>{tx("例如：我吃了燕麦粥和香蕉，还喝了一杯咖啡。")}</p><button className="voice-button" onClick={() => { setFoods(parseVoice(voiceText)); setStep('voiceResult') }}><Mic size={18} /> {tx("开始语音识别")}</button></div><Field label={tx("或者直接输入你想说的话")}><textarea rows={3} value={voiceText} onChange={(e) => setVoiceText(e.target.value)} /></Field><PrimaryFooter label={tx("开始识别")} onClick={() => { setFoods(parseVoice(voiceText)); setStep('voiceResult') }} /></FlowShell>
  if (step === 'voiceResult') return <FlowShell title={tx("识别完成")} eyebrow={tx("饮食 · 语音解析")} step="3" total="4" onBack={back}><div className="voice-result"><div className="recognition-note"><Check size={17} /> <span>{tx("识别完成")}</span></div><div className="voice-foods">{foods.map((food, index) => <button key={`${food.name}-${index}`} onClick={() => { setSelectedFood(food); setStep('voiceEdit') }}><span className="food-avatar rose">{foodInitial(food.name)}</span><strong>{tx(food.name)}</strong><ChevronRight size={16} /></button>)}</div><div className="result-meta"><div><span>{tx("餐次")}</span><strong>{tx(meal)}</strong></div><div><span>{tx("时间")}</span><strong>{time}</strong></div></div><button className="secondary-button wide" onClick={() => { setFoods((current) => current.length ? current : voiceDefaults); setMealSource('voiceResult'); setStep('meal') }}><Check size={16} /> {tx("确认识别结果")}</button></div></FlowShell>
  if (step === 'voiceEdit' && selectedFood) { const voiceIndex = foods.findIndex((item) => item.name === selectedFood.name); return <FlowShell title={selectedFood.name} eyebrow={tx("饮食 · 修改食物")} step="3" total="4" onBack={() => setStep('voiceResult')}><div className="edit-food-form"><Field label={tx("数量")}><Stepper value={Number(selectedFood.qty) || 1} onChange={(value) => setSelectedFood({ ...selectedFood, qty: String(value) })} min={0} max={9999} step={selectedFood.unit === 'g' ? 10 : 1} suffix={selectedFood.unit} /></Field><Field label={tx("单位")}><PillSelect options={['碗', '根', '杯', '份', '个']} value={selectedFood.unit} onChange={(unit) => setSelectedFood({ ...selectedFood, unit })} /></Field><button className="secondary-button wide" onClick={() => { setFoods((current) => current.map((item, index) => index === voiceIndex ? selectedFood : item)); setStep('voiceResult') }}><Check size={16} /> {tx("完成修改")}</button><button className="text-button center" onClick={() => { setFoods((current) => [...current, { name: '其他食物', qty: '1', unit: '份' }]); setStep('voiceResult') }}><Plus size={15} /> {tx("添加其他食物")}</button></div></FlowShell> }
  if (step === 'manualSearch') { const results = foodLibrary.filter((food) => food.includes(search) || !search).slice(0, 7); return <FlowShell title={tx("搜索食物")} eyebrow={tx("饮食 · 手动输入")} step="2" total="4" onBack={back}><div className="search-field"><Search size={18} /><input autoFocus placeholder={tx("输入食物名称")} value={search} onChange={(e) => setSearch(e.target.value)} /><kbd>/</kbd></div><div className="search-results"><span className="eyebrow">{tx("搜索结果")}</span>{results.map((food) => <button key={food} onClick={() => { setFoods((current) => [...current, { name: food, qty: '1', unit: food === '咖啡' ? '杯' : food === '香蕉' ? '根' : '份' }]); setSearch(''); setStep('manualDetail') }}><span className="food-avatar sky">{foodInitial(food)}</span><span>{tx(food)}</span><Plus size={16} /></button>)}</div>{foods.length > 0 && <div className="selected-foods"><span>{tx("已添加")} {foods.length} {tx("种")}</span>{foods.map((food) => <span key={`${food.name}-${food.qty}`} className="selected-chip">{tx(food.name)}<X size={12} onClick={() => setFoods((current) => current.filter((item) => item !== food))} /></span>)}</div>}</FlowShell> }
  if (step === 'manualDetail') return <FlowShell title={tx("调整份量")} eyebrow={tx("饮食 · 手动输入")} step="3" total="4" onBack={() => isEditing ? setStep('meal') : setStep('manualSearch')}><div className="manual-items">{foods.map((food, index) => <div className="manual-item" key={`${food.name}-${index}`}><div><strong>{tx(food.name)}</strong><span>{tx("数量和单位")}</span></div><div className="manual-controls"><Stepper value={Number(food.qty) || 1} onChange={(value) => updateFood(index, { qty: String(value) })} min={0} max={9999} step={food.unit === 'g' ? 10 : 1} suffix={tx(food.unit)} /><PillSelect options={['份', '碗', '杯', '根', '个', 'g']} value={food.unit} onChange={(unit) => updateFood(index, { unit })} /></div></div>)}</div><button className="secondary-button wide" onClick={() => setStep('manualSearch')}><Plus size={16} /> {tx("添加另一种食物")}</button><PrimaryFooter label={isEditing ? tx('完成食物修改') : tx('继续选择餐次')} onClick={() => { setMealSource('manualDetail'); setStep('meal') }} /></FlowShell>
  if (step === 'meal') return <FlowShell title={isEditing ? tx('编辑这顿饮食') : tx('选择餐次')} eyebrow={tx("饮食 · 最后确认")} step="4" total="4" onBack={back}><div className="meal-preview">{foods.map((food) => <div key={food.name}><span className="food-avatar sage">{foodInitial(food.name)}</span><strong>{tx(food.name)}</strong><span>{food.qty} {tx(food.unit)}</span></div>)}</div>{isEditing && <button className="secondary-button wide" onClick={() => setStep('manualDetail')}><Edit3 size={16} /> {tx("编辑食物和份量")}</button>}<Field label={tx("餐次")}><div className="meal-options">{['早餐', '午餐', '晚餐', '零食', '饮料', '其他'].map((option) => <button key={option} className={meal === option ? 'selected' : ''} onClick={() => setMeal(option)}>{tx(option)}</button>)}</div></Field><Field label={tx("时间")}><div className="time-input"><Clock3 size={17} /><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div></Field><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存饮食记录')} onClick={() => finish()} /></FlowShell>
  return null
}

function BowelFlow({ onSave, editEntry, quick = false }: { onSave: EntryWriter; editEntry?: Entry; quick?: boolean }) {
  const navigate = useNavigate()
  const location = useLocation()
  const carried = location.state as { type?: string; typeName?: string } | null
  const details = editEntry?.details || {}
  const isEditing = Boolean(editEntry)
  const [step, setStep] = useState<'type' | 'feel' | 'sensation' | 'pain' | 'bloating' | 'urgent' | 'time'>(carried?.type && !editEntry ? 'feel' : 'type')
  const [type, setType] = useState(String(details.type || carried?.type || ''))
  const [typeName, setTypeName] = useState(String(details.typeName || carried?.typeName || ''))
  const [feeling, setFeeling] = useState(String(details.feeling || ''))
  const [sensations, setSensations] = useState<string[]>(Array.isArray(details.sensations) ? details.sensations.map(String) : [])
  const [painLevel, setPainLevel] = useState(Number(details.painLevel || 4))
  const [painLocation, setPainLocation] = useState(String(details.painLocation || '中间'))
  const [bloating, setBloating] = useState(String(details.bloating || '轻微'))
  const [urgent, setUrgent] = useState(String(details.urgent || '有一点急'))
  const [warningSigns, setWarningSigns] = useState<string[]>(Array.isArray(details.warningSigns) ? details.warningSigns.map(String) : [])
  const [time, setTime] = useState(editEntry?.time || currentTime)
  const [showExamples, setShowExamples] = useState(false)
  const [showSafety, setShowSafety] = useState(() => Boolean(Array.isArray(details.warningSigns) && details.warningSigns.length))
  const typeOptions = [{ n: '1', icon: '●', name: '小硬球', desc: '一颗颗硬的小球' }, { n: '2', icon: '◆', name: '香肠状但结块', desc: '硬而分节的香肠形' }, { n: '3', icon: '━', name: '香肠，有裂纹', desc: '表面有明显裂纹' }, { n: '4', icon: '━', name: '光滑柔软', desc: '像香肠一样光滑' }, { n: '5', icon: '••', name: '柔软的小块', desc: '边缘清晰的柔软块' }, { n: '6', icon: '≈', name: '糊状', desc: '蓬松、糊状的碎片' }, { n: '7', icon: '∿', name: '水状', desc: '没有固体块' }]
  const warningOptions = ['鲜红色血便', '黑色或柏油样便', '出血量明显', '剧烈或加重的腹痛', '头晕或快要晕倒', '发热或反复呕吐']
  const emergencyWarning = warningSigns.some((item) => ['黑色或柏油样便', '出血量明显', '剧烈或加重的腹痛', '头晕或快要晕倒'].includes(item))
  const stoolWarning = warningSigns.some((item) => ['鲜红色血便', '黑色或柏油样便'].includes(item))
  const displayTypeName = typeName || typeOptions.find((item) => item.n === type)?.name || '不确定'
  const exitPath = isEditing ? '/diary' : '/'
  const chooseType = (item: typeof typeOptions[number]) => { setType(item.n); setTypeName(item.name); if (!quick) setStep('feel') }
  const toggleSense = (sense: string) => setSensations((current) => sense === '没有' ? (current.includes('没有') ? [] : ['没有']) : current.includes(sense) ? current.filter((x) => x !== sense) : [...current.filter((x) => x !== '没有'), sense])
  const toggleWarning = (warning: string) => setWarningSigns((current) => current.includes(warning) ? current.filter((item) => item !== warning) : [...current, warning])
  const nextAfterSensation = () => { if (sensations.includes('腹痛')) setStep('pain'); else if (sensations.includes('腹胀')) setStep('bloating'); else if (sensations.includes('很急')) setStep('urgent'); else setStep('time') }
  const nextAfterPain = () => sensations.includes('腹胀') ? setStep('bloating') : sensations.includes('很急') ? setStep('urgent') : setStep('time')
  const finish = () => {
    const hasPain = sensations.includes('腹痛')
    const hasBloating = sensations.includes('腹胀')
    const hasUrgency = sensations.includes('很急')
    const warningSummary = warningSigns.length ? ' · 已记录异常信号' : ''
    onSave({
      kind: 'bowel',
      time,
      title: `排便 · Type ${type || '不确定'}`,
      summary: `${feeling || '未记录'}${sensations.length && !sensations.includes('没有') ? ` · ${sensations.join('、')}` : ''}${warningSummary}`,
      details: {
        ...(editEntry?.details || {}),
        type,
        typeName: displayTypeName,
        feeling: feeling || '未记录',
        sensations,
        warningSigns,
        painLevel: hasPain ? painLevel : undefined,
        painLocation: hasPain ? painLocation : undefined,
        bloating: hasBloating ? bloating : undefined,
        urgent: hasUrgency ? urgent : undefined,
      },
    })
    navigate(exitPath)
  }
  if (warningSigns.length) return <SafetyStopScreen warningSigns={warningSigns} emergencyWarning={emergencyWarning} onBack={() => { setWarningSigns([]); setShowSafety(false) }} />
  if (step === 'type') return <FlowShell title={tx("这次的形状是？")} eyebrow={`${tx('排便')} · ${isEditing ? tx('编辑记录') : tx('快速记录')}`} step="1" total="5" onBack={() => navigate(exitPath)}><div className="stool-grid">{typeOptions.map((item) => <button className={`stool-option ${type === item.n ? 'selected' : ''}`} key={item.n} onClick={() => chooseType(item)}><span className="stool-number">{item.n}</span><span className={`stool-shape shape-${item.n}`}>{item.icon}</span><strong>{tx(item.name)}</strong></button>)}</div><button className={`uncertain-button ${type === '不确定' ? 'selected' : ''}`} onClick={() => { setType('不确定'); setTypeName('不确定'); if (quick) return; setStep('feel') }}><HelpCircle size={17} /> {tx("不确定")}</button><button className={`safety-entry ${warningSigns.length ? 'selected' : ''}`} onClick={() => { setShowSafety(true); setStep('sensation') }}><span className="safety-disclosure-icon"><AlertTriangle size={17} /></span><span><strong>{tx("有血、黑便或明显不适？")}</strong></span><ChevronRight size={16} /></button>{quick && <><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存排便')} onClick={finish} disabled={!type} /><button className="text-button center" onClick={() => setStep('feel')} disabled={!type}>{tx("添加更多细节")} <ArrowRight size={14} /></button></>}{!quick && <button className="text-button center" onClick={() => setShowExamples(!showExamples)}>{tx("查看详细示例")} <ChevronDown size={15} /></button>}{showExamples && <div className="example-note">{tx("选择最接近的一项。")}</div>}</FlowShell>
  if (step === 'feel') return <FlowShell title={`Type ${type || '不确定'}`} eyebrow={`${tx('排便')} · ${tx(displayTypeName)}`} step="2" total="5" onBack={() => setStep('type')}><div className="selected-stool"><span className={`stool-shape shape-${type}`}>{type === '不确定' ? '?' : typeOptions.find((x) => x.n === type)?.icon}</span><div><strong>{type === '不确定' ? tx("不确定") : tx(displayTypeName)}</strong>{type !== '不确定' && <span>{tx(typeOptions.find((x) => x.n === type)?.desc || '')}</span>}</div></div><h3>{tx("这次排便感觉怎么样？")}</h3><div className="feeling-grid">{['很轻松', '正常', '有点困难', '很困难'].map((option, index) => <button className={feeling === option ? 'selected' : ''} key={option} onClick={() => setFeeling(option)}><span>{['☺', '●', '◐', '×'][index]}</span>{tx(option)}</button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => setStep('sensation')} disabled={!feeling} /></FlowShell>
  if (step === 'sensation') return <FlowShell title={tx("有没有其他感觉？")} eyebrow={tx("排便 · 身体反馈")} step="3" total="5" onBack={() => setStep('feel')}><div className="check-grid">{['腹胀', '腹痛', '恶心', '很急', '没有', '其他'].map((option) => <button className={sensations.includes(option) ? 'selected' : ''} key={option} onClick={() => toggleSense(option)}><span className="check-box">{sensations.includes(option) && <Check size={13} />}</span>{tx(option)}</button>)}</div><div className={`safety-check ${warningSigns.length ? 'has-warning' : ''}`}><button className="safety-disclosure" onClick={() => setShowSafety((open) => !open)}><span className="safety-disclosure-icon"><AlertTriangle size={17} /></span><span><strong>{tx("明显不适")}</strong></span><ChevronDown size={16} className={showSafety ? 'rotated' : ''} /></button>{showSafety && <div className="safety-panel"><div className="safety-option-grid">{warningOptions.map((option) => <button className={warningSigns.includes(option) ? 'selected' : ''} key={option} onClick={() => toggleWarning(option)}><span className="check-box">{warningSigns.includes(option) && <Check size={13} />}</span>{tx(option)}</button>)}</div>{warningSigns.length > 0 && <div className={`safety-notice ${emergencyWarning ? 'urgent' : ''}`} role="alert"><AlertTriangle size={17} /><div><strong>{emergencyWarning ? tx("需要尽快获得医疗帮助") : stoolWarning ? tx("建议尽快联系医生评估") : tx("建议留意变化")}</strong><span>{emergencyWarning ? tx("如果正在大量出血、黑便伴头晕或剧烈腹痛，请立即联系当地急救服务。欧盟通用急救号码是 112。") : stoolWarning ? tx("黑便或血便需要专业评估；如果再次出现、持续存在，或伴随其他不适，请尽快联系医生。") : tx("如果症状持续、加重或让你感到不安，请联系医生或当地医疗咨询服务。")}</span>{emergencyWarning && <a href="tel:112" className="safety-call">{tx("联系 112")}</a>}</div></div>}</div>}</div><PrimaryFooter label={tx("继续")} onClick={nextAfterSensation} disabled={!sensations.length && !warningSigns.length} /></FlowShell>
  if (step === 'pain') return <FlowShell title={tx("腹痛详情")} eyebrow={tx("排便 · 其他感觉")} step="4" total="5" onBack={() => setStep('sensation')}><Field label={`${tx('疼痛程度')} · ${painLevel}`}><input className="range-input" type="range" min="0" max="10" value={painLevel} onChange={(e) => setPainLevel(Number(e.target.value))} /></Field><div className="range-labels"><span>{tx("没有")}</span><span>{tx("最痛")}</span></div><Field label={tx("疼痛位置")}><div className="location-grid">{['左上', '右上', '中间', '左下', '右下', '整个腹部'].map((option) => <button className={painLocation === option ? 'selected' : ''} key={option} onClick={() => setPainLocation(option)}>{tx(option)}</button>)}</div></Field><PrimaryFooter label={tx("继续")} onClick={nextAfterPain} /></FlowShell>
  if (step === 'bloating') return <FlowShell title={tx("腹胀程度")} eyebrow={tx("排便 · 其他感觉")} step="4" total="5" onBack={() => setStep('sensation')}><div className="severity-options">{['轻微', '中等', '严重'].map((option, i) => <button className={bloating === option ? 'selected' : ''} key={option} onClick={() => setBloating(option)}><span>{['☺', '◐', '×'][i]}</span><strong>{tx(option)}</strong></button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => sensations.includes('很急') ? setStep('urgent') : setStep('time')} /></FlowShell>
  if (step === 'urgent') return <FlowShell title={tx("紧急程度")} eyebrow={tx("排便 · 其他感觉")} step="4" total="5" onBack={() => setStep('sensation')}><div className="severity-options">{['有一点急', '很急', '差点来不及'].map((option, i) => <button className={urgent === option ? 'selected' : ''} key={option} onClick={() => setUrgent(option)}><span>{['☺', '◐', '×'][i]}</span><strong>{tx(option)}</strong></button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => setStep('time')} /></FlowShell>
  return <FlowShell title={tx("什么时候发生的？")} eyebrow={tx("排便 · 保存")} step="5" total="5" onBack={() => setStep(sensations.includes('腹痛') ? 'pain' : 'sensation')}><Field label={tx("时间")}><div className="time-input"><Clock3 size={17} /><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div></Field><button className="secondary-button wide" onClick={() => setTime(new Date().toTimeString().slice(0, 5))}><Clock3 size={16} /> {tx("使用当前时间")}</button><PrimaryFooter label={tx("保存排便记录")} onClick={finish} /></FlowShell>
}

function SafetySignals({ options, warningSigns, showSafety, onToggleOpen, onToggle, emergencyWarning }: { options: string[]; warningSigns: string[]; showSafety: boolean; onToggleOpen: () => void; onToggle: (option: string) => void; emergencyWarning: boolean }) {
  return <div className={`safety-check ${warningSigns.length ? 'has-warning' : ''}`}><button className="safety-disclosure" onClick={onToggleOpen}><span className="safety-disclosure-icon"><AlertTriangle size={17} /></span><span><strong>{tx("明显不适")}</strong></span><ChevronDown size={16} className={showSafety ? 'rotated' : ''} /></button>{showSafety && <div className="safety-panel"><div className="safety-option-grid">{options.map((option) => <button className={warningSigns.includes(option) ? 'selected' : ''} key={option} onClick={() => onToggle(option)}><span className="check-box">{warningSigns.includes(option) && <Check size={13} />}</span>{tx(option)}</button>)}</div>{warningSigns.length > 0 && <div className={`safety-notice ${emergencyWarning ? 'urgent' : ''}`} role="alert"><AlertTriangle size={17} /><div><strong>{emergencyWarning ? tx("需要尽快获得医疗帮助") : tx("建议尽快联系医生评估")}</strong><span>{emergencyWarning ? tx("如果呼吸困难、胸痛、正在大量出血、快要晕倒或剧烈疼痛，请立即联系当地急救服务。欧盟通用急救号码是 112。") : tx("如果症状持续、加重或伴随新的不适，请联系医生或当地医疗咨询服务。")}</span>{emergencyWarning && <a href="tel:112" className="safety-call">{tx("联系 112")}</a>}</div></div>}</div>}</div>
}

function SafetyStopScreen({ warningSigns, emergencyWarning, onBack }: { warningSigns: string[]; emergencyWarning: boolean; onBack: () => void }) {
  return <div className="safety-stop-screen" role="alert"><div className="safety-stop-icon"><AlertTriangle size={31} /></div><span className="eyebrow">{tx("安全提示")}</span><h1>{tx("请先就医")}</h1><p>{tx("你标记了下面的情况：")}</p><div className="safety-stop-signals">{warningSigns.map((warning) => <span key={warning}>{tx(warning)}</span>)}</div><div className="safety-stop-copy">{emergencyWarning ? <><strong>{tx("需要立即就医")}</strong><span>{tx("黑便或明显出血。若同时头晕、快要晕倒、呼吸困难、胸痛或剧烈疼痛，请拨打 112。")}</span></> : <><strong>{tx("请尽快联系医生")}</strong><span>{tx("联系医生或当地医疗服务。")}</span></>}</div>{emergencyWarning && <a href="tel:112" className="safety-stop-call"><PhoneCall size={16} /> {tx("联系 112")}</a>}<p className="safety-stop-note">{tx("这条记录不会保存。Poop Diary 不提供诊断。")}</p><button className="secondary-button wide safety-stop-back" onClick={onBack}>{tx("返回修改")}</button></div>
}

function SymptomFlow({ onSave, editEntry }: { onSave: EntryWriter; editEntry?: Entry }) {
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const locationState = routeLocation.state as { symptom?: string; severity?: string } | null
  const detailsMode = new URLSearchParams(routeLocation.search).get('details') === '1'
  const details = editEntry?.details || {}
  const isEditing = Boolean(editEntry)
  const selectedStructured = readSymptomRecords(details.symptoms).find((item) => item.name === locationState?.symptom)
  const initialSeverity = selectedStructured ? symptomSeverityLabels[symptomSeverityLevel(selectedStructured.severity)] : typeof details.severity === 'number' ? (['', '轻微', '中等', '严重'][details.severity] || '轻微') : String(details.severity || locationState?.severity || '轻微')
  const [symptom, setSymptom] = useState(String(detailsMode && locationState?.symptom ? locationState.symptom : details.symptom || locationState?.symptom || editEntry?.title || ''))
  const [step, setStep] = useState<'select' | 'detail' | 'painLocation' | 'save'>(editEntry && !detailsMode ? 'select' : locationState?.symptom ? 'detail' : 'select')
  const [severity, setSeverity] = useState(initialSeverity)
  const [onset, setOnset] = useState(String(details.onset || '刚刚'))
  const [duration, setDuration] = useState(String(details.duration || '<30分钟'))
  const [pain, setPain] = useState(Number(details.painLevel || 4))
  const [location, setLocation] = useState(String(details.location || '中间'))
  const [vomit, setVomit] = useState(String(details.vomit || '否'))
  const [time, setTime] = useState(editEntry?.time || currentTime())
  const [warningSigns, setWarningSigns] = useState<string[]>(Array.isArray(details.warningSigns) ? details.warningSigns.map(String) : [])
  const [showSafety, setShowSafety] = useState(() => Boolean(Array.isArray(details.warningSigns) && details.warningSigns.length))
  const options: { name: string; icon: Icon; color: string }[] = [{ name: '没什么', icon: Activity, color: 'muted' }, { name: '腹胀', icon: CircleDot, color: 'sage' }, { name: '腹痛', icon: HeartPulse, color: 'rose' }, { name: '恶心', icon: Activity, color: 'amber' }, { name: '胃灼热', icon: Flame, color: 'clay' }, { name: '放屁增多', icon: WindIcon, color: 'sky' }, { name: '便意频繁', icon: CircleDot, color: 'indigo' }, { name: '其他', icon: MoreHorizontal, color: 'muted' }]
  const warningOptions = ['呼吸困难或胸痛', '剧烈或加重的疼痛', '头晕或快要晕倒', '持续呕吐或无法喝水', '高热或明显虚弱', '大量出血或黑便']
  const emergencyWarning = warningSigns.some((item) => ['呼吸困难或胸痛', '剧烈或加重的疼痛', '头晕或快要晕倒', '大量出血或黑便'].includes(item))
  const setKind = (name: string) => { setSymptom(name); setStep(name === '没什么' ? 'save' : 'detail') }
  const toggleWarning = (warning: string) => setWarningSigns((current) => current.includes(warning) ? current.filter((item) => item !== warning) : [...current, warning])
  const finish = () => {
    const existing = readSymptomRecords(details.symptoms).length
      ? readSymptomRecords(details.symptoms)
      : quickSymptoms.filter((name) => String(details.symptom || '').includes(name)).map((name) => ({ name, severity: symptomSeverityLevel(details.severity) }))
    const symptoms = existing.length
      ? existing.map((item) => item.name === symptom ? { name: item.name, severity: symptomSeverityLevel(severity) } : item)
      : symptom === '没什么' ? [] : [{ name: symptom, severity: symptomSeverityLevel(severity) }]
    const symptomSummary = symptoms.map((item) => `${item.name} · ${symptomSeverityLabels[symptomSeverityLevel(item.severity)]}`).join(' · ')
    const summary = symptoms.length > 1 ? `${symptomSummary} · ${onset} · ${duration}` : symptom === '腹痛' ? `${pain}/10 · ${location} · ${duration}` : `${severity} · ${onset} · ${duration}`
    const warningSummary = warningSigns.length ? ' · 已记录异常信号' : ''
    onSave({ kind: 'symptom', time, title: existing.length > 1 ? symptoms.map((item) => item.name).join('、') : symptom, summary: `${summary}${warningSummary}`, details: { ...(isEditing ? editEntry?.details : {}), symptom: existing.length > 1 ? symptoms.map((item) => item.name).join('、') : symptom, symptoms, severity, onset, duration, painLevel: pain, location, vomit, warningSigns } }); navigate(isEditing ? '/diary' : '/')
  }
  if (warningSigns.length) return <SafetyStopScreen warningSigns={warningSigns} emergencyWarning={emergencyWarning} onBack={() => { setWarningSigns([]); setShowSafety(false) }} />
  if (step === 'select') return <FlowShell title={tx("你现在感觉怎么样？")} eyebrow={`${tx('身体感觉')} · ${isEditing ? tx('编辑记录') : tx('快速记录')}`} step="1" total="3" onBack={() => navigate(isEditing ? '/diary' : '/')}><SafetySignals options={warningOptions} warningSigns={warningSigns} showSafety={showSafety} onToggleOpen={() => setShowSafety((open) => !open)} onToggle={toggleWarning} emergencyWarning={emergencyWarning} /><div className="symptom-grid">{options.map(({ name, icon: IconComp, color }) => <button className={`symptom-option ${symptom === name ? 'selected' : ''}`} key={name} onClick={() => setKind(name)}><span className={`choice-icon ${color}`}><IconComp size={21} /></span><strong>{tx(name)}</strong>{symptom === name ? <Check size={16} /> : <ChevronRight size={16} />}</button>)}</div></FlowShell>
  if (step === 'detail') return <FlowShell title={tx(symptom)} eyebrow={tx("身体感觉 · 详细记录")} step="2" total="3" onBack={() => setStep('select')}><div className="detail-stack">{symptom === '腹痛' ? <><Field label={`${tx('疼痛程度')} · ${pain}`}><input className="range-input" type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} /></Field><button className="choice-tile compact-tile" onClick={() => setStep('painLocation')}><span className="choice-icon rose"><HeartPulse size={20} /></span><span className="choice-copy"><strong>{tx("疼痛位置")}</strong><small>{tx(location)}</small></span><ChevronRight size={16} /></button></> : symptom === '恶心' ? <><Field label={tx("恶心程度")}><PillSelect options={['轻微', '中等', '严重']} value={severity} onChange={setSeverity} /></Field><Field label={tx("是否呕吐？")}><PillSelect options={['是', '否']} value={vomit} onChange={setVomit} /></Field></> : <Field label={tx("程度")}><PillSelect options={['轻微', '中等', '严重']} value={severity} onChange={setSeverity} /></Field>}<Field label={tx("什么时候开始？")}><PillSelect options={['刚刚', '1小时前', '今天早些时候', '不知道']} value={onset} onChange={setOnset} /></Field><Field label={tx("持续多久？")}><PillSelect options={['<30分钟', '30分钟-1小时', '1-3小时', '3小时以上', '不知道']} value={duration} onChange={setDuration} /></Field></div><PrimaryFooter label={tx("继续")} onClick={() => setStep('save')} /></FlowShell>
  if (step === 'painLocation') return <FlowShell title={tx("疼痛位置")} eyebrow={tx("身体感觉 · 腹痛")} step="2" total="3" onBack={() => setStep('detail')}><div className="location-grid large">{['左上', '右上', '中间', '左下', '右下', '整个腹部'].map((option) => <button className={location === option ? 'selected' : ''} key={option} onClick={() => setLocation(option)}>{tx(option)}</button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => setStep('save')} /></FlowShell>
  return <FlowShell title={isEditing ? tx('编辑身体感觉') : tx('准备保存')} eyebrow={tx("身体感觉 · 完成")} step="3" total="3" onBack={() => setStep('detail')}><div className="save-preview"><span className="choice-icon rose"><Activity size={21} /></span><div><strong>{tx(symptom)}</strong><span>{symptom === '腹痛' ? `${pain}/10 · ${tx(location)}` : tx(severity)}</span><small>{tx(onset)} · {tx(duration)}</small></div></div><Field label={tx("时间")}><div className="time-input"><Clock3 size={17} /><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></div></Field><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存身体感觉')} onClick={finish} /></FlowShell>
}
const WindIcon = ({ size = 20 }: { size?: number }) => <span style={{ fontSize: size * 0.9, lineHeight: 1 }}>≈</span>

function WaterFlow({ onSave, editEntry, entries }: { onSave: EntryWriter; editEntry?: Entry; entries: Entry[] }) {
  const navigate = useNavigate()
  const isEditing = Boolean(editEntry)
  const [amount, setAmount] = useState(() => {
    if (editEntry) return Number(editEntry.details.amount || 250)
    const saved = Number(localStorage.getItem('gutlog-water-last-amount'))
    return saved >= 100 && saved <= 1000 ? saved : 250
  })
  const [beverage, setBeverage] = useState(String(editEntry?.details.beverage || '水'))
  const [customDrinks, setCustomDrinks] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('gutlog-water-drinks') || '[]')
      return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === 'string') : []
    } catch { return [] }
  })
  const [showMore, setShowMore] = useState(() => Boolean(editEntry && !['水', '咖啡', '茶', '软饮'].includes(String(editEntry.details.beverage || '水'))))
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const todayTotal = entries.filter((entry) => entry.date === TODAY && entry.kind === 'water').reduce((sum, entry) => sum + Number(entry.details.amount || 0), 0)
  const progress = Math.min(100, Math.round((todayTotal / 2000) * 100))
  const commonDrinks = ['水', '咖啡', '茶', '软饮']
  const moreDrinks = Array.from(new Set(['果汁', '牛奶', '酒精', ...customDrinks, beverage].filter((name) => !commonDrinks.includes(name))))
  const drinkTone = (name: string) => name === '水' ? 'water' : name === '咖啡' ? 'coffee' : name === '茶' ? 'tea' : name === '软饮' ? 'soda' : name === '果汁' ? 'juice' : name === '牛奶' ? 'milk' : name === '酒精' ? 'alcohol' : 'custom'
  const drinkIcon = (name: string) => name === '水' ? <Droplets size={17} /> : name === '咖啡' ? <Coffee size={17} /> : name === '茶' ? <Leaf size={17} /> : name === '酒精' ? <CircleDot size={17} /> : name === '软饮' ? <Zap size={17} /> : name === '牛奶' ? <CircleDot size={17} /> : <Activity size={17} />
  const addCustomDrink = () => {
    const value = customName.trim()
    if (!value) return
    const next = Array.from(new Set([...customDrinks, value])).slice(-6)
    setCustomDrinks(next)
    localStorage.setItem('gutlog-water-drinks', JSON.stringify(next))
    setBeverage(value)
    setCustomName('')
    setShowCustom(false)
    setShowMore(true)
  }
  const finish = () => {
    localStorage.setItem('gutlog-water-last-amount', String(amount))
    onSave({ kind: 'water', time: editEntry?.time || new Date().toTimeString().slice(0, 5), title: '饮水', summary: `${amount} ml · ${beverage}`, details: { ...(editEntry ? editEntry.details : {}), amount, beverage, source: 'single-screen' } })
    navigate(isEditing ? '/diary' : '/')
  }
  return <FlowShell title={isEditing ? tx('编辑这杯饮品') : tx('加一杯饮品')} eyebrow={tx("+ 饮水 · 单页记录")} step="1" hideProgress onBack={() => navigate(isEditing ? '/diary' : '/')}><div className="water-context"><div><span>{tx("今天已记录")}</span><strong>{todayTotal} <small>/ 2000 ml</small></strong></div><b>{progress}%</b><div className="water-context-track"><i style={{ width: `${progress}%` }} /></div></div><section className="water-section"><div className="water-section-heading"><span className="eyebrow">{tx("饮品")}</span><span>{tx("默认选择水")}</span></div><div className="drink-chip-row">{commonDrinks.map((name) => <button key={name} className={`${beverage === name ? 'selected ' : ''}drink-${drinkTone(name)}`} aria-pressed={beverage === name} onClick={() => setBeverage(name)}><span className={`drink-chip-icon ${drinkTone(name)}`} aria-hidden="true">{drinkIcon(name)}</span>{tx(name)}{beverage === name && <Check size={14} className="drink-selected-check" aria-hidden="true" />}</button>)}</div>{showMore && <div className="drink-chip-row more">{moreDrinks.map((name) => <button key={name} className={`${beverage === name ? 'selected ' : ''}drink-${drinkTone(name)}`} aria-pressed={beverage === name} onClick={() => setBeverage(name)}><span className={`drink-chip-icon ${drinkTone(name)}`} aria-hidden="true">{drinkIcon(name)}</span>{tx(name)}{beverage === name && <Check size={14} className="drink-selected-check" aria-hidden="true" />}</button>)}{!showCustom && <button className="custom-drink-trigger" onClick={() => setShowCustom(true)}><Plus size={16} /> {tx("自定义饮品")}</button>}</div>}<button className="text-button water-more-toggle" onClick={() => setShowMore((open) => !open)}>{showMore ? tx("收起饮品") : tx("更多饮品")} <ChevronDown size={15} className={showMore ? 'rotate-180' : ''} /></button>{showCustom && <div className="custom-drink-inline"><input autoFocus value={customName} onChange={(event) => setCustomName(event.target.value)} placeholder={tx("输入饮品名称")} onKeyDown={(event) => { if (event.key === 'Enter') addCustomDrink() }} /><button className="secondary-button small" onClick={() => { setShowCustom(false); setCustomName('') }}>{tx("取消")}</button><button className="primary-button small" onClick={addCustomDrink} disabled={!customName.trim()}>{tx("添加")}</button></div>}</section><section className="water-section amount-section"><div className="water-section-heading"><span className="eyebrow">{tx("容量")}</span><strong>{amount} <small>ml</small></strong></div><input className="water-slider" aria-label={tx("饮品容量")} type="range" min="100" max="1000" step="50" value={amount} onChange={(event) => setAmount(Number(event.target.value))} /><div className="water-slider-scale"><span>100 ml</span><span>500 ml</span><span>1000 ml</span></div><div className="water-amount-presets">{[250, 350, 500, 750].map((value) => <button className={amount === value ? 'selected' : ''} key={value} onClick={() => setAmount(value)}>{value} ml</button>)}</div></section><PrimaryFooter label={isEditing ? tx('保存修改') : `${tx('添加')} ${amount} ml ${tx(beverage)}`} onClick={finish} /></FlowShell>
}

function ExerciseFlow({ onSave, editEntry }: { onSave: EntryWriter; editEntry?: Entry }) {
  const navigate = useNavigate()
  const isEditing = Boolean(editEntry)
  const details = editEntry?.details || {}
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [exercise, setExercise] = useState(String(details.exercise || editEntry?.title || ''))
  const [minutes, setMinutes] = useState(String(details.minutes || '30'))
  const [distance, setDistance] = useState(String(details.distance || '4.2'))
  const [steps, setSteps] = useState(String(details.steps || '5200'))
  const [intensity, setIntensity] = useState(String(details.intensity || '中等'))
  const [exerciseType, setExerciseType] = useState(String(details.exerciseType || '全身'))
  const options: { name: string; icon: Icon; color: string }[] = [{ name: '步行', icon: Footprints, color: 'sage' }, { name: '跑步', icon: Activity, color: 'rose' }, { name: '骑车', icon: Zap, color: 'sky' }, { name: '力量训练', icon: Dumbbell, color: 'amber' }, { name: '瑜伽', icon: Leaf, color: 'indigo' }, { name: '游泳', icon: Droplets, color: 'sky' }, { name: '球类', icon: CircleDot, color: 'clay' }, { name: '其他', icon: MoreHorizontal, color: 'muted' }]
  const finish = () => {
    const title = exercise
    const summary = exercise === '跑步' ? `${minutes} 分钟 · ${distance} km · ${intensity}` : exercise === '步行' ? `${minutes} 分钟 · ${steps} 步 · ${distance} km` : `${minutes} 分钟 · ${intensity}`
    onSave({
      kind: 'exercise',
      time: editEntry?.time || new Date().toTimeString().slice(0, 5),
      title,
      summary,
      details: {
        ...(editEntry ? editEntry.details : {}),
        minutes,
        intensity,
        exerciseType: ['力量训练', '其他'].includes(exercise) ? exerciseType : undefined,
        distance: ['跑步', '步行'].includes(exercise) ? distance : undefined,
        steps: exercise === '步行' ? steps : undefined,
        exercise,
      },
    })
    navigate(isEditing ? '/diary' : '/')
  }
  if (step === 'select') return <FlowShell title={tx("今天做了什么运动？")} eyebrow={`${tx('运动')} · ${isEditing ? tx('编辑记录') : tx('快速记录')}`} step="1" total="2" onBack={() => navigate(isEditing ? '/diary' : '/')}><div className="exercise-grid">{options.map(({ name, icon: IconComp, color }) => <button className={exercise === name ? 'selected' : ''} key={name} onClick={() => { setExercise(name); setStep('form') }}><span className={`choice-icon ${color}`}><IconComp size={21} /></span><strong>{tx(name)}</strong>{exercise === name ? <Check size={15} /> : <ChevronRight size={15} />}</button>)}</div></FlowShell>
  return <FlowShell title={tx(exercise)} eyebrow={`${tx('运动')} · ${isEditing ? tx('编辑记录') : tx('详细记录')}`} step="2" total="2" onBack={() => setStep('select')}><div className="exercise-form"><div className="form-grid">{exercise === '步行' ? <><Field label={tx("时间")}><Stepper value={Number(minutes) || 0} onChange={(value) => setMinutes(String(value))} min={0} max={600} step={5} suffix={tx("分钟")} /></Field><Field label={tx("步数")}><Stepper value={Number(steps) || 0} onChange={(value) => setSteps(String(value))} min={0} max={50000} step={500} suffix={tx("步")} /></Field><Field label={tx("距离")}><Stepper value={Number(distance) || 0} onChange={(value) => setDistance(String(value))} min={0} max={100} step={0.1} suffix="km" /></Field></> : exercise === '跑步' ? <><Field label={tx("时间")}><Stepper value={Number(minutes) || 0} onChange={(value) => setMinutes(String(value))} min={0} max={600} step={5} suffix={tx("分钟")} /></Field><Field label={tx("距离")}><Stepper value={Number(distance) || 0} onChange={(value) => setDistance(String(value))} min={0} max={100} step={0.1} suffix="km" /></Field></> : <><Field label={tx("时间")}><Stepper value={Number(minutes) || 0} onChange={(value) => setMinutes(String(value))} min={0} max={600} step={5} suffix={tx("分钟")} /></Field><Field label={tx("训练类型")}><PillSelect options={['全身', '上肢', '下肢', '核心']} value={exerciseType} onChange={setExerciseType} /></Field></>}</div><Field label={tx("强度")}><PillSelect options={['轻松', '中等', '很累']} value={intensity} onChange={setIntensity} /></Field></div><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存运动记录')} onClick={finish} /></FlowShell>
}

function SleepFlow({ onSave, editEntry }: { onSave: EntryWriter; editEntry?: Entry }) {
  const navigate = useNavigate()
  const isEditing = Boolean(editEntry)
  const details = editEntry?.details || {}
  const [step, setStep] = useState<'duration' | 'quality' | 'awake' | 'feeling'>('duration')
  const [sleepMinutes, setSleepMinutes] = useState(Number(details.durationMinutes || (Number(details.hours || 7) * 60 + Number(details.minutes || 30))))
  const [quality, setQuality] = useState(String(details.quality || '不错'))
  const [awakenings, setAwakenings] = useState(String(details.awakenings || '1'))
  const [wakingFeeling, setWakingFeeling] = useState(String(details.wakingFeeling || '精神不错'))
  const hours = Math.floor(sleepMinutes / 60)
  const minutes = sleepMinutes % 60
  const durationLabel = minutes ? `${hours}小时${minutes}分钟` : `${hours}小时`
  const finish = (withDetails = false) => { const includeDetails = withDetails || isEditing; onSave({ kind: 'sleep', time: editEntry?.time || '07:00', title: '睡眠', summary: includeDetails ? `${durationLabel} · ${quality}` : durationLabel, details: { ...(editEntry ? editEntry.details : {}), hours, minutes, durationMinutes: sleepMinutes, quality: includeDetails ? quality : '未记录', awakenings: includeDetails ? awakenings : '未记录', wakingFeeling: includeDetails ? wakingFeeling : '未记录', source: 'slider' } }); navigate(isEditing ? '/diary' : '/') }
  if (step === 'duration') return <FlowShell title={isEditing ? tx('编辑昨晚睡眠') : tx('昨晚睡了多久？')} eyebrow={tx("睡眠 · 快速记录")} step="1" hideProgress onBack={() => navigate(isEditing ? '/diary' : '/')}><div className="sleep-duration"><div className="sleep-time-display"><Moon size={22} /><strong>{durationLabel}</strong></div><p className="sleep-helper">{tx("拖动选择时长。")}</p><input className="sleep-slider" aria-label={tx("昨晚睡眠时长")} type="range" min="240" max="720" step="15" value={sleepMinutes} onChange={(event) => setSleepMinutes(Number(event.target.value))} /><div className="sleep-slider-scale"><span>{tx("4 小时")}</span><span>{tx("6 小时")}</span><span>{tx("8 小时")}</span><span>{tx("10 小时")}</span><span>{tx("12 小时")}</span></div></div><button className="secondary-button wide sleep-details-button" onClick={() => setStep('quality')}><SlidersHorizontal size={16} /> {tx("睡眠感受（可选）")}</button><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存睡眠')} onClick={() => finish()} /></FlowShell>
  if (step === 'quality') return <FlowShell title={tx("睡眠质量")} eyebrow={tx("睡眠 · 可选")} step="2" total="4" onBack={() => setStep('duration')}><div className="quality-options">{['很差', '一般', '不错', '很好'].map((option, index) => <button className={quality === option ? 'selected' : ''} key={option} onClick={() => setQuality(option)}><span>{[<Moon size={24} />, <Moon size={24} />, <Moon size={24} />, <Sparkles size={24} />][index]}</span><strong>{tx(option)}</strong></button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => setStep('awake')} /></FlowShell>
  if (step === 'awake') return <FlowShell title={tx("夜里醒来？")} eyebrow={tx("睡眠 · 第三步")} step="3" total="4" onBack={() => setStep('quality')}><div className="awake-options">{['0', '1', '2', '3+'].map((option) => <button className={awakenings === option ? 'selected' : ''} key={option} onClick={() => setAwakenings(option)}><strong>{option}</strong><span>{tx("次")}</span></button>)}</div><PrimaryFooter label={tx("继续")} onClick={() => setStep('feeling')} /></FlowShell>
  return <FlowShell title={tx("今天醒来感觉")} eyebrow={tx("睡眠 · 最后一步")} step="4" total="4" onBack={() => setStep('awake')}><div className="feeling-grid sleep-feeling">{['很累', '一般', '精神不错', '精力充沛'].map((option, i) => <button className={wakingFeeling === option ? 'selected' : ''} key={option} onClick={() => setWakingFeeling(option)}><span>{[<Activity size={21} />, <Moon size={21} />, <HeartPulse size={21} />, <Zap size={21} />][i]}</span>{tx(option)}</button>)}</div><div className="save-preview sleep-preview"><span className="choice-icon indigo"><Moon size={21} /></span><div><strong>{durationLabel}</strong><small>{tx(quality)} {tx("· 夜醒")} {awakenings} {tx("次")}</small></div></div><PrimaryFooter label={isEditing ? tx('保存修改') : tx('保存睡眠记录')} onClick={() => finish(true)} /></FlowShell>
}

import type en from './en';
export default {
  common: {
    appName: 'Poop Diary', today: '今天', diary: '日记', insights: '洞察', profile: '我的', log: '记录',
    bowel: '排便', food: '饮食', symptom: '身体感觉', water: '饮水', exercise: '运动', sleep: '睡眠',
    back: '返回', close: '关闭', cancel: '取消', save: '保存', edit: '编辑', delete: '删除', undo: '撤销',
    loading: '加载中…', retry: '重试', error: '操作失败，请重试。', saved: '已保存', updated: '已修改', deleted: '已删除', restored: '已恢复',
    startupError: '日记加载失败。', empty: '暂无记录', previousDay: '前一天', nextDay: '后一天',
    type: 'Type {{type}}', unknown: '不确定', time: '时间', date: '日期', notes: '备注', minutes: '分钟', hours: '小时', aiInsightsOn: 'AI 洞察已开启',
  },
  home: {
    title: '今天', quickLog: '记录排便', recent: '今天的记录',
    entryCount: '{{count}} 条记录', entryCount_other: '{{count}} 条记录', allEntries: '查看日记',
    empty: '今天还没有记录', bowelCount: '{{count}} 次排便', bowelCount_other: '{{count}} 次排便',
    quickTitle: '快速记录', overview: '今日概览', streak: '连续记录', days: '天', addFirst: '添加第一条',
    mealsLabel: '饮食', bowelLabel: '排便', symptomLabel: '身体感觉', exerciseLabel: '运动', sleepLabel: '睡眠', times: '次', entry: '条', lastNight: '昨晚', waterGoal: '/ 2000 ml',
    greetings: { night: '夜深了', morning: '早上好', noon: '中午好', afternoon: '下午好', evening: '晚上好' },
  },
  diary: {
    title: '日记', add: '添加记录', eyebrow: '记录你的身体状态', empty: '这天还没有记录', details: '记录详情',
    deleteTitle: '删除这条记录？', deleteError: '删除失败，请重试。',
    restoreError: '恢复失败，请重试。', missing: '记录不存在',
  },
  profile: {
    title: '我的', name: '姓名', language: '语言', appearance: '外观', tracking: '记录项目', aiAnalysis: '智能分析', reminders: '提醒', privacy: '数据与隐私', aiInsights: 'AI 洞察', dailyReminder: '每日提醒', weeklyReport: '每周报告', dailyTime: '每天 20:00', weeklyDay: '每周日', export: '导出我的数据', aiData: 'AI 数据设置', deleteData: '删除我的数据', editProfile: '编辑资料', saveProfile: '保存资料', more: '更多资料操作', food: '饮食', bowel: '排便', symptoms: '身体感觉', water: '饮水', exercise: '运动', sleep: '睡眠',
    light: '浅色', dark: '深色', system: '跟随系统', components: '组件预览',
    localData: '记录保存在当前设备。', settingsError: '设置保存失败。',
  },
  components: {
    title: '组件预览', buttons: '按钮', iconButtons: '图标按钮', choices: '选项', slider: '滑块', stepper: '步进器',
    sheet: '弹层', openSheet: '打开弹层', longText: '这是一项较长的选项文字，会完整换行显示',
    selected: '已选择', unselected: '未选择', loading: '保存中', disabled: '不可用',
    feedback: '反馈', showFeedback: '显示保存反馈', error: '保存失败', errorDetail: '草稿仍在。',
    amount: '数量', decrease: '减少', increase: '增加',
  },
  insights: {
    title: '洞察', subtitle: '记录趋势', range: '范围', stoolEyebrow: '排便形状', symptomsEyebrow: '身体感觉', days: '天', period: '过去 {{range}} 天', stoolTitle: '排便形状', symptomsTitle: '身体感觉', type: 'Type {{type}}', tapHint: '来自你的记录', week: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], bloating: '腹胀', pain: '腹痛', patternEyebrow: 'AI 模式 · 观察', aiOff: 'AI 洞察已关闭', patternTitle: '可能的模式', openAI: '去“我的”里开启 AI 洞察。', patternBody: '这段时间记录了 {{count}} 次腹胀。', noData: '继续记录后会看到趋势。', meals: '餐', collapse: '收起详情', why: '为什么看到这个？', related: '查看相关记录', disclaimer: '这是对记录的观察，不是诊断。', noRelated: '暂无相关记录。', consistency: '记录节奏', activeDays: '个活跃日', report: '查看 14 天报告',
  },
  report: {
    title: '你的两周记录', eyebrow: '两周记录', coverageLabel: '覆盖率', coverage: '覆盖率', backToInsights: '返回洞察', reviewed: '已查看 {{count}} 条记录', periodLegend: '偏硬 · 理想 · 偏稀', typeLabel: 'Type {{type}}', times: '次', entry: '条', meal: '餐', stoodOut: '重点记录', clearerPicture: '继续记录，趋势会更清晰。', coveragePercent: '覆盖率', ofDays: '/ 14 天', entries: '共 {{count}} 条记录', empty: '近 14 天暂无记录', bowel: '排便', symptoms: '身体感觉', food: '饮食', dairy: '乳制品餐', stool: '排便', stoolTitle: '排便形状', hard: '偏硬 · Type 1–2', ideal: '理想 · Type 3–4', loose: '偏稀 · Type 5–7', most: '最常见：Type {{type}}（{{count}} 次）', focus: '重点记录', focusTitle: '近期记录趋势', summary: '已有记录可以查看。', notEnough: '继续记录，趋势会更清晰。', aiOff: 'AI 洞察已关闭', aiDisabled: '去“我的”里开启 AI 洞察，查看记录观察。', disclaimerTitle: '这是记录摘要，不是诊断', disclaimer: '仅供记录参考，不代表医疗判断。',
  },
} satisfies typeof en;

import type en from './en';
export default {
  common: {
    appName: 'Poop Diary', today: '今天', diary: '日记', insights: '洞察', profile: '我的', log: '记录',
    bowel: '排便', food: '饮食', symptom: '身体感觉', water: '饮品', exercise: '运动', sleep: '睡眠',
    back: '返回', close: '关闭', cancel: '取消', save: '保存', edit: '编辑', delete: '删除', undo: '撤销',
    loading: '加载中…', retry: '重试', error: '操作失败，请重试。', saved: '已保存', updated: '已修改', deleted: '已删除', restored: '已恢复',
    startupError: '日记加载失败。', empty: '暂无记录', previousDay: '前一天', nextDay: '后一天',
    type: 'Type {{type}}', unknown: '不确定', time: '时间', date: '日期', notes: '备注',
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
    title: '日记', add: '添加记录', empty: '这天还没有记录', details: '记录详情',
    deleteTitle: '删除这条记录？', deleteError: '删除失败，请重试。',
    restoreError: '恢复失败，请重试。', missing: '记录不存在',
  },
  profile: {
    title: '我的', language: '语言', appearance: '外观',
    light: '浅色', dark: '深色', system: '跟随系统', components: '组件预览',
    localData: '记录保存在当前设备。', settingsError: '设置保存失败。',
  },
  components: {
    title: '组件预览', buttons: '按钮', choices: '选项', slider: '滑块', stepper: '步进器',
    sheet: '弹层', openSheet: '打开弹层', longText: '这是一项较长的选项文字，会完整换行显示',
    selected: '已选择', unselected: '未选择', loading: '保存中', disabled: '不可用',
    feedback: '反馈', showFeedback: '显示保存反馈', error: '保存失败', errorDetail: '草稿仍在。',
    amount: '数量', decrease: '减少', increase: '增加',
  },
} satisfies typeof en;

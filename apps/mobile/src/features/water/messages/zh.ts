export default {
  title: '饮品', addTitle: '添加饮品', editTitle: '编辑饮品', quickLabel: '快速记录',
  chooseDrink: '饮品', amount: '容量', capacity: '容量', todayTotal: '今天已记录', recordedToday: '今天已记录', goal: '/ 2000 ml',
  save: '添加 {{amount}} ml {{drink}}', saveChanges: '保存修改', saved: '已保存', updated: '已修改',
  loading: '加载饮品…', missing: '记录不存在', loadError: '饮品记录加载失败。', saveError: '保存失败，请重试。',
  custom: '自定义饮品', customPlaceholder: '输入饮品名称', addCustom: '添加', clearCustom: '取消',
  moreDrinks: '更多饮品', fewerDrinks: '收起饮品', defaultWater: '默认选择水',
  beverages: { water: '水', coffee: '咖啡', tea: '茶', soda: '软饮', juice: '果汁', milk: '牛奶', alcohol: '酒精', other: '其他' },
  presets: { '250': '250 ml', '350': '350 ml', '500': '500 ml', '750': '750 ml' },
  volume: '容量', min: '100 ml', mid: '500 ml', max: '1000 ml',
  back: '返回', close: '关闭', retry: '重试', edit: '编辑', delete: '删除',
} as const;

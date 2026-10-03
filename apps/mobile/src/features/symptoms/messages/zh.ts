export default {
  title: '现在感觉怎么样？', editTitle: '编辑身体感觉', selectLabel: '身体感觉', detailsLabel: '详细记录', saveLabel: '准备保存',
  saveEntry: '保存身体感觉', saveChanges: '保存修改', saved: '身体感觉已保存', updated: '修改已保存',
  loading: '正在读取…', missing: '记录不存在', loadError: '无法读取记录', saveError: '保存失败，请重试', retry: '重试', back: '返回', close: '关闭', continue: '继续', when: '时间', now: '现在', fiveAgo: '5 分钟前', thirtyAgo: '30 分钟前', done: '完成',
  addDetails: '添加持续时间等细节', noSymptoms: '我感觉很好', severity: '程度', painLevel: '疼痛程度', painLocation: '疼痛位置', vomiting: '是否呕吐？', yes: '是', no: '否', onset: '什么时候开始？', duration: '持续多久？', note: '备注', notePlaceholder: '选填',
  onsetOptions: { now: '刚刚', hourAgo: '1 小时前', earlier: '今天早些时候', unknown: '不知道' }, durationOptions: { under30: '<30 分钟', thirtyTo60: '30 分钟–1 小时', oneTo3: '1–3 小时', over3: '3 小时以上', unknown: '不知道' },
  symptoms: { bloating: '腹胀', pain: '腹痛', nausea: '恶心', heartburn: '胃灼热', gas: '放屁增多', frequency: '便意频繁', other: '其他' }, severities: { mild: '轻微', moderate: '中等', severe: '严重' },
  locations: { leftUpper: '左上', rightUpper: '右上', middle: '中间', leftLower: '左下', rightLower: '右下', whole: '整个腹部' },
  warning: { button: '有明显不适', title: '请先就医', modify: '返回修改', call: '联系 112', callError: '无法打开电话，请直接拨打 112。', note: '这条记录不会保存。Poop Diary 不提供诊断。', urgent: '需要立即就医', soon: '请尽快联系医生', urgentCopy: '如果剧烈疼痛、黑便、明显出血、头晕或胸痛，请拨打 112。', soonCopy: '联系医生或当地医疗服务。', signs: { breathingOrChestPain: '呼吸困难或胸痛', severeOrWorseningPain: '剧烈或加重的疼痛', dizzyOrFaint: '头晕或快要晕倒', persistentVomiting: '持续呕吐或无法喝水', highFever: '高热或明显虚弱', heavyBleedingOrBlackStool: '大量出血或黑便' } },
} as const;

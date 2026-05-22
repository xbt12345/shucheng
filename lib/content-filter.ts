const BLOCKED_KEYWORDS = [
  '代理', '机场', '翻墙', '博彩', '赌博', '色情',
  '诈骗', '传销', '炸弹', '制毒',
]

type FilterResult = { clean: true; reason: null } | { clean: false; reason: string }

export function filterContent(content: string): FilterResult {
  if (!content.trim()) return { clean: false, reason: '内容不能为空' }
  if (content.length > 2000) return { clean: false, reason: '内容不能超过 2000 字' }

  const lowerContent = content.toLowerCase()
  for (const keyword of BLOCKED_KEYWORDS) {
    if (lowerContent.includes(keyword)) {
      return { clean: false, reason: `内容包含不允许的词语` }
    }
  }

  return { clean: true, reason: null }
}

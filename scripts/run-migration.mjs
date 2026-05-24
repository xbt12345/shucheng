// 直接用 fetch 调用 Supabase REST API，无需 Supabase JS SDK
const SUPABASE_URL = 'https://svtgagrunycvxgyckydm.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2dGdhZ3J1bnljdnhneWNreWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTQwMDY5NywiZXhwIjoyMDk0OTc2Njk3fQ.lsSrrGIFFO6q456r7FZfjYDB8LCKqRlktnSoh8rYm9U'

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

async function update(title, patch) {
  const url = `${SUPABASE_URL}/rest/v1/books?title=eq.${encodeURIComponent(title)}`
  const res = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(patch) })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`  ✗ 更新 ${title}: ${res.status} ${txt}`)
    return false
  }
  console.log(`  ✓ 更新 ${title}`)
  return true
}

async function exists(title) {
  const url = `${SUPABASE_URL}/rest/v1/books?title=eq.${encodeURIComponent(title)}&select=id`
  const res = await fetch(url, { headers: { ...headers, 'Prefer': 'count=exact' } })
  const data = await res.json()
  return Array.isArray(data) && data.length > 0
}

async function insert(book) {
  const url = `${SUPABASE_URL}/rest/v1/books`
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(book) })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`  ✗ 插入 ${book.title}: ${res.status} ${txt}`)
    return false
  }
  console.log(`  ✓ 插入 ${book.title}`)
  return true
}

async function main() {
  console.log('=== 书目丰富化迁移 ===\n')

  // ── 一、更新现有书籍封面 + 文件链接 ──
  console.log('── 更新封面/文件链接 ──')
  const updates = [
    { title: '论语', cover_url: 'https://covers.openlibrary.org/b/id/727362-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/23839.epub.noimages' },
    { title: '孟子', cover_url: 'https://covers.openlibrary.org/b/id/934762-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/4094.epub.noimages' },
    { title: '道德经', cover_url: 'https://covers.openlibrary.org/b/id/662232-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/7337.epub.noimages' },
    { title: '庄子', cover_url: 'https://covers.openlibrary.org/b/id/626992-L.jpg' },
    { title: '孙子兵法', cover_url: 'https://covers.openlibrary.org/b/id/4849549-L.jpg' },
    { title: '易经', cover_url: 'https://covers.openlibrary.org/b/id/7135261-L.jpg' },
    { title: '理想国', cover_url: 'https://covers.openlibrary.org/b/id/14418448-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/1497.epub.images' },
    { title: '沉思录', cover_url: 'https://covers.openlibrary.org/b/id/13202688-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/2680.epub.images' },
    { title: '尼各马可伦理学', cover_url: 'https://covers.openlibrary.org/b/id/12593945-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/8438.epub.images' },
    { title: '荷马史诗·伊利亚特', cover_url: 'https://covers.openlibrary.org/b/id/7083790-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/6130.epub.images' },
    { title: '奥德赛', cover_url: 'https://covers.openlibrary.org/b/id/9045853-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/1727.epub.images' },
    { title: '薄伽梵歌', cover_url: 'https://covers.openlibrary.org/b/id/11157767-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/2388.epub.images' },
    { title: '奥义书', cover_url: 'https://covers.openlibrary.org/b/id/1803926-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/3283.epub.images' },
    { title: '古兰经', cover_url: 'https://covers.openlibrary.org/b/id/717634-L.jpg' },
    { title: '神曲', cover_url: 'https://covers.openlibrary.org/b/id/6387077-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/8800.epub.images' },
    { title: '金刚经', file_url: 'https://www.gutenberg.org/ebooks/64623.epub.noimages' },
    { title: '唐诗三百首', file_url: 'https://www.gutenberg.org/ebooks/20968.epub.noimages' },
    { title: '哈姆雷特', cover_url: 'https://covers.openlibrary.org/b/id/8779054-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/1513.epub.images' },
    { title: '浮士德', file_url: 'https://www.gutenberg.org/ebooks/5827.epub.images' },
    { title: '查拉图斯特拉如是说', cover_url: 'https://covers.openlibrary.org/b/id/8915879-L.jpg' },
    { title: '战争与和平', cover_url: 'https://covers.openlibrary.org/b/id/9267378-L.jpg' },
    { title: '百年孤独', cover_url: 'https://covers.openlibrary.org/b/id/8781867-L.jpg' },
  ]

  for (const { title, ...patch } of updates) {
    await update(title, patch)
  }

  // ── 二、新增书目 ──
  console.log('\n── 插入新书目 ──')
  const newBooks = [
    { title: '尚书', author: '孔子整理', category: '儒', description: '又称《书经》，中国最古老的历史文献集，记载尧舜禹至周代政治史料。五经之一，儒家政治思想的重要源泉。', cover_url: 'https://covers.openlibrary.org/b/id/10520540-L.jpg' },
    { title: '近思录', author: '朱熹、吕祖谦', category: '儒', description: '南宋朱熹与吕祖谦合编，从周敦颐、程颢、程颐、张载四子著作中精选622条，涵盖修身、治国、读书等道理，程朱理学入门经典。', cover_url: 'https://covers.openlibrary.org/b/id/9316194-L.jpg' },
    { title: '小学', author: '朱熹、刘清之', category: '儒', description: '南宋朱熹等编纂的启蒙读物，收集先秦两汉圣贤关于洒扫应对进退之节、修身处世之道的论述，儒家儿童启蒙经典。' },
    { title: '黄帝内经', author: '托名黄帝', category: '道', description: '中国现存最早的医学典籍，以阴阳五行为框架，论天人合一、生命哲学。《素问》《灵枢》两部，对中国医学、哲学影响深远。', cover_url: 'https://covers.openlibrary.org/b/id/10527498-L.jpg' },
    { title: '抱朴子', author: '葛洪', category: '道', description: '东晋葛洪著，内篇论道教炼养之术，外篇论儒家治世之道，是道家神仙方术与儒家伦理融合的重要文献。' },
    { title: '楞伽经', author: '求那跋陀罗译', category: '释', description: '禅宗重要典籍，以"识心见性"为核心，强调"自内证"的悟道方式。禅宗初祖达摩以此经印心，对禅宗影响极深。' },
    { title: '圆觉经', author: '佛陀波利译', category: '释', description: '完整名称《大方广圆觉修多罗了义经》，论圆觉性海与修行方法，文字优美，思想深邃，禅净密三宗共同重视。' },
    { title: '百喻经', author: '伽斯那作，求那毗地译', category: '释', description: '以98则寓言故事阐述佛教义理，故事生动有趣，被称为"佛教寓言集"，是佛教入门的理想读本。', cover_url: 'https://covers.openlibrary.org/b/id/9197478-L.jpg' },
    { title: '三国志', author: '陈寿', category: '史', description: '西晋陈寿撰，记载三国时期历史的纪传体史书，与《史记》《汉书》《后汉书》并称"前四史"。', cover_url: 'https://covers.openlibrary.org/b/id/12741597-L.jpg' },
    { title: '贞观政要', author: '吴兢', category: '史', description: '唐代吴兢著，记录唐太宗与魏征等大臣的政治言论和治国实践，中国古代最重要的政治学著作之一，历代帝王必读。' },
    { title: '宋词三百首', author: '唐圭璋选编', category: '集', description: '收录宋代词人80余家300余首词作，包括苏轼、李清照、辛弃疾等大家名作，是宋词最权威的选本之一。', cover_url: 'https://covers.openlibrary.org/b/id/9302875-L.jpg' },
    { title: '古诗十九首', author: '无名氏', category: '集', description: '东汉末年无名氏五言诗的代表作，"惊心动魄，一字千金"，是中国古诗的典范，收录于《文选》。' },
    { title: '苏格拉底的申辩', author: '柏拉图', category: '哲', description: '柏拉图记录苏格拉底在法庭上的辩护词，展现了哲学家面对死亡的从容与坚守真理的精神。"未经审视的生活不值得过。"', cover_url: 'https://covers.openlibrary.org/b/id/7900392-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/1656.epub.images' },
    { title: '论友谊·论老年', author: '西塞罗', category: '哲', description: '罗马共和国末期政治家西塞罗的经典散文，探讨友谊的本质与老年的从容，影响西方两千年。', cover_url: 'https://covers.openlibrary.org/b/id/8392750-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/2808.epub.images' },
    { title: '论人类不平等的起源', author: '让-雅克·卢梭', category: '哲', description: '卢梭探讨人类不平等起源的政治哲学著作，批判私有制和文明的堕落，是现代社会批判理论的奠基之作。', cover_url: 'https://covers.openlibrary.org/b/id/7900393-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/11136.epub.images' },
    { title: '社会契约论', author: '让-雅克·卢梭', category: '哲', description: '"人生而自由，却无往不在枷锁之中。"卢梭论述主权在民的政治哲学经典，深刻影响法国大革命和现代民主制度。', cover_url: 'https://covers.openlibrary.org/b/id/7900394-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/46333.epub.images' },
    { title: '君主论', author: '尼可罗·马基亚维利', category: '哲', description: '文艺复兴时期最具争议的政治哲学著作，以现实主义视角分析权力的本质，奠定近代政治学基础。', cover_url: 'https://covers.openlibrary.org/b/id/8102754-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/1232.epub.images' },
    { title: '斯宾诺莎伦理学', author: '巴鲁赫·斯宾诺莎', category: '哲', description: '以几何学式演绎方法构建的哲学体系，探讨上帝、心灵与人类情感的本质。"上帝即自然。"', cover_url: 'https://covers.openlibrary.org/b/id/11527671-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/3800.epub.images' },
    { title: '俄狄浦斯王', author: '索福克勒斯', category: '文', description: '古希腊悲剧的巅峰之作，追查弑父娶母真相的俄狄浦斯，成为西方命运与自由意志的永恒母题。', cover_url: 'https://covers.openlibrary.org/b/id/7900398-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/31.epub.images' },
    { title: '安提戈涅', author: '索福克勒斯', category: '文', description: '古希腊最伟大的悲剧之一。安提戈涅以生命捍卫神圣法则对抗世俗权力，探讨法律与道德的永恒冲突。', cover_url: 'https://covers.openlibrary.org/b/id/7900397-L.jpg', file_url: 'https://www.gutenberg.org/ebooks/31.epub.images' },
  ]

  let insertOk = 0
  for (const book of newBooks) {
    const alreadyExists = await exists(book.title)
    if (alreadyExists) {
      console.log(`  - 跳过已存在: ${book.title}`)
      continue
    }
    const ok = await insert({ ...book, is_public: true, view_count: 0 })
    if (ok) insertOk++
  }

  console.log(`\n完成！新增 ${insertOk} 本`)
}

main().catch(console.error)

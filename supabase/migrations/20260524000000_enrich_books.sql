-- =====================================================================
-- 书目丰富化迁移（2026-05-24）
-- 1. 更新现有书籍封面 URL（Open Library cover_i，可靠，非 Wikimedia）
-- 2. 补充 Gutenberg EPUB 文件链接（让阅读器可以实际打开）
-- 3. 新增约 25 部经典书目
-- =====================================================================

-- ─────────────────────────────────────────────
-- 一、更新现有书籍封面（Open Library cover_i）
-- ─────────────────────────────────────────────

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/727362-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/23839.epub.noimages'
WHERE title = '论语';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/934762-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/4094.epub.noimages'
WHERE title = '孟子';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/662232-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/7337.epub.noimages'
WHERE title = '道德经';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/626992-L.jpg'
WHERE title = '庄子';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/4849549-L.jpg'
WHERE title = '孙子兵法';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/7135261-L.jpg'
WHERE title = '易经';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/14418448-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/1497.epub.images'
WHERE title = '理想国';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/13202688-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/2680.epub.images'
WHERE title = '沉思录';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/12593945-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/8438.epub.images'
WHERE title = '尼各马可伦理学';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/7083790-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/6130.epub.images'
WHERE title = '荷马史诗·伊利亚特';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/9045853-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/1727.epub.images'
WHERE title = '奥德赛';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/11157767-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/2388.epub.images'
WHERE title = '薄伽梵歌';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/1803926-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/3283.epub.images'
WHERE title = '奥义书';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/717634-L.jpg'
WHERE title = '古兰经';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/6387077-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/8800.epub.images'
WHERE title = '神曲';

UPDATE books SET
  file_url = 'https://www.gutenberg.org/ebooks/64623.epub.noimages'
WHERE title = '金刚经';

UPDATE books SET
  file_url = 'https://www.gutenberg.org/ebooks/20968.epub.noimages'
WHERE title = '唐诗三百首';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/8779054-L.jpg',
  file_url  = 'https://www.gutenberg.org/ebooks/1513.epub.images'
WHERE title = '哈姆雷特';

UPDATE books SET
  file_url = 'https://www.gutenberg.org/ebooks/5827.epub.images'
WHERE title = '浮士德';

UPDATE books SET
  cover_url = 'https://covers.openlibrary.org/b/id/8915879-L.jpg'
WHERE title = '查拉图斯特拉如是说';

-- ─────────────────────────────────────────────
-- 二、新增精选书目（约 25 部，含封面+文件链接）
-- ─────────────────────────────────────────────

INSERT INTO books (title, author, category, description, cover_url, file_url, is_public, view_count)
VALUES

-- 儒家 ─────────────────────
('尚书',
 '孔子整理',
 '儒',
 '又称《书经》，中国最古老的历史文献集，记载尧舜禹至周代政治史料。五经之一，儒家政治思想的重要源泉。',
 'https://covers.openlibrary.org/b/id/10520540-L.jpg',
 NULL, true, 0),

('小学',
 '朱熹、刘清之',
 '儒',
 '南宋朱熹等编纂的启蒙读物，收集先秦两汉圣贤关于洒扫应对进退之节、修身处世之道的论述，是中国古代儒家重要的儿童启蒙教材。',
 NULL,
 NULL, true, 0),

('近思录',
 '朱熹、吕祖谦',
 '儒',
 '南宋朱熹与吕祖谦合编，从周敦颐、程颢、程颐、张载四子著作中精选622条，涵盖修身、治国、读书等道理，程朱理学入门经典。',
 'https://covers.openlibrary.org/b/id/9316194-L.jpg',
 NULL, true, 0),

-- 道家 ─────────────────────
('黄帝内经',
 '托名黄帝',
 '道',
 '中国现存最早的医学典籍，以阴阳五行为框架，论天人合一、生命哲学。《素问》《灵枢》两部，对中国医学、哲学影响深远。',
 'https://covers.openlibrary.org/b/id/10527498-L.jpg',
 NULL, true, 0),

('抱朴子',
 '葛洪',
 '道',
 '东晋葛洪著，内篇论道教炼养之术，外篇论儒家治世之道，是道家神仙方术与儒家伦理融合的重要文献。',
 NULL,
 NULL, true, 0),

('坐忘论',
 '司马承祯',
 '道',
 '唐代道教上清派宗师司马承祯著，提出"坐忘"修炼七步，将道家内炼哲学系统化，是道教修炼思想的重要著作。',
 NULL,
 NULL, true, 0),

-- 释家 ─────────────────────
('楞伽经',
 '求那跋陀罗译',
 '释',
 '禅宗重要典籍，以"识心见性"为核心，强调"自内证"的悟道方式。禅宗初祖达摩以此经印心，对禅宗影响极深。',
 NULL,
 NULL, true, 0),

('圆觉经',
 '佛陀波利译',
 '释',
 '完整名称《大方广圆觉修多罗了义经》，论圆觉性海与修行方法，文字优美，思想深邃，禅净密三宗共同重视。',
 NULL,
 NULL, true, 0),

('百喻经',
 '伽斯那作，求那毗地译',
 '释',
 '南朝萧齐时传入中国，以98则寓言故事阐述佛教义理。故事生动有趣，文字浅白，是佛教入门的理想读本，被称为"佛教寓言集"。',
 'https://covers.openlibrary.org/b/id/9197478-L.jpg',
 NULL, true, 0),

-- 史书 ─────────────────────
('三国志',
 '陈寿',
 '史',
 '西晋陈寿撰，记载三国时期历史的纪传体史书，与《史记》《汉书》《后汉书》并称"前四史"。后裴松之注补充大量史料，更为完善。',
 'https://covers.openlibrary.org/b/id/12741597-L.jpg',
 NULL, true, 0),

('贞观政要',
 '吴兢',
 '史',
 '唐代吴兢著，记录唐太宗李世民与魏征等大臣的政治言论和治国理政实践，是中国古代最重要的政治学著作之一，历代帝王必读。',
 NULL,
 NULL, true, 0),

-- 诗集 ─────────────────────
('宋词三百首',
 '唐圭璋选编',
 '集',
 '收录宋代词人80余家300余首词作，包括苏轼、李清照、辛弃疾等大家名作，是宋词最权威的选本之一。',
 'https://covers.openlibrary.org/b/id/9302875-L.jpg',
 NULL, true, 0),

('古诗十九首',
 '无名氏',
 '集',
 '东汉末年无名氏五言诗的代表作，收录于《文选》，以真实细腻的情感表达见长，"惊心动魄，一字千金"，是中国古诗的典范。',
 NULL,
 NULL, true, 0),

-- 哲学 ─────────────────────
('苏格拉底的申辩',
 '柏拉图',
 '哲',
 '柏拉图记录的苏格拉底在法庭上的辩护词，展现了哲学家面对死亡的从容与坚守真理的精神。"未经审视的生活不值得过。"',
 'https://covers.openlibrary.org/b/id/7900392-L.jpg',
 'https://www.gutenberg.org/ebooks/1656.epub.images',
 true, 0),

('论友谊 · 论老年',
 '西塞罗',
 '哲',
 '罗马共和国末期政治家、哲学家西塞罗的经典散文，以对话体探讨友谊的本质与老年的从容，文字典雅，思想深邃，影响西方两千年。',
 'https://covers.openlibrary.org/b/id/8392750-L.jpg',
 'https://www.gutenberg.org/ebooks/2808.epub.images',
 true, 0),

('论最高善与最高恶',
 '西塞罗',
 '哲',
 '西塞罗最重要的哲学著作，系统比较伊壁鸠鲁学派、斯多葛学派与学院派关于至善的不同观点，是了解古罗马哲学的核心文本。',
 NULL,
 'https://www.gutenberg.org/ebooks/29687.epub.images',
 true, 0),

('论人类不平等的起源',
 '让-雅克·卢梭',
 '哲',
 '卢梭探讨人类不平等起源的政治哲学著作，区分自然状态与社会状态，批判私有制和文明的堕落，是现代社会批判理论的奠基之作。',
 'https://covers.openlibrary.org/b/id/7900393-L.jpg',
 'https://www.gutenberg.org/ebooks/11136.epub.images',
 true, 0),

('社会契约论',
 '让-雅克·卢梭',
 '哲',
 '"人生而自由，却无往不在枷锁之中。"卢梭论述主权在民、社会契约基础的政治哲学经典，深刻影响法国大革命和现代民主制度。',
 'https://covers.openlibrary.org/b/id/7900394-L.jpg',
 'https://www.gutenberg.org/ebooks/46333.epub.images',
 true, 0),

('君主论',
 '尼可罗·马基亚维利',
 '哲',
 '"君主是否守信义，全凭形势需要。"文艺复兴时期最具争议的政治哲学著作，以现实主义视角分析权力的本质，奠定近代政治学基础。',
 'https://covers.openlibrary.org/b/id/8102754-L.jpg',
 'https://www.gutenberg.org/ebooks/1232.epub.images',
 true, 0),

('斯宾诺莎伦理学',
 '巴鲁赫·斯宾诺莎',
 '哲',
 '以几何学式演绎方法构建的哲学体系，探讨上帝、心灵与人类情感的本质，最终以理性追求自由与幸福。"上帝即自然。"',
 'https://covers.openlibrary.org/b/id/11527671-L.jpg',
 'https://www.gutenberg.org/ebooks/3800.epub.images',
 true, 0),

-- 文学 ─────────────────────
('变形记',
 '卡夫卡',
 '文',
 '"一天早晨，格里高尔·萨姆沙从不安的睡梦中醒来，发现自己躺在床上变成了一只巨大的甲虫。"二十世纪最具影响力的存在主义小说，揭示现代人的异化处境。',
 'https://covers.openlibrary.org/b/id/8774556-L.jpg',
 'https://www.gutenberg.org/ebooks/5200.epub.images',
 true, 0),

('荒原',
 'T.S.艾略特',
 '文',
 '二十世纪最重要的长诗之一，以支离破碎的意象拼贴呈现一战后西方文明的精神荒芜，引发现代主义诗歌革命。',
 NULL,
 NULL, true, 0),

('悲剧的诞生',
 '弗里德里希·尼采',
 '哲',
 '尼采早期代表作，提出"阿波罗精神"与"狄俄尼索斯精神"的对立，探讨悲剧艺术的起源与意义，开创了哲学美学的新范式。',
 'https://covers.openlibrary.org/b/id/8312434-L.jpg',
 'https://www.gutenberg.org/ebooks/51356.epub.images',
 true, 0),

('安提戈涅',
 '索福克勒斯',
 '文',
 '古希腊最伟大的悲剧之一。安提戈涅为埋葬兄长而违抗克瑞翁的命令，以生命捍卫神圣法则对抗世俗权力，探讨法律与道德的永恒冲突。',
 'https://covers.openlibrary.org/b/id/7900397-L.jpg',
 'https://www.gutenberg.org/ebooks/31.epub.images',
 true, 0),

('俄狄浦斯王',
 '索福克勒斯',
 '文',
 '古希腊悲剧的巅峰之作，亚里士多德《诗学》的典范案例。俄狄浦斯王追查弑父娶母真相的过程，成为西方命运与自由意志永恒母题。',
 'https://covers.openlibrary.org/b/id/7900398-L.jpg',
 'https://www.gutenberg.org/ebooks/31.epub.images',
 true, 0);

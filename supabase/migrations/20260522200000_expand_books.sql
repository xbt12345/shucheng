-- 扩充书目：儒释道 + 世界各文明经典
-- category 扩展：哲（世界哲学/宗教）、文（世界文学）

-- 先扩展 category check constraint
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_category_check;
ALTER TABLE books ADD CONSTRAINT books_category_check
  CHECK (category IN ('儒','释','道','史','集','哲','文'));

-- ================================================================
-- 中国儒家（补充）
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('荀子', '荀况', '儒',
 '战国末儒家大师，主张"人之性恶，其善者伪也"。礼论、乐论、正名篇，影响秦汉制度深远。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Xun_Kuang.jpg/220px-Xun_Kuang.jpg'),
('礼记', '戴圣编',  '儒',
 '儒家礼仪典章集成，《大学》《中庸》皆出于此。"礼者，天地之序也；乐者，天地之和也。"',
 true, NULL),
('易经', '文王等', '儒',
 '"群经之首，大道之源"。六十四卦演天地变化之道，"自强不息，厚德载物"出于此。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Yijing_hexagrams_owned_by_Houghton_Library.jpg/220px-Yijing_hexagrams_owned_by_Houghton_Library.jpg')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 中国道家（补充）
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('鬼谷子', '王诩', '道',
 '纵横家鼻祖，谋略权术之书。苏秦、张仪皆出其门。"捭阖者，道之大化，说之变也。"',
 true, NULL),
('淮南子', '刘安等', '道',
 '西汉道家论著，融道、儒、阴阳诸家。"夸父逐日""后羿射日"神话出处。',
 true, NULL)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 中国佛教（补充）
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('维摩诘经', '鸠摩罗什译', '释',
 '在家居士维摩诘与文殊菩萨问答般若妙法，不二法门，"默然无言"即是入不二法门。',
 true, NULL),
('楞严经', '般剌蜜帝译', '释',
 '佛教修行止观之要典，详论心性本体与修行次第，禅宗、密宗皆重此经。',
 true, NULL),
('华严经', '实叉难陀译', '释',
 '大乘佛教根本经典，"华严法界"境界宏大。"心如工画师，能画诸世间。"',
 true, NULL)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 中国史学（补充）
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('汉书', '班固', '史',
 '中国第一部断代史，记西汉一代史事。文辞典雅，与《史记》并称"史汉"。',
 true, NULL),
('战国策', '刘向编', '史',
 '战国时代策士游说言论汇编，纵横捭阖，辞采华美，"唇亡齿寒"等成语出处。',
 true, NULL),
('孙子兵法', '孙武', '史',
 '"兵家圣典"，13篇5900字。"知己知彼，百战不殆"。被译成多国语言，西方军校必读。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Bamboo_book_-_closed_-_UCR.jpg/220px-Bamboo_book_-_closed_-_UCR.jpg')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 中国文学（补充）
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('古文观止', '吴楚材编', '集',
 '清代散文选集，收先秦至明代文章222篇，为历来最权威的古文读本。',
 true, NULL),
('世说新语', '刘义庆', '集',
 '魏晋名士言行录，"魏晋风流"的百科全书。"言语""文学""雅量"等36门，1130则故事。',
 true, NULL),
('红楼梦', '曹雪芹', '集',
 '"中国古典小说巅峰之作"，以贾宝玉与林黛玉爱情为主线，描绘封建大家族的兴衰。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Dream_of_the_Red_Chamber_book_cover.jpg/220px-Dream_of_the_Red_Chamber_book_cover.jpg')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 古希腊哲学
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('理想国', '柏拉图', '哲',
 '西方哲学奠基之作。苏格拉底与友人对话，探讨正义、城邦与灵魂三大主题。影响两千年西方思想。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Plato_Pio-Clemetino_Inv305.jpg/220px-Plato_Pio-Clemetino_Inv305.jpg'),
('尼各马可伦理学', '亚里士多德', '哲',
 '西方伦理学奠基著作，探讨"幸福"（eudaimonia）的本质。"我们是我们反复所做的事情，卓越不是一次行动，而是一种习惯。"',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Aristotle_Altemps_Inv8575.jpg/220px-Aristotle_Altemps_Inv8575.jpg'),
('沉思录', '马可·奥勒留', '哲',
 '罗马皇帝的私人日记，斯多葛主义精华。"你有权利保持内心平静，外部事物无法真正伤害你。"',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Marcus_Aurelius_Metropolitan_Museum.jpg/220px-Marcus_Aurelius_Metropolitan_Museum.jpg'),
('论语录', '爱比克泰德', '哲',
 '斯多葛哲人的讲课记录。"有些事在我们的控制之内，有些则不在。"《手册》与《沉思录》并为斯多葛三大典。',
 true, NULL),
('形而上学', '亚里士多德', '哲',
 '"哲学乃是关于存在之存在的学问"。西方形而上学开山之作，影响中世纪经院哲学两千年。',
 true, NULL),
('会饮篇', '柏拉图', '哲',
 '以宴会形式探讨爱（eros）的本质。苏格拉底借女先知狄奥提玛之口，揭示爱向美的阶梯式上升。',
 true, NULL)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 印度哲学与宗教
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('薄伽梵歌', '毗耶娑', '哲',
 '印度教最重要圣典，《摩诃婆罗多》一部分。克里希纳向阿周那讲述行动、奉献与知识三条解脱之路。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bhagavad_Gita%2C_a_19th_century_manuscript.jpg/220px-Bhagavad_Gita%2C_a_19th_century_manuscript.jpg'),
('奥义书', '各吠陀圣哲', '哲',
 '印度哲学最高经典，探讨梵（Brahman）与我（Atman）的关系。"梵我一如"是其核心洞见。',
 true, NULL),
('法句经', '众多比丘', '释',
 '南传佛教最重要经典，423首偈颂提炼佛陀教法精要。"诸恶莫作，众善奉行，自净其意，是诸佛教。"',
 true, NULL)
ON CONFLICT DO NOTHING;

-- ================================================================
-- 伊斯兰苏菲与中东智慧
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('鲁米诗集', '贾拉鲁丁·鲁米', '哲',
 '伊斯兰苏菲神秘主义巅峰之作。芦笛之诗描绘灵魂对神的渴望，被译成数十种语言，销量超《圣经》。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Mevlana_Museum.jpg/220px-Mevlana_Museum.jpg'),
('一千零一夜', '佚名', '文',
 '中东民间故事集，山鲁佐德连说三年不败。阿拉丁、阿里巴巴、辛巴德等故事出处，人类叙事想象力宝库。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Scheherazade_and_Shahryar.jpg/220px-Scheherazade_and_Shahryar.jpg')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 世界文学经典
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('神曲', '但丁·阿利吉耶里', '文',
 '中世纪意大利文学巅峰，但丁游历地狱、炼狱、天堂三界。开创意大利语文学，影响西方文明七百年。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Dante_Alighieri_portrait_by_Giotto.jpg/220px-Dante_Alighieri_portrait_by_Giotto.jpg'),
('荷马史诗·伊利亚特', '荷马', '文',
 '特洛伊战争史诗，西方文学之源。阿喀琉斯的愤怒与英雄的荣耀，两千八百年来影响无数文学家。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Homer_British_Museum.jpg/220px-Homer_British_Museum.jpg'),
('奥德赛', '荷马', '文',
 '奥德修斯历经十年漂泊终归家园，西方"旅程"叙事原型。与《伊利亚特》并为西方文学两大源头。',
 true, NULL),
('哈姆雷特', '威廉·莎士比亚', '文',
 '"生存还是毁灭，这是一个问题。"英国文学最伟大作品，探讨复仇、道德与存在困境，四百年来长演不衰。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Shakespeare.jpg/220px-Shakespeare.jpg'),
('变形记', '奥维德', '文',
 '罗马诗人奥维德汇集希腊罗马神话250个故事，从宇宙创生到恺撒封神，西方神话集大成者。',
 true, NULL),
('浮士德', '歌德', '文',
 '"德国文学圣经"，歌德毕生之作。浮士德与魔鬼靡菲斯特的契约，探索人类永无止境的追求与救赎。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Goethe_%28Stieler_1828%29.jpg/220px-Goethe_%28Stieler_1828%29.jpg'),
('战争与和平', '列夫·托尔斯泰', '文',
 '十九世纪俄国文学高峰，拿破仑战争背景下五大家族的史诗。"人类幸福的秘密不在于追求，而在于无所求。"',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/L.N.Tolstoy_Prokudin-Gorsky.jpg/220px-L.N.Tolstoy_Prokudin-Gorsky.jpg'),
('罪与罚', '陀思妥耶夫斯基', '文',
 '俄国心理小说巅峰，拉斯柯尔尼科夫的犯罪与救赎之旅，对人性罪恶与道德良知的深刻剖析。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/220px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/220px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg'),
('百年孤独', '加西亚·马尔克斯', '文',
 '"魔幻现实主义巅峰"，布恩迪亚家族七代史诗。1982年诺贝尔文学奖。"过去都是假的，回忆是一条没有归途的路。"',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Gabriel_Garcia_Marquez.jpg/220px-Gabriel_Garcia_Marquez.jpg')
ON CONFLICT DO NOTHING;

-- ================================================================
-- 近现代世界哲学
-- ================================================================
INSERT INTO books (title, author, category, description, is_public, cover_url) VALUES
('纯粹理性批判', '伊曼努尔·康德', '哲',
 '西方近代哲学转折点，"哥白尼式革命"。探讨人类认识的可能性与限度，影响此后两百年全部哲学。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Immanuel_Kant_%28painted_portrait%29.jpg/220px-Immanuel_Kant_%28painted_portrait%29.jpg'),
('存在与时间', '马丁·海德格尔', '哲',
 '20世纪最重要哲学著作之一，重新追问"存在"的意义。此在（Dasein）、时间性、死亡向死而生。',
 true, NULL),
('查拉图斯特拉如是说', '弗里德里希·尼采', '哲',
 '"上帝死了。"尼采宣告价值重估，超人哲学，永恒轮回。诗意哲学，文学与思想的双重高峰。',
 true,
 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Nietzsche187a.jpg/220px-Nietzsche187a.jpg')
ON CONFLICT DO NOTHING;

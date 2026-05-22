-- 用 Open Library ISBN 封面替换无效的 Wikimedia URL
-- Open Library covers: https://covers.openlibrary.org/b/isbn/ISBN-M.jpg
-- 格式：-S(小) -M(中) -L(大)，均支持直接热链

-- 先清掉所有 upload.wikimedia.org 的封面（403 无法加载）
UPDATE books SET cover_url = NULL
WHERE cover_url LIKE '%upload.wikimedia.org%';

-- 用 Open Library ISBN 封面更新知名书目
UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140449337-L.jpg'
WHERE title = '沉思录';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140449140-L.jpg'
WHERE title = '理想国';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140440062-L.jpg'
WHERE title = '神曲';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0521532523-L.jpg'
WHERE title = '哈姆雷特';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0393964833-L.jpg'
WHERE title = '伊利亚特' OR title LIKE '%伊利亚特%';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140268863-L.jpg'
WHERE title = '奥德赛';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140443290-L.jpg'
WHERE title = '尼各马可伦理学';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0393977552-L.jpg'
WHERE title = '薄伽梵歌';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140440178-L.jpg'
WHERE title = '堂吉诃德';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0374528373-L.jpg'
WHERE title = '卡拉马佐夫兄弟';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0679734007-L.jpg'
WHERE title = '战争与和平';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0679734252-L.jpg'
WHERE title = '罪与罚';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0060883286-L.jpg'
WHERE title = '百年孤独';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140445927-L.jpg'
WHERE title = '浮士德';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140441468-L.jpg'
WHERE title = '查拉图斯特拉如是说';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0521657296-L.jpg'
WHERE title = '纯粹理性批判';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0061020761-L.jpg'
WHERE title = '鲁米诗集' OR title LIKE '%鲁米%';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0393315703-L.jpg'
WHERE title = '一千零一夜';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0679720200-L.jpg'
WHERE title = '道德经';

UPDATE books SET cover_url = 'https://covers.openlibrary.org/b/isbn/0140441964-L.jpg'
WHERE title = '庄子';

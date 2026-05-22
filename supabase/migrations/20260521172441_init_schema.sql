-- =====================
-- profiles（用户信息）
-- =====================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================
-- books（书籍）
-- =====================
CREATE TABLE books (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  author       TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('儒','释','道','史','集')),
  description  TEXT,
  cover_url    TEXT,
  file_url     TEXT,
  published_at DATE,
  is_public    BOOLEAN DEFAULT TRUE,
  view_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- chapters（章节）
-- =====================
CREATE TABLE chapters (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id   UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  order_num INT NOT NULL,
  cfi_range TEXT
);

-- =====================
-- highlights（高亮标注）
-- =====================
CREATE TABLE highlights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_id  UUID REFERENCES chapters(id) ON DELETE SET NULL,
  cfi_range   TEXT NOT NULL,
  text        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT 'yellow' CHECK (color IN ('yellow','red','blue','green')),
  note        TEXT,
  visibility  TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','friends','private')),
  like_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_highlights_book_chapter ON highlights(book_id, chapter_id);
CREATE INDEX idx_highlights_user ON highlights(user_id);

-- =====================
-- comments（评论/书评）
-- =====================
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id      UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  highlight_id UUID REFERENCES highlights(id) ON DELETE CASCADE,
  parent_id    UUID REFERENCES comments(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  rating       INT CHECK (rating BETWEEN 1 AND 5),
  like_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_book ON comments(book_id);
CREATE INDEX idx_comments_highlight ON comments(highlight_id);

-- =====================
-- booklists（书单）
-- =====================
CREATE TABLE booklists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE booklist_items (
  booklist_id UUID NOT NULL REFERENCES booklists(id) ON DELETE CASCADE,
  book_id     UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  order_num   INT DEFAULT 0,
  PRIMARY KEY (booklist_id, book_id)
);

-- =====================
-- follows（关注关系）
-- =====================
CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_following ON follows(following_id);

-- =====================
-- reading_logs（阅读记录/打卡）
-- =====================
CREATE TABLE reading_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id      UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  progress_cfi TEXT,
  duration_sec INT DEFAULT 0,
  logged_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(user_id, book_id, logged_at)
);

CREATE INDEX idx_reading_logs_user_date ON reading_logs(user_id, logged_at);

-- =====================
-- circles（话题圈）
-- =====================
CREATE TABLE circles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  book_id      UUID REFERENCES books(id) ON DELETE SET NULL,
  owner_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_count INT DEFAULT 1,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- Row-Level Security
-- =====================
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE books       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters    ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights  ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE booklists   ENABLE ROW LEVEL SECURITY;
ALTER TABLE booklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circles     ENABLE ROW LEVEL SECURITY;

-- profiles: 所有人可读，本人可改
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- books: 所有人可读，admin 可写（通过 service role）
CREATE POLICY "books_select" ON books FOR SELECT USING (TRUE);
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "books_update" ON books FOR UPDATE USING (
  (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- chapters: 所有人可读
CREATE POLICY "chapters_select" ON chapters FOR SELECT USING (TRUE);

-- highlights: public 可读，private 仅本人，friends 暂同 public
CREATE POLICY "highlights_select_public" ON highlights
  FOR SELECT USING (visibility = 'public' OR user_id = auth.uid());
CREATE POLICY "highlights_insert" ON highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "highlights_update" ON highlights
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "highlights_delete" ON highlights
  FOR DELETE USING (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可写，本人可删
CREATE POLICY "comments_select" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- booklists: public 可读，本人可写
CREATE POLICY "booklists_select" ON booklists
  FOR SELECT USING (is_public = TRUE OR user_id = auth.uid());
CREATE POLICY "booklists_insert" ON booklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "booklists_update" ON booklists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "booklists_delete" ON booklists
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "booklist_items_select" ON booklist_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM booklists WHERE id = booklist_id AND (is_public OR user_id = auth.uid()))
  );
CREATE POLICY "booklist_items_modify" ON booklist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM booklists WHERE id = booklist_id AND user_id = auth.uid())
  );

-- follows: 所有人可读
CREATE POLICY "follows_select" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_insert" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- reading_logs: 仅本人可读写
CREATE POLICY "reading_logs_own" ON reading_logs
  FOR ALL USING (auth.uid() = user_id);

-- circles: 所有人可读，登录用户可创建
CREATE POLICY "circles_select" ON circles FOR SELECT USING (TRUE);
CREATE POLICY "circles_insert" ON circles
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "circles_update" ON circles
  FOR UPDATE USING (auth.uid() = owner_id);

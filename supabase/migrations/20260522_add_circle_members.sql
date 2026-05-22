-- =====================
-- circle_members（话题圈成员）
-- =====================
CREATE TABLE IF NOT EXISTS circle_members (
  circle_id  UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "circle_members_select" ON circle_members FOR SELECT USING (TRUE);
CREATE POLICY "circle_members_insert" ON circle_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "circle_members_delete" ON circle_members
  FOR DELETE USING (auth.uid() = user_id);

-- RPC：加入圈子（插入成员 + member_count++）
CREATE OR REPLACE FUNCTION join_circle(p_circle_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO circle_members (circle_id, user_id)
  VALUES (p_circle_id, auth.uid())
  ON CONFLICT DO NOTHING;

  UPDATE circles
  SET member_count = (SELECT COUNT(*) FROM circle_members WHERE circle_id = p_circle_id)
  WHERE id = p_circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC：退出圈子（删除成员 + member_count--）
CREATE OR REPLACE FUNCTION leave_circle(p_circle_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM circle_members
  WHERE circle_id = p_circle_id AND user_id = auth.uid();

  UPDATE circles
  SET member_count = GREATEST(1, (SELECT COUNT(*) FROM circle_members WHERE circle_id = p_circle_id))
  WHERE id = p_circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

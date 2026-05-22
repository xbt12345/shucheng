INSERT INTO storage.buckets (id, name, public)
VALUES ('books', 'books', true), ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies require RLS enabled on storage.objects (already enabled by Supabase)
-- books bucket read policy
CREATE POLICY "books_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'books');

-- books bucket write policy (admin only)
CREATE POLICY "books_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'books' AND
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- covers bucket read policy
CREATE POLICY "covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'covers');

-- covers bucket write policy (admin only)
CREATE POLICY "covers_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'covers' AND
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

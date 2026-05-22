CREATE OR REPLACE FUNCTION increment_view_count(book_id UUID)
RETURNS VOID AS $$
  UPDATE books SET view_count = view_count + 1 WHERE id = book_id;
$$ LANGUAGE sql SECURITY DEFINER;

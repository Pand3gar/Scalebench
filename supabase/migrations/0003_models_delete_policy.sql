-- Allow owners to delete their own models. Without this, RLS silently blocks
-- DELETE (0 rows affected) so "My builds" delete would never remove DB rows.
drop policy if exists "delete own" on models;
create policy "delete own" on models for delete using (author_id = auth.uid());

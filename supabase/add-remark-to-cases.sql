-- Add remark field to cases table
-- Visible to both admin and public (client-facing note)
alter table cases add column if not exists remark text;

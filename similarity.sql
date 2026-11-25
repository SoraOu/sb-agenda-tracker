-- Similar-document detection (similarity.js). Run once in Supabase -> SQL Editor. Safe to re-run.
-- Stores, per document: reference no. (SB-YYYY-NNNN), who registered it and when, how it was classified when similar
-- documents were found (new / revised / resubmission / supplemental / manual verification), the linked parent document,
-- and the audit trail entries shown under "Audit Trail".
alter table public.measures add column if not exists meta jsonb;

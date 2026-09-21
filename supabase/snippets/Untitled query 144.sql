ALTER TABLE "budgets"
ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{
  "show_logo_url": true,
  "show_footer_url": true,
  "show_budget_details": true,
  "show_budget_conditions": true
}'::jsonb;
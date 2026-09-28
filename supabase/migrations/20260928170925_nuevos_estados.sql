SET local check_function_bodies = off;

ALTER TABLE "public"."text_items"
  DROP CONSTRAINT "text_items_budget_item_id_fkey";

ALTER TABLE "public"."text_items"
  DROP COLUMN "budget_item_id";

CREATE TABLE "public"."profiles" (
  "id"               uuid                     NOT NULL,
  "updated_at"       timestamp with time zone DEFAULT now(),
  "full_name"        text                     DEFAULT ''::text,
  "role"             text                     DEFAULT ''::text,
  "avatar_url"       text                     DEFAULT ''::text,
  "contact_number"   text                     DEFAULT ''::text,
  "website"          text                     DEFAULT ''::text,
  "logo_url"         text                     DEFAULT ''::text,
  "footer_image_url" text                     DEFAULT ''::text,
  "counters"         jsonb                    DEFAULT '{"budget_sequence": 0}'::jsonb,
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."budgets"
  ADD COLUMN "settings" jsonb NOT NULL DEFAULT '{"show_logo_url": true, "show_footer_url": true, "show_budget_details": true, "show_budget_conditions": true}'::jsonb;

ALTER TABLE "public"."budgets"
  ADD COLUMN "sent_status" text DEFAULT 'draft'::text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$function$;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Los usuarios pueden actualizar su propio perfil." ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Los usuarios pueden ver su propio perfil." ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING ((auth.uid() = id));

CREATE POLICY "Give users access to own folder il347i_0" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'public_images'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Give users access to own folder il347i_1" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'public_images'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

CREATE POLICY "Give users access to own folder il347i_2" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'public_images'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated", "postgres", "service_role";

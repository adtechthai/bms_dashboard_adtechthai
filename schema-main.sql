--
-- PostgreSQL database dump for LeaniOS Main Branch
--
-- Filtered schema containing only tables and features used in main branch
-- Generated from complete schema.sql

-- Database configuration
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Supabase Schemas (Required for Supabase functionality)
--

-- Note: Supabase projects already have these schemas created
-- Commenting out to avoid conflicts when running on fresh Supabase projects

-- CREATE SCHEMA IF NOT EXISTS auth;
-- ALTER SCHEMA auth OWNER TO supabase_admin;

-- CREATE SCHEMA IF NOT EXISTS extensions;
-- ALTER SCHEMA extensions OWNER TO postgres;

-- CREATE SCHEMA IF NOT EXISTS graphql;
-- ALTER SCHEMA graphql OWNER TO supabase_admin;

-- CREATE SCHEMA IF NOT EXISTS graphql_public;
-- ALTER SCHEMA graphql_public OWNER TO supabase_admin;

-- CREATE SCHEMA IF NOT EXISTS pgbouncer;
-- ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

-- CREATE SCHEMA IF NOT EXISTS realtime;
-- ALTER SCHEMA realtime OWNER TO supabase_admin;

-- CREATE SCHEMA IF NOT EXISTS storage;
-- ALTER SCHEMA storage OWNER TO supabase_admin;

-- CREATE SCHEMA IF NOT EXISTS vault;
-- ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Extensions (Required for Supabase)
-- Note: Supabase projects already have these extensions installed
--

-- CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

--
-- Custom Functions
--

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- Application Tables
--

-- User profiles table
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    first_name text,
    last_name text,
    nickname character varying(100),
    role text DEFAULT 'user'::text NOT NULL,
    avatar_url text,
    is_disabled boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);

-- Product categories table
CREATE TABLE public.product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT product_categories_pkey PRIMARY KEY (id),
    CONSTRAINT product_categories_slug_unique UNIQUE (slug)
);

-- Products table
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stripe_product_id text,
    name text NOT NULL,
    description text,
    short_description text,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    images text[] DEFAULT '{}'::text[] NOT NULL,
    active boolean DEFAULT true NOT NULL,
    public_visible boolean DEFAULT true NOT NULL,
    slug text NOT NULL,
    category_id uuid,
    stripe_linked boolean DEFAULT false NOT NULL,
    stripe_link_status text DEFAULT 'unlinked'::text NOT NULL,
    last_stripe_sync timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_slug_unique UNIQUE (slug),
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL,
    CONSTRAINT products_stripe_link_status_check CHECK ((stripe_link_status = ANY (ARRAY['linked'::text, 'unlinked'::text, 'error'::text])))
);

-- Prices table
CREATE TABLE public.prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    stripe_price_id text,
    unit_amount integer NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    type text DEFAULT 'one_time'::text NOT NULL,
    interval text,
    interval_count integer DEFAULT 1,
    active boolean DEFAULT true NOT NULL,
    stripe_linked boolean DEFAULT false NOT NULL,
    stripe_link_status text DEFAULT 'unlinked'::text NOT NULL,
    last_stripe_sync timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT prices_pkey PRIMARY KEY (id),
    CONSTRAINT prices_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT prices_type_check CHECK ((type = ANY (ARRAY['one_time'::text, 'recurring'::text]))),
    CONSTRAINT prices_interval_check CHECK (((type = 'one_time'::text) OR (interval IS NOT NULL))),
    CONSTRAINT prices_stripe_link_status_check CHECK ((stripe_link_status = ANY (ARRAY['linked'::text, 'unlinked'::text, 'error'::text])))
);

-- Transactions table
CREATE TABLE public.transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_user_id uuid,
    customer_user_id uuid,
    stripe_payment_intent_id text,
    stripe_customer_id text,
    product_id uuid NOT NULL,
    price_id uuid NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    status text DEFAULT 'processing'::text NOT NULL,
    payment_method_types text[] DEFAULT '{}'::text[] NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT transactions_pkey PRIMARY KEY (id),
    CONSTRAINT transactions_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT transactions_customer_user_id_fkey FOREIGN KEY (customer_user_id) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    CONSTRAINT transactions_price_id_fkey FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE CASCADE,
    CONSTRAINT transactions_status_check CHECK ((status = ANY (ARRAY['succeeded'::text, 'failed'::text, 'canceled'::text, 'processing'::text])))
);

-- User purchases table
CREATE TABLE public.user_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    transaction_id uuid,
    product_id uuid NOT NULL,
    access_granted boolean DEFAULT false NOT NULL,
    access_expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_purchases_pkey PRIMARY KEY (id),
    CONSTRAINT user_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_purchases_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    CONSTRAINT user_purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Email configuration table
CREATE TABLE public.email_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    smtp_host character varying(255) NOT NULL,
    smtp_port integer NOT NULL,
    smtp_secure boolean DEFAULT false NOT NULL,
    smtp_user character varying(255) NOT NULL,
    smtp_password text NOT NULL,
    from_email character varying(255) NOT NULL,
    from_name character varying(255) NOT NULL,
    reply_to character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_config_pkey PRIMARY KEY (id)
);

-- Email logs table
CREATE TABLE public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_email character varying(255) NOT NULL,
    recipient_name character varying(255),
    subject text NOT NULL,
    body text NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    error_message text,
    sent_by uuid,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_logs_pkey PRIMARY KEY (id),
    CONSTRAINT email_logs_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES profiles(id) ON DELETE SET NULL,
    CONSTRAINT email_logs_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'sent'::character varying, 'failed'::character varying])::text[])))
);

-- Email campaigns table
CREATE TABLE public.email_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    total_recipients integer DEFAULT 0 NOT NULL,
    successful_count integer DEFAULT 0 NOT NULL,
    failed_count integer DEFAULT 0 NOT NULL,
    delay_between_emails integer DEFAULT 1000 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    sent_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_campaigns_pkey PRIMARY KEY (id),
    CONSTRAINT email_campaigns_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT email_campaigns_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sending'::text, 'completed'::text, 'failed'::text])))
);

-- Email campaign recipients table
CREATE TABLE public.email_campaign_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    recipient_email text NOT NULL,
    recipient_name text,
    status text DEFAULT 'pending'::text NOT NULL,
    error_message text,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_campaign_recipients_pkey PRIMARY KEY (id),
    CONSTRAINT email_campaign_recipients_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
    CONSTRAINT email_campaign_recipients_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text])))
);

-- User notes table
CREATE TABLE public.user_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    admin_id uuid NOT NULL,
    content text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_notes_pkey PRIMARY KEY (id),
    CONSTRAINT user_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_notes_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Tags table
CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#000000'::character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tags_pkey PRIMARY KEY (id),
    CONSTRAINT tags_name_unique UNIQUE (name)
);

-- User tags table
CREATE TABLE public.user_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_tags_pkey PRIMARY KEY (id),
    CONSTRAINT user_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT user_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT user_tags_user_id_tag_id_unique UNIQUE (user_id, tag_id)
);

-- System settings table
CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying(255) NOT NULL,
    value jsonb NOT NULL,
    category character varying(100) DEFAULT 'general'::character varying NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT system_settings_pkey PRIMARY KEY (id),
    CONSTRAINT system_settings_key_unique UNIQUE (key)
);

--
-- Indexes
--

CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);
CREATE INDEX idx_products_active ON public.products USING btree (active);
CREATE INDEX idx_products_public_visible ON public.products USING btree (public_visible);
CREATE INDEX idx_prices_product_id ON public.prices USING btree (product_id);
CREATE INDEX idx_prices_active ON public.prices USING btree (active);
CREATE INDEX idx_transactions_customer_user_id ON public.transactions USING btree (customer_user_id);
CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);
CREATE INDEX idx_user_purchases_user_id ON public.user_purchases USING btree (user_id);
CREATE INDEX idx_user_purchases_product_id ON public.user_purchases USING btree (product_id);
CREATE INDEX idx_email_logs_recipient_email ON public.email_logs USING btree (recipient_email);
CREATE INDEX idx_email_logs_status ON public.email_logs USING btree (status);
CREATE INDEX idx_user_notes_user_id ON public.user_notes USING btree (user_id);
CREATE INDEX idx_user_tags_user_id ON public.user_tags USING btree (user_id);
CREATE INDEX idx_system_settings_key ON public.system_settings USING btree (key);

--
-- Triggers
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON public.prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_purchases_updated_at BEFORE UPDATE ON public.user_purchases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_config_updated_at BEFORE UPDATE ON public.email_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notes_updated_at BEFORE UPDATE ON public.user_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON public.tags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

--
-- Row Level Security (RLS) Policies
--

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin_user() = true);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin_user() = true);
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (is_admin_user() = true);

-- Products policies
CREATE POLICY "Public can view public products" ON public.products FOR SELECT USING (public_visible = true AND active = true);
CREATE POLICY "Admins can manage all products" ON public.products USING (is_admin_user() = true);

-- Product categories policies
CREATE POLICY "Public can view product categories" ON public.product_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage product categories" ON public.product_categories USING (is_admin_user() = true);

-- Prices policies
CREATE POLICY "Public can view public product prices" ON public.prices FOR SELECT USING (active = true AND EXISTS (SELECT 1 FROM products WHERE products.id = prices.product_id AND products.public_visible = true AND products.active = true));
CREATE POLICY "Users can view active prices" ON public.prices FOR SELECT USING (active = true AND EXISTS (SELECT 1 FROM products WHERE products.id = prices.product_id AND products.active = true));
CREATE POLICY "Admins can manage all prices" ON public.prices USING (is_admin_user() = true);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (customer_user_id = auth.uid() OR (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')));
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (is_admin_user() = true);
CREATE POLICY "Admins can manage all transactions" ON public.transactions USING (is_admin_user() = true);

-- User purchases policies
CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT USING (user_id = auth.uid() OR (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')));
CREATE POLICY "Admins can view all purchases" ON public.user_purchases FOR SELECT USING (is_admin_user() = true);
CREATE POLICY "Admins can manage all purchases" ON public.user_purchases USING (is_admin_user() = true);
CREATE POLICY "Service can manage user purchases" ON public.user_purchases USING (true);

-- Email system policies (Admin only)
CREATE POLICY "Admins can manage email config" ON public.email_config USING (is_admin_user() = true);
CREATE POLICY "Admins can view email logs" ON public.email_logs FOR SELECT USING (is_admin_user() = true);
CREATE POLICY "Admins can insert email logs" ON public.email_logs FOR INSERT WITH CHECK (is_admin_user() = true);
CREATE POLICY "Admins can view all email campaigns" ON public.email_campaigns FOR SELECT TO authenticated USING (is_admin_user() = true);
CREATE POLICY "Admins can create email campaigns" ON public.email_campaigns FOR INSERT TO authenticated WITH CHECK (is_admin_user() = true);
CREATE POLICY "Admins can update email campaigns" ON public.email_campaigns FOR UPDATE TO authenticated USING (is_admin_user() = true);
CREATE POLICY "Admins can view all campaign recipients" ON public.email_campaign_recipients FOR SELECT TO authenticated USING (is_admin_user() = true);
CREATE POLICY "Admins can create campaign recipients" ON public.email_campaign_recipients FOR INSERT TO authenticated WITH CHECK (is_admin_user() = true);
CREATE POLICY "Admins can update campaign recipients" ON public.email_campaign_recipients FOR UPDATE TO authenticated USING (is_admin_user() = true);

-- User notes policies (Admin only)
CREATE POLICY "Admins can view all user notes" ON public.user_notes FOR SELECT USING (is_admin_user() = true);
CREATE POLICY "Admins can create user notes" ON public.user_notes FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can update own notes" ON public.user_notes FOR UPDATE USING (admin_id = auth.uid() AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete own notes" ON public.user_notes FOR DELETE USING (admin_id = auth.uid() AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Tags policies
CREATE POLICY "Users can read tags" ON public.tags FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage tags" ON public.tags USING (is_admin_user() = true);

-- User tags policies
CREATE POLICY "Users can read their own tags" ON public.user_tags FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage user tags" ON public.user_tags USING (is_admin_user() = true);

-- System settings policies
CREATE POLICY "Public can view basic app info" ON public.system_settings FOR SELECT USING (((key)::text = ANY ((ARRAY['app_name'::character varying, 'app_description'::character varying])::text[])) OR (auth.role() = 'authenticated'::text));
CREATE POLICY "Admin users can manage system settings" ON public.system_settings USING (is_admin_user() = true);

--
-- Storage Setup
--

-- Create storage bucket for user note attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('user-notes-attachments', 'user-notes-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Storage policies for user note attachments
CREATE POLICY "Admins can upload note attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'user-notes-attachments' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can view note attachments" ON storage.objects FOR SELECT USING (bucket_id = 'user-notes-attachments' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admins can delete own attachments" ON storage.objects FOR DELETE USING (bucket_id = 'user-notes-attachments' AND owner = auth.uid() AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Enable RLS on storage
-- Note: Supabase manages storage RLS, commenting out to avoid permission errors
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Database Views
--

-- Email campaign summary view
CREATE VIEW email_campaign_summary AS
SELECT 
  c.id,
  c.subject,
  c.total_recipients,
  c.successful_count,
  c.failed_count,
  c.status,
  c.started_at,
  c.completed_at,
  c.created_at,
  p.first_name || ' ' || p.last_name AS sender_name,
  p.email AS sender_email
FROM email_campaigns c
LEFT JOIN profiles p ON c.sent_by = p.id;

-- Grant appropriate permissions
GRANT SELECT ON email_campaign_summary TO authenticated;

--
-- Initial Data
--

-- Create default admin user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, nickname, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NULL),
    CASE 
      WHEN NEW.email = 'admin@example.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, category, description) VALUES
('app_name', '"LeaniOS"', 'general', 'Application name'),
('app_description', '"Modern SaaS platform for content creators"', 'general', 'Application description'),
('email_enabled', 'true', 'email', 'Enable email functionality'),
('default_currency', '"usd"', 'general', 'Default currency for pricing');

-- 
-- End of schema
--
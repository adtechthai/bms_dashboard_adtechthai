--
-- BMS Dashboard Tables
-- Additional tables for Business Management System metrics
--

-- PSID Inputs Statistics Table
CREATE TABLE IF NOT EXISTS public.psid_inputs_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_type text NOT NULL,
    today_count integer DEFAULT 0 NOT NULL,
    weekly_count integer DEFAULT 0 NOT NULL,
    monthly_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT psid_inputs_statistics_pkey PRIMARY KEY (id)
);

-- Intent Statistics Table
CREATE TABLE IF NOT EXISTS public.intent_statistics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intent_type text NOT NULL,
    today_count integer DEFAULT 0 NOT NULL,
    weekly_count integer DEFAULT 0 NOT NULL,
    monthly_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT intent_statistics_pkey PRIMARY KEY (id)
);

-- Purchase Value Summary Table
CREATE TABLE IF NOT EXISTS public.purchase_value_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_type text NOT NULL,
    today_count numeric DEFAULT 0 NOT NULL,
    weekly_count numeric DEFAULT 0 NOT NULL,
    monthly_count numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT purchase_value_summary_pkey PRIMARY KEY (id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_psid_inputs_metric_type ON public.psid_inputs_statistics USING btree (metric_type);
CREATE INDEX IF NOT EXISTS idx_intent_statistics_intent_type ON public.intent_statistics USING btree (intent_type);
CREATE INDEX IF NOT EXISTS idx_purchase_value_summary_metric_type ON public.purchase_value_summary USING btree (metric_type);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_psid_inputs_statistics_updated_at BEFORE UPDATE ON public.psid_inputs_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intent_statistics_updated_at BEFORE UPDATE ON public.intent_statistics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_value_summary_updated_at BEFORE UPDATE ON public.purchase_value_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.psid_inputs_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intent_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_value_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view psid inputs statistics" ON public.psid_inputs_statistics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage psid inputs statistics" ON public.psid_inputs_statistics USING (is_admin_user() = true);

CREATE POLICY "Users can view intent statistics" ON public.intent_statistics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage intent statistics" ON public.intent_statistics USING (is_admin_user() = true);

CREATE POLICY "Users can view purchase value summary" ON public.purchase_value_summary FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage purchase value summary" ON public.purchase_value_summary USING (is_admin_user() = true);

-- Insert sample data for testing
INSERT INTO public.psid_inputs_statistics (metric_type, today_count, weekly_count, monthly_count) VALUES
('PSID Inputs', 150, 980, 4200);

INSERT INTO public.intent_statistics (intent_type, today_count, weekly_count, monthly_count) VALUES
('Lead', 45, 320, 1250),
('Purchase', 12, 85, 380),
('VC', 80, 540, 2100),
('ATC', 35, 245, 950),
('IC', 20, 140, 580),
('Move to Spam', 8, 45, 180),
('Blocking', 3, 22, 95),
('Ban', 2, 12, 48);

INSERT INTO public.purchase_value_summary (metric_type, today_count, weekly_count, monthly_count) VALUES
('Purchase Value', 45000.00, 318000.00, 1250000.00);
-- =====================================================
-- Transaction Tracking Schema
-- Adds metadata column and ensures proper transaction tracking
-- =====================================================

-- Add metadata column to transactions table if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for metadata queries
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN (metadata);

-- Add helpful comments
COMMENT ON COLUMN transactions.metadata IS 'JSONB metadata from payment intent including customer information';

-- Update RLS policies for transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (
        customer_user_id IS NOT NULL AND auth.uid() = customer_user_id::uuid OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can view all transactions" ON transactions;
CREATE POLICY "Admins can view all transactions" ON transactions
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Create user_purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    access_granted BOOLEAN DEFAULT FALSE,
    access_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique combination per transaction
    UNIQUE(user_id, product_id, transaction_id)
);

-- Add RLS policies for user_purchases
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
CREATE POLICY "Users can view own purchases" ON user_purchases
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Service can manage user purchases" ON user_purchases;
CREATE POLICY "Service can manage user purchases" ON user_purchases
    FOR ALL USING (TRUE);

-- Add indexes for user_purchases
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product_id ON user_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_transaction_id ON user_purchases(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_access ON user_purchases(user_id, product_id, access_granted);

-- Add helpful comments
COMMENT ON TABLE user_purchases IS 'Tracks user access to purchased products';
COMMENT ON COLUMN user_purchases.access_granted IS 'Whether user has access to the product';
COMMENT ON COLUMN user_purchases.access_expires_at IS 'When access expires (null for lifetime access)';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for user_purchases
DROP TRIGGER IF EXISTS update_user_purchases_updated_at ON user_purchases;
CREATE TRIGGER update_user_purchases_updated_at
    BEFORE UPDATE ON user_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for transactions
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
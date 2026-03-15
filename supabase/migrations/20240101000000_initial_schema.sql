-- Create custom types for better data integrity
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('Debit', 'Credit', 'Crypto', 'Cash', 'Savings');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_sub_type AS ENUM ('Long-term', 'Short-term');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('Expense', 'Income', 'Transfer', 'Debt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    default_currency TEXT DEFAULT 'RUB',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Accounts table (cards, crypto, cash)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type account_type NOT NULL,
    sub_type account_sub_type NOT NULL,
    bank_name TEXT,
    balance DECIMAL(20, 8) DEFAULT 0.00, -- Increased precision for Crypto
    credit_limit DECIMAL(20, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for global/standard categories
    name TEXT NOT NULL,
    icon TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name) -- Prevent duplicate categories for the same user
);

-- 4. Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb, 
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Validation: prevent transfer to the same account
    CONSTRAINT different_accounts CHECK (
        (type = 'Transfer' AND from_account_id != to_account_id) OR (type != 'Transfer')
    )
);

-- 5. Debts table
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    person_name TEXT NOT NULL,
    amount DECIMAL(20, 2) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- --- ADVANCED LOGIC & OPTIMIZATION ---

-- Indices for faster querying
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);

-- Automatic Default Categories for New Users
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, icon, is_custom)
    VALUES 
        (NEW.id, 'Еда', '🍴', false),
        (NEW.id, 'Транспорт', '🚗', false),
        (NEW.id, 'Жилье', '🏠', false),
        (NEW.id, 'Здоровье', '💊', false),
        (NEW.id, 'Развлечения', '🎉', false),
        (NEW.id, 'Зарплата', '💰', false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();

-- --- RLS POLICIES ---
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view their own accounts" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own categories" ON categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can view their own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own debts" ON debts FOR ALL USING (auth.uid() = user_id);

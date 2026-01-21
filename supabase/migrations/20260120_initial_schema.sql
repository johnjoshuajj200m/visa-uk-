-- UK Visa Assistant - Initial Database Schema
-- Created: 2026-01-20

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: visa_profiles
-- ============================================
-- Stores high-level visa application profiles
CREATE TABLE visa_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    visa_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'decided')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by user_id
CREATE INDEX idx_visa_profiles_user_id ON visa_profiles(user_id);

-- Enable RLS
ALTER TABLE visa_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visa_profiles
CREATE POLICY "Users can view their own visa profiles"
    ON visa_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visa profiles"
    ON visa_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own visa profiles"
    ON visa_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own visa profiles"
    ON visa_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Table: visa_answers
-- ============================================
-- Stores question/answer pairs for visa applications
CREATE TABLE visa_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visa_profile_id UUID NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    question_key TEXT NOT NULL,
    answer_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by profile
CREATE INDEX idx_visa_answers_profile_id ON visa_answers(visa_profile_id);

-- Enable RLS
ALTER TABLE visa_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visa_answers
-- Users can only access answers for profiles they own
CREATE POLICY "Users can view answers for their profiles"
    ON visa_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = visa_answers.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert answers for their profiles"
    ON visa_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = visa_answers.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update answers for their profiles"
    ON visa_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = visa_answers.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = visa_answers.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete answers for their profiles"
    ON visa_answers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = visa_answers.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- Table: documents
-- ============================================
-- Tracks uploaded documents for visa applications
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visa_profile_id UUID NOT NULL REFERENCES visa_profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster lookups by profile
CREATE INDEX idx_documents_profile_id ON documents(visa_profile_id);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
-- Users can only access documents for profiles they own
CREATE POLICY "Users can view documents for their profiles"
    ON documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = documents.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents for their profiles"
    ON documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = documents.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents for their profiles"
    ON documents FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = documents.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = documents.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents for their profiles"
    ON documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM visa_profiles
            WHERE visa_profiles.id = documents.visa_profile_id
            AND visa_profiles.user_id = auth.uid()
        )
    );

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on visa_profiles
CREATE TRIGGER update_visa_profiles_updated_at
    BEFORE UPDATE ON visa_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

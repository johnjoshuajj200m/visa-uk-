-- Create document_reviews table
CREATE TABLE IF NOT EXISTS public.document_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    review_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add index on document_id for faster lookups
CREATE INDEX idx_document_reviews_document_id ON public.document_reviews(document_id);

-- Add index on created_at for sorting
CREATE INDEX idx_document_reviews_created_at ON public.document_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.document_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view reviews for their own documents
CREATE POLICY "Users can view their document reviews"
ON public.document_reviews FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.visa_profiles vp ON vp.id = d.visa_profile_id
        WHERE d.id = document_reviews.document_id
        AND vp.user_id = auth.uid()
    )
);

-- RLS Policy: Users can create reviews for their own documents
CREATE POLICY "Users can create reviews for their documents"
ON public.document_reviews FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.visa_profiles vp ON vp.id = d.visa_profile_id
        WHERE d.id = document_reviews.document_id
        AND vp.user_id = auth.uid()
    )
);

-- RLS Policy: Users can delete reviews for their own documents
CREATE POLICY "Users can delete their document reviews"
ON public.document_reviews FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.documents d
        JOIN public.visa_profiles vp ON vp.id = d.visa_profile_id
        WHERE d.id = document_reviews.document_id
        AND vp.user_id = auth.uid()
    )
);

-- Comments
COMMENT ON TABLE public.document_reviews IS 'Stores AI-generated reviews of visa documents';
COMMENT ON COLUMN public.document_reviews.review_json IS 'JSON containing review summary, issues, warnings, and risk level';

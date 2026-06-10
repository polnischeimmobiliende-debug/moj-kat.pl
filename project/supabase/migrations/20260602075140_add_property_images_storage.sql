/*
  # Set up property images storage

  1. Storage
    - Create 'property-images' bucket for storing uploaded images
    - Enable public access for viewing images
    - Set upload restrictions for authenticated users only
*/

-- Create storage bucket for property images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

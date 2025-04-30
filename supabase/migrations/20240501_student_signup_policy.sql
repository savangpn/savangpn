-- Create policy to allow users to insert their own profile during sign-up
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'Users can insert their own profile during sign-up'
    ) THEN
        EXECUTE $policy$
        CREATE POLICY "Users can insert their own profile during sign-up"
        ON "public"."profiles"
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id AND privilege = 'student');
        $policy$;
    END IF;
END
$$;

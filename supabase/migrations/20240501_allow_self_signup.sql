-- Create policy to allow users to insert their own profile during sign-up
CREATE POLICY "Users can insert their own profile during sign-up"
ON "public"."profiles"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND privilege = 'student');

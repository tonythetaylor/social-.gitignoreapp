-- Step 1: Add the 'userID' column to the User table
ALTER TABLE "User" ADD COLUMN "userID" TEXT;

-- Step 2: Generate a unique userID for existing users
-- Note: This is a rough example; adjust it based on your specific use case and database platform
DO $$ 
DECLARE 
    user_record RECORD;
    user_id TEXT;
BEGIN
    FOR user_record IN SELECT id FROM "User" LOOP
        -- Generate a random userID in the format XXX-XXX-XXX
        user_id := 
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) || '-' ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) || '-' ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1) ||
            substring('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' FROM (random() * 62 + 1) FOR 1);
        
        -- Update the userID for the user
        UPDATE "User"
        SET "userID" = user_id
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Step 3: Add a unique index on the 'userID' column
CREATE UNIQUE INDEX "User_userID_key" ON "User"("userID");
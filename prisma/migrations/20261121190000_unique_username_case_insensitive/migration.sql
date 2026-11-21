-- Profile URLs resolve case-insensitively, including accounts with legacy mixed-case names.
CREATE UNIQUE INDEX "User_username_lower_key" ON "User" (lower("username"));

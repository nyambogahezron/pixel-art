# User Account System

This document describes the new user account system added to the Pixel Art app.

## Features Added

### 1. User Registration and Login

- **Location**: `/app/auth.tsx`
- Beautiful animated login/signup screen
- Toggle between login and signup modes
- Form validation
- Real-time animations including rotating logo

### 2. User Profile Management

- **Location**: `/app/profile.tsx`
- View and edit user profile
- Change name and email
- Delete account functionality
- Member since date display

### 3. Menu Integration

- **Location**: `/app/menu.tsx`
- Account button in main menu
- Shows user info when logged in
- Quick access to profile and logout
- Guest mode for non-logged-in users

### 4. Database Schema

- **Location**: `/db/schema.ts`
- New `users` table with id, name, email, password, avatar, timestamps
- Updated `drawings` table with `userId` foreign key
- Proper relationships between users and their drawings

### 5. User Service

- **Location**: `/services/userService.ts`
- Complete user management API
- Session handling with AsyncStorage
- Profile updates
- Account deletion
- Authentication methods

### 6. Drawing Association

- **Location**: `/services/database.ts`
- Drawings are now associated with users
- User-specific drawing lists
- Guest drawings for non-logged-in users
- Backward compatibility maintained

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  avatar TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Drawings Table

```sql
ALTER TABLE drawings ADD user_id INTEGER REFERENCES users(id);
```

## Usage Flow

1. **First Time User**:

   - Opens menu → sees "Login / Sign Up" button
   - Taps button → animated auth screen appears
   - Can toggle between login and signup
   - Creates account with name, email, password
   - Automatically logged in after signup

2. **Returning User**:

   - Opens menu → sees user info and "Account Settings" button
   - Can tap for profile options or logout
   - Profile screen allows editing name/email
   - All drawings are associated with their account

3. **Guest User**:
   - Can use app without account
   - Drawings saved locally without user association
   - Encouraged to create account to save work permanently

## Security Notes

⚠️ **Important**: This implementation stores passwords in plain text for development purposes. In production, you should:

1. Hash passwords using bcrypt or similar
2. Implement proper session tokens
3. Add password complexity requirements
4. Add email verification
5. Implement forgot password functionality
6. Add rate limiting for login attempts

## API Methods

### UserService

- `getCurrentUser()` - Get logged-in user
- `login(email, password)` - Authenticate user
- `createAccount(userData)` - Register new user
- `updateProfile(userId, updates)` - Update user info
- `logout()` - Clear session
- `deleteAccount(userId)` - Remove user and data

### DrawingService (Updated)

- `getAllDrawings()` - Get user's drawings (or guest drawings)
- `getUserDrawings(userId)` - Get specific user's drawings
- `getGuestDrawings()` - Get drawings without user association
- `saveDrawing()` - Now associates with current user

## Files Modified/Added

### New Files

- `/app/auth.tsx` - Login/signup screen
- `/app/profile.tsx` - User profile management
- `/services/userService.ts` - User management API

### Modified Files

- `/app/menu.tsx` - Added account functionality
- `/db/schema.ts` - Added users table
- `/services/database.ts` - User-aware drawing management

### Database Migration

- `/drizzle/0001_bumpy_goliath.sql` - Migration for users table

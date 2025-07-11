# Biometric Authentication Features

This document outlines the new biometric authentication features added to the Pixel Art app.

## Features Overview

### 1. Forgot Password with Biometric Authentication

- Users can reset their password using biometric authentication (fingerprint, face ID, etc.)
- Located on the login screen as "Forgot Password?" link
- Two-step process:
  1. Enter email address to verify account exists
  2. Use biometric authentication to verify identity and set new password

### 2. Change Password with Biometric Verification

- Accessible from Settings > Security > Change Password
- Requires current password + biometric authentication for security
- Users must provide current password and confirm with biometric authentication before setting new password

### 3. Account Deletion with Biometric Verification

- Accessible from Settings > Security > Delete Account
- Requires biometric authentication to prevent accidental deletions
- Permanently deletes user account and all associated data
- Cannot be undone

## Technical Implementation

### BiometricService

Located at `services/biometricService.ts`

Key methods:

- `isBiometricAvailable()`: Check if device supports biometric authentication
- `authenticate(reason)`: Perform biometric authentication with custom prompt
- `authenticateForPasswordReset(email)`: Specific authentication for password reset
- `authenticateForPasswordChange()`: Specific authentication for password change
- `authenticateForAccountDeletion()`: Specific authentication for account deletion

### UserService Updates

Enhanced methods in `services/userService.ts`:

- `resetPasswordWithBiometric(email, newPassword)`: Reset password with biometric verification
- `changePasswordWithBiometric(userId, currentPassword, newPassword)`: Change password with biometric verification
- `deleteAccountWithBiometric(userId)`: Delete account with biometric verification
- `userExistsByEmail(email)`: Check if user exists by email

### UI Components

#### ForgotPassword Component

- Two-step wizard interface
- Email verification step
- Password reset step with biometric authentication
- Located at `components/ForgotPassword.tsx`

#### ChangePassword Component

- Form for current and new password
- Biometric authentication integration
- Located at `components/ChangePassword.tsx`

#### DeleteAccount Component

- Warning interface with confirmation
- Biometric authentication requirement
- Located at `components/DeleteAccount.tsx`

## Security Flow

### Password Reset Flow

1. User clicks "Forgot Password?" on login screen
2. User enters email address
3. System verifies email exists in database
4. User enters new password
5. System prompts for biometric authentication
6. Upon successful authentication, password is updated
7. User can login with new password

### Password Change Flow

1. User navigates to Settings > Security > Change Password
2. User enters current password and new password
3. System prompts for biometric authentication
4. Upon successful authentication, system verifies current password
5. Password is updated if all checks pass

### Account Deletion Flow

1. User navigates to Settings > Security > Delete Account
2. System shows warning about permanent deletion
3. User confirms deletion intent
4. System prompts for biometric authentication
5. Upon successful authentication, account and all data are permanently deleted
6. User is redirected to authentication screen

## Device Requirements

- Device must have biometric authentication hardware (fingerprint sensor, Face ID, etc.)
- User must have biometric credentials enrolled on their device
- App will fallback to device passcode if biometric authentication fails

## Error Handling

- Graceful degradation when biometric authentication is unavailable
- Clear error messages for authentication failures
- Fallback options when biometric authentication fails
- Proper user feedback for all authentication states

## Privacy & Security

- Biometric data never leaves the device
- Authentication is handled by the device's secure enclave
- No biometric data is stored by the application
- All authentication prompts include clear reasoning for the request

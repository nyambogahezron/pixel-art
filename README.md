# Pixel Art


# Auto-Save and App State Management

## Overview

The pixel art drawing app now includes comprehensive auto-save functionality and smart app state management that automatically saves your work and resumes where you left off. These features work seamlessly in the background without interrupting your creative flow.

## Auto-Save Features

### Auto-Save Mechanism

- **Automatic Detection**: The app detects when you make changes to your drawing
- **Smart Timing**: Auto-save triggers 5 seconds after you stop making changes
- **Frequency Limit**: Auto-saves occur at most once every 30 seconds to avoid excessive database writes
- **Background Operation**: Auto-save runs silently without disrupting your work

### Auto-Save Naming

- New drawings are automatically saved with names like "Unsaved 1", "Unsaved 2", etc.
- The app intelligently finds the next available number in the sequence
- You can later give your drawing a proper name when you manually save it

## App State Management

### Resume Last Drawing

- **Automatic Resume**: When you return to the app, it automatically loads the last drawing you were working on
- **Cross-Session Persistence**: Your last working drawing is remembered even after closing the app completely
- **Loading Indicator**: Shows a loading screen while retrieving your last drawing
- **Fallback Handling**: If the last drawing can't be loaded, starts with a blank canvas

### Welcome Screen Intelligence

- **One-Time Welcome**: The welcome screen only appears the first time you use the app
- **Terms Agreement Tracking**: Once you agree to terms, you won't see the welcome screen again
- **Direct to Drawing**: Returning users go straight to the drawing interface

### Visual Indicators

- **Title Bar**: Shows the current drawing name and auto-save status
- **Auto-Save Label**: Displays "(Auto-saved)" next to auto-saved drawing names
- **Unsaved Changes**: Shows a red dot (•) when there are unsaved changes
- **Load Modal**: Auto-saved drawings are clearly marked with an "Auto-saved" badge
- **Resume Notification**: Shows a success toast when resuming a previous drawing

## User Experience Flows

### First-Time User

1. Sees welcome screen with app introduction and terms
2. Agrees to terms and goes to drawing interface
3. Starts drawing immediately
4. Work is auto-saved as "Unsaved 1" after 5 seconds
5. Can continue working with auto-save protection

### Returning User

1. App automatically loads last drawing being worked on
2. Shows loading screen briefly
3. Displays toast notification about resumed drawing
4. Can immediately continue where they left off

### Creating New Drawings

1. Tap "New" button
2. If current drawing has unsaved changes, prompted to save first
3. Last working drawing tracking is cleared for fresh start
4. New drawing becomes the tracked working drawing

### Loading Different Drawings

1. Open Load dialog
2. Select any saved drawing
3. That drawing becomes the new "last working drawing"
4. Will resume to this drawing next time app opens

## Technical Implementation

### Storage Keys

- `lastWorkingDrawingId`: Stores the ID of the last drawing being worked on
- `hasSeenWelcome`: Tracks whether user has completed welcome flow

### Components Modified

- `app/index.tsx`: Main drawing screen with auto-save and resume logic
- `app/_layout.tsx`: Welcome screen management and app initialization
- `app/welcome.tsx`: Updated to use centralized storage service
- `services/database.ts`: Added state management utilities

### Key Features

- Debounced auto-save (5-second delay)
- Intelligent naming system
- Visual status indicators
- Proper cleanup on unmount
- Error handling for auto-save failures
- Cross-session state persistence
- Loading state management
- Welcome screen intelligence

## Benefits

### For Users

- **Never Lose Work**: Auto-save protects against data loss
- **Seamless Experience**: Pick up exactly where you left off
- **No Repetitive Setup**: Welcome screen appears only once
- **Clear Status**: Always know the state of your work
- **Flexible Workflow**: Create new or continue existing work seamlessly

### For Developers

- **Centralized State Management**: All app state utilities in one service
- **Error Resilience**: Graceful handling of storage failures
- **Performance Optimized**: Efficient auto-save timing and state tracking
- **Maintainable Code**: Clean separation of concerns

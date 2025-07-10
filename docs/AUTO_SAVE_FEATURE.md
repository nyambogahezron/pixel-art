# Auto-Save Feature

## Overview

The pixel art drawing app now includes an auto-save feature that automatically saves your work to prevent data loss. This feature works seamlessly in the background without interrupting your creative flow.

## How It Works

### Auto-Save Mechanism

- **Automatic Detection**: The app detects when you make changes to your drawing
- **Smart Timing**: Auto-save triggers 5 seconds after you stop making changes
- **Frequency Limit**: Auto-saves occur at most once every 30 seconds to avoid excessive database writes
- **Background Operation**: Auto-save runs silently without disrupting your work

### Auto-Save Naming

- New drawings are automatically saved with names like "Unsaved 1", "Unsaved 2", etc.
- The app intelligently finds the next available number in the sequence
- You can later give your drawing a proper name when you manually save it

### Visual Indicators

- **Title Bar**: Shows the current drawing name and auto-save status
- **Auto-Save Label**: Displays "(Auto-saved)" next to auto-saved drawing names
- **Unsaved Changes**: Shows a red dot (•) when there are unsaved changes
- **Load Modal**: Auto-saved drawings are clearly marked with an "Auto-saved" badge

### Manual Save Behavior

- **New Drawings**: Opens a save dialog to enter a proper name
- **Auto-Saved Drawings**: When you save an auto-saved drawing, it prompts for a new name
- **Named Drawings**: Quick-save without dialog (Ctrl+S equivalent)

## User Experience

### Creating a New Drawing

1. Start drawing on a blank canvas
2. After 5 seconds of inactivity, the drawing is auto-saved as "Unsaved 1"
3. Continue drawing - changes are automatically saved every 30 seconds
4. When ready, tap "Save" to give it a proper name

### Loading Auto-Saved Drawings

1. Open the Load dialog
2. Auto-saved drawings show an "Auto-saved" badge
3. Load any drawing normally
4. Save with a new name when ready

### Benefits

- **No Data Loss**: Your work is always protected
- **Seamless Experience**: Auto-save works invisibly in the background
- **Flexible Naming**: Start creating immediately, name later
- **Clear Status**: Always know the save status of your work

## Technical Implementation

### Components Modified

- `app/index.tsx`: Main drawing screen with auto-save logic
- `services/database.ts`: Auto-save database operations
- `services/draw.ts`: Auto-save timing constants

### Key Features

- Debounced auto-save (5-second delay)
- Intelligent naming system
- Visual status indicators
- Proper cleanup on unmount
- Error handling for auto-save failures

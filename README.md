# Tab Manager (Brave/Chromium MV3)

A minimal browser extension to save and manage tabs with a clean UI. Backward compatible with your old backup files.

## Features
- Save current tabs as a snapshot with auto filename: `tabs_YYYY-MM-DD_HH-mm.json`
- Import legacy array backups or the new format `{ name, createdAt, items }`
- Per-tab fields: `url`, `title`, `domain`, `pinned`, `date`, `tags`
- Search / filter by tag / sort by title, domain, url, or date
- Multi-select with checkboxes, batch open (optional new window) with throttling
- Auto-deduplicate and merge on import
- Show "opened" status, live counter, and Copy URLs
- Keyboard shortcuts and context menus (save tabs, save current tab/domain)

## Requirements
- Brave or Chrome with Manifest V3 support

## Install (Developer mode)
1. Download or clone this repository
2. Open `brave://extensions/` or `chrome://extensions/`
3. Enable Developer mode
4. Click "Load unpacked" and select this folder

### Microsoft Edge
1. Open `edge://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this folder

### Opera
1. Open `opera://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this folder

### Vivaldi
1. Open `vivaldi://extensions/`
2. Enable Developer mode
3. Click "Load unpacked" and select this folder

## Usage
- Click the extension icon to open Tab Manager
- Save Open Tabs: export all open tabs to JSON (optional snapshot name)
- Import JSON: select a file or drag & drop into the drop zone
- Search / Tag Filter / Sort to narrow the list
- Use checkboxes to Open Selected / Remove Selected / Copy URLs
- Toggle "New window" to open in a new window; pinned state is restored

### Shortcuts (configurable in browser Shortcuts)
- `save-tabs`: Save open tabs
- `open-last-snapshot`: Open Tab Manager

### Context menu
- Save this tab URL
- Save all tabs from this domain

## Export format
```json
{
  "name": "optional snapshot name",
  "createdAt": 1733664000000,
  "items": [
    {
      "url": "https://example.com",
      "title": "Example",
      "domain": "example.com",
      "pinned": false,
      "date": 1733664000000,
      "tags": ["reading"]
    }
  ]
}
```
Also supports legacy backups: an array of URLs or objects with `{ url }`.

## Tips
- Close tabs, then import and open only what you need to save memory
- Use tags to group tabs, e.g., `work`, `read`, `watch`

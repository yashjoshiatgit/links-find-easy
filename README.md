# Profile Link Manager

![Profile Link Manager Logo](icons/icon128.png)

A browser extension that helps you manage your professional profile links and automatically fill them in job applications and other web forms.

## Features

### 🔗 Profile Link Management
- Store and organize all your professional profile links in one place
- Support for common platforms (LinkedIn, GitHub, Portfolio, Twitter, etc.)
- Add custom platforms for any website
- Search functionality to quickly find your links
- Copy links to clipboard with a single click

### 🪄 Intelligent Autofill
- Automatically detect form fields on web pages
- Smart matching of fields with your stored links
- Fill individual fields or autofill all detected fields at once
- Keyword-based matching for improved accuracy

### ⚙️ Customization
- Toggle automatic form field detection
- Enable/disable notifications
- Export your data for backup
- Import data from a previous backup

## Installation

### Chrome Web Store
*Coming soon!*

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the folder containing the extension
5. The extension icon should appear in your browser toolbar

## Usage

### Managing Your Links

1. Click the extension icon in your browser toolbar
2. In the "My Links" tab, click "Add New Link"
3. Select a platform from the dropdown or choose "Custom" for other websites
4. Enter the URL of your profile
5. (Optional) Add a display name and keywords for better autofill matching
6. Click "Save"

### Using Autofill

1. Navigate to a page with a form you want to fill (e.g., job application)
2. Click the extension icon
3. Go to the "Autofill" tab
4. The extension will scan the page for form fields
5. Click the magic wand icon next to a field to fill it with the appropriate link
6. Alternatively, click "Autofill All" to fill all detected fields at once

### Backup and Restore

1. Go to the "Settings" tab
2. Click "Export Links" to download a JSON file with your data
3. To restore, click "Import Links" and select your backup file

## Privacy

This extension stores all your data locally in your browser. Your profile links never leave your computer unless you choose to export them. The extension does not track your browsing activity or collect any personal information.

## Development

### Project Structure
```
links-find-easy/
│
├── background/
│   └── background.js       # Background service worker
│
├── content/
│   └── content.js          # Content script for page interaction
│
├── popup/
│   ├── popup.html          # Extension popup UI
│   ├── popup.css           # Styles for the popup
│   └── popup.js            # Popup functionality
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── manifest.json           # Extension manifest
```

### Building from Source
1. Clone the repository
2. Make your changes
3. Test the extension locally
4. Package for distribution

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for job seekers and professionals who are tired of manually copying and pasting their profile links.

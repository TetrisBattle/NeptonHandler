# Nepton Handler

A Chrome extension that automates daily activity logging in [Nepton](https://nepton.fi).

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- A Chromium-based browser (Chrome, Edge, Brave, etc.)

### Installation

```bash
# Install dependencies
npm install
```

### Build

```bash
# Production build (outputs to dist/)
npm run build

# Watch mode for development
npm run dev
```

### Load the Extension in Chrome

1. Run `npm run build` to generate the `dist/` folder.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `dist/` folder.
5. The Nepton Handler icon will appear in your toolbar.

---

## Usage

### Main View

1. Navigate to your Nepton calendar.
2. Click the Nepton Handler toolbar icon.
3. Set the fields:
   - **Date** — defaults to today
   - **Start time** — defaults to 08:00 if empty
   - **End time** — defaults to current time rounded up to the nearest 5 minutes
4. Optionally select a saved **project preset** from the dropdown.
5. Click **Add** — the extension will find the date cell on the Nepton page, open the entry, and fill in the form automatically.

### Settings View

Click the **⚙** (gear) icon to open the Settings view where you can:

- **Add** a new project preset (display name, Nepton project ID, internal code)
- **Edit** an existing preset
- **Delete** a preset
- **Set a default** preset (★) — it will be pre-selected whenever the popup opens

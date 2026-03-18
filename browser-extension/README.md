# AutoApply AI Autofill Helper

This optional Chrome-compatible extension allows the web app to request **visible** autofill in the newly opened third-party application tab.

## Local install

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the `browser-extension/` folder from this repo.

## What it does

- listens for autofill requests from the AutoApply AI web app
- waits for the target job-application tab to open
- fills common text fields directly in that tab using extension permissions

## Limitations

- text fields only; file uploads still usually require manual interaction
- some highly dynamic/custom forms may still resist autofill
- the extension currently requests `<all_urls>` host access so it can work across different job boards

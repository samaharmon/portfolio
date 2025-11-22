Favicon set for Samuel Harmon Portfolio

Files:
  - favicon-16x16.png
  - favicon-32x32.png
  - apple-touch-icon.png
  - android-chrome-192x192.png
  - android-chrome-512x512.png
  - site.webmanifest

Add these to <head> (update paths if needed):

<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">

Notes:
• Modern browsers are happy with PNG favicons + webmanifest.
• If you also want a .ico, convert favicon-32x32.png locally (e.g., `magick favicon-32x32.png favicon.ico`).

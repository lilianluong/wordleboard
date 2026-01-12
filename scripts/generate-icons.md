# Generating PWA Icons

You need to create icons for the PWA. Here are a few options:

## Option 1: Using PWA Asset Generator (Recommended)

1. Install the tool:
```bash
npm install -g pwa-asset-generator
```

2. Create a source icon (512x512px) and save it as `icon-source.png`

3. Generate all icons:
```bash
pwa-asset-generator icon-source.png public/icons --icon-only
```

## Option 2: Manual Creation

Create the following icon sizes and save them in `public/icons/`:
- 72x72.png
- 96x96.png
- 128x128.png
- 144x144.png
- 152x152.png
- 192x192.png
- 384x384.png
- 512x512.png

## Option 3: Online Tools

Use online tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/imageGenerator)

Make sure all icons are square and use a simple, recognizable design for the Wordle Board app.

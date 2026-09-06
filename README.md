# ModPlay Store 🎮

A custom APK distribution hub built as an educational security awareness project. This is a Google Play Store clone that demonstrates how app stores work, with a focus on security education.

## Features

- **Material Design 3** inspired UI with dark/light theme toggle
- **Search & filter** — find apps by name, developer, or category
- **Tab navigation** — For you, Top charts, Categories, Security training
- **App detail pages** with screenshots, reviews, ratings, and download flow
- **Security awareness training** section with tips and educational content
- **Fully responsive** — works on desktop and mobile
- **GitHub Pages ready** — static site, no build step needed

## Apps Included

| App | Developer | Category | Rating |
|-----|-----------|----------|--------|
| Snapchat | Snap Inc. | Social | 4.2 |
| WhatsApp | Meta Platforms, Inc. | Communication | 4.4 |
| Telegram | Telegram FZ-LLC | Communication | 4.3 |
| Instagram | Meta Platforms, Inc. | Social | 4.1 |

## Security Training

This project is designed for **educational purposes**:
- Each app listing contains simulated fake reviews
- The security section explains how to identify fake reviews
- Download flow demonstrates APK distribution mechanics
- Tips section covers app store safety best practices

## Project Structure

```
├── index.html          # Main storefront
├── app.html            # App detail page (shared)
├── apps.json           # App data (metadata + fake reviews)
├── _config.yml         # GitHub Pages config
├── css/
│   ├── tokens.css      # Design tokens (colors, spacing, typography)
│   ├── base.css        # Reset and base styles
│   ├── components.css  # Storefront components
│   └── app-page.css    # App detail page styles
├── js/
│   ├── app.js          # Storefront logic (search, tabs, rendering)
│   └── app-detail.js   # App detail page logic
├── apks/               # APK files (placeholder)
├── Snapchat/           # App page
├── WhatsApp/           # App page
├── Telegram/           # App page
└── Instagram/          # App page
```

## Development

This is a static site — no build step needed. Just serve the files:

```bash
# Using Python
python -m http.server 8000

# Using Node
npx serve .
```

## Deployment

Push to `main` and GitHub Pages deploys automatically.

## License

Educational use only. Not affiliated with Google Play.

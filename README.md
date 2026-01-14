# Claude Code Countdown

**[claudecodecountdown.com](https://claudecodecountdown.com)**

Track when your Claude Code access returns with SMS notifications.

When you hit your Claude Code rate limit and see "Limit reached · resets [time] (UTC)", enter that time here to get a countdown and optional SMS alerts.

## Features

- **Simple Time Input** - Just type "8pm" or "2:30 PM" - no date pickers needed
- **Live Countdown** - See hours, minutes, and seconds until access returns
- **SMS Notifications** - Get texted 5 minutes before and when access is restored
- **Phone Number Caching** - Your number is saved locally for convenience
- **Brutalist Design** - Clean, sharp-cornered UI with offset shadows

## Tech Stack

- **Frontend**: Next.js 14 + Tailwind CSS + tw-animate-css
- **Fonts**: Inter (body), JetBrains Mono (countdown)
- **SMS**: Twilio scheduled messages
- **Deployment**: Optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 18.17+
- Twilio account (free trial available)

### Installation

```bash
# Clone the repo
git clone https://github.com/carterlasalle/claudecodecountdown.git
cd claudecodecountdown

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Twilio credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Twilio Setup

1. Sign up at [twilio.com](https://www.twilio.com/) (free trial includes credits)
2. From the Console, copy your **Account SID** and **Auth Token**
3. Get a Twilio phone number
4. Add credentials to `.env.local`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Note**: Free trial requires verifying recipient phone numbers first.

## Usage

1. When Claude Code shows "Limit reached · resets 8pm (UTC)"
2. Enter "8pm" in the time field
3. Click "Start Countdown"
4. (Optional) Enter your phone number for SMS alerts

## Time Format

Enter times like:
- `8pm` or `8PM`
- `2:30 PM` or `2:30pm`
- `11:45 AM` or `11:45am`

All times are in **UTC** - same as what Claude Code displays.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/carterlasalle/claudecodecountdown)

Add your Twilio environment variables in the Vercel dashboard.

## SEO

This site is optimized for search engines with:
- Semantic HTML and structured data (JSON-LD)
- Open Graph and Twitter Card meta tags
- robots.txt and sitemap.xml
- PWA manifest for mobile

## Project Structure

```
src/
├── app/
│   ├── api/schedule-sms/route.ts  # Twilio SMS endpoint
│   ├── globals.css                # Brutalist styles with oklch colors
│   ├── layout.tsx                 # SEO metadata
│   └── page.tsx                   # Main page
├── components/
│   ├── CountdownTimer.tsx         # Countdown with JetBrains Mono
│   ├── PhoneInput.tsx             # Phone input with caching
│   └── TimeInput.tsx              # Time parser
└── lib/
    └── twilio.ts                  # Twilio helper
```

## Design System

The UI uses a brutalist design with:
- **Colors**: oklch color space (pure black/white)
- **Borders**: 1px solid black
- **Shadows**: 3px offset (no blur)
- **Radius**: 0rem (sharp corners)
- **Fonts**: Inter + JetBrains Mono

## License

MIT

## Author

[Carter LaSalle](https://github.com/carterlasalle)

# Ginchy Mobile Landing Page

A professional, mobile-first landing page built with React, Next.js, and Tailwind CSS. Optimized for mobile devices with accessibility features and performance best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the page.

## 📱 Mobile Optimization

This landing page is optimized for the following mobile viewports:
- **360×800** (Small Android)
- **375×812** (iPhone X/12)
- **390×844** (iPhone 14)
- **412×915** (Pixel)

## 🎨 Customization

### Replacing Content

1. **Hero Section**: Edit `components/Hero.jsx`
   - Update headline, subheadline, and CTA text
   - Replace hero image placeholder

2. **Features**: Edit `components/Features.jsx`
   - Update the `features` array with your content
   - Modify icons, titles, and descriptions

3. **Pricing**: Edit `components/PricingCard.jsx`
   - Update the `plans` array with your pricing
   - Modify plan names, prices, and features

4. **Branding**: Update the following files:
   - Logo: Replace logo in `components/Header.jsx`
   - Colors: Modify `tailwind.config.js`
   - Favicon: Replace files in `public/` directory

### Adding Images

Place your images in the `public/assets/` directory:

```
public/assets/
├── hero-image.jpg
├── logo.svg
├── favicon.ico
├── apple-touch-icon.png
├── favicon-32x32.png
├── favicon-16x16.png
└── og-image.jpg
```

Update image references in the components.

## 📧 Google Sheets Integration

The signup form is connected to Google Sheets for lead collection.

### Setup Steps

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Google Sheets API**
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in details and create

4. **Generate Service Account Key**
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the JSON file

5. **Create Google Sheet**
   - Create a new Google Sheet
   - Share it with your service account email (from JSON file)
   - Give "Editor" permissions

6. **Set Environment Variables**
   Create `.env.local` file:
   ```env
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_PRIVATE_KEY_ID=your-private-key-id
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_SHEET_ID=your-google-sheet-id
   ```

7. **Install Google APIs Package**
   ```bash
   npm install googleapis
   ```

### Testing the Integration

1. Submit the signup form
2. Check your Google Sheet
3. The email and timestamp should appear in the sheet

## 🧪 QA Checklist

Test the following on your mobile device:

### Navigation
- [ ] Hamburger menu opens/closes properly
- [ ] Menu items navigate to correct sections
- [ ] Menu closes when clicking outside
- [ ] Keyboard navigation works (Tab, Enter, Escape)

### Forms
- [ ] Email validation works (shows error for invalid emails)
- [ ] Form submission shows loading state
- [ ] Success message appears after submission
- [ ] Error handling works for network issues

### Accessibility
- [ ] All text has sufficient contrast
- [ ] Tap targets are at least 44px
- [ ] Focus indicators are visible
- [ ] Screen reader can navigate the page
- [ ] Skip to content link works

### Performance
- [ ] Page loads quickly on mobile data
- [ ] Images load progressively
- [ ] No layout shift during loading
- [ ] Smooth scrolling and animations

### Responsive Design
- [ ] Layout works on 360px width
- [ ] Layout works on 375px width
- [ ] Layout works on 390px width
- [ ] Layout works on 412px width
- [ ] Text is readable at all sizes
- [ ] Buttons are easily tappable

## 📊 Performance Features

- **Image Optimization**: WebP/AVIF formats with lazy loading
- **Code Splitting**: Automatic component-based splitting
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Static generation with ISR
- **Accessibility**: WCAG 2.1 AA compliance

## 🛠️ Technical Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS 3.3+
- **Animations**: Framer Motion (optional)
- **Icons**: Lucide React (inline SVGs)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
mobile-landing/
├── components/
│   ├── Header.jsx          # Navigation with hamburger menu
│   ├── Hero.jsx            # Hero section with CTA
│   ├── Features.jsx        # Feature cards
│   ├── HowItWorks.jsx      # Process steps
│   ├── PricingCard.jsx    # Pricing plans
│   └── SignupForm.jsx      # Email signup form
├── pages/
│   ├── index.jsx           # Main landing page
│   └── api/
│       └── signup.js       # Google Sheets integration
├── styles/
│   └── globals.css         # Tailwind + custom utilities
├── public/
│   └── assets/             # Images and icons
├── tailwind.config.js      # Tailwind configuration
├── next.config.js          # Next.js configuration
└── package.json
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Connect GitHub repo
- **AWS Amplify**: Connect GitHub repo
- **DigitalOcean App Platform**: Connect GitHub repo

## 📈 Analytics Setup

Add your analytics tracking code to `pages/index.jsx` in the `<Head>` section:

```jsx
{/* Google Analytics */}
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID');
    `,
  }}
/>
```

## 🎯 SEO Optimization

The page includes:
- Meta tags for social sharing
- Structured data markup
- Mobile-first responsive design
- Fast loading times
- Accessible navigation

## 📞 Support

For questions or issues:
1. Check the QA checklist above
2. Review the Google Sheets setup instructions
3. Test on multiple mobile devices
4. Verify all environment variables are set

## 📄 License

This project is licensed under the MIT License.

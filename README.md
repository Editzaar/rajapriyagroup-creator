# Raja Priya Group — Website

## Folder structure
```
rajapriya-website/
├── index.html          Home
├── about.html          About Us
├── services.html        Services (all 4 pillars)
├── projects.html        Projects gallery (with filters)
├── contact.html          Contact + enquiry form
│
├── css/
│   ├── common.css       shared: navbar, footer, buttons, colors, fonts
│   ├── home.css / about.css / services.css / projects.css / contact.css
│
├── js/
│   ├── common.js        shared: navbar scroll/mobile menu, scroll-reveal
│   ├── home.js          testimonial slider
│   ├── about.js         animated milestone counters
│   ├── services.js      hash-highlight on arrival from a service link
│   ├── projects.js      category filter buttons
│   └── contact.js        enquiry form + service dropdown prefill
│
└── images/               add your real photos here (see below)
```

## Before you go live

1. **Add real images** — drop files into `/images` using these exact names
   (each has a graceful gold/black placeholder fallback if missing, so the
   site never breaks, but real photos will look far better):
   - `images/logo.png` — your logo, transparent background, ~200px tall
   - `images/projects/plot-01.jpg`, `plot-02.jpg`
   - `images/projects/villa-01.jpg`, `villa-02.jpg`
   - `images/projects/commercial-01.jpg`, `commercial-02.jpg`
   - `images/services/real-estate.jpg`, `construction.jpg`, `brand.jpg`, `social.jpg`
   - `images/about/office.jpg`

2. **Connect the contact form** — it's wired for Web3Forms (free):
   - Go to https://web3forms.com, enter your email, get a free access key
   - In `contact.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` with that key
   - Submissions will land straight in your inbox — no backend needed

3. **Set up your Blog subdomain** — point `blog.rajapriyagroup.com` (CNAME)
   to your Blogger blog once your domain is ready. Until then the "Blog"
   nav link can point anywhere you like.

4. **Update placeholder social links** — the `#` links in the footer icons
   (Facebook, Instagram, LinkedIn, YouTube) need your real profile URLs.

5. **Buy your domain** (e.g. rajapriyagroup.com) and deploy for free on
   Netlify — drag-and-drop the whole `rajapriya-website` folder in.

## Editing content later
Every page's text lives directly in its `.html` file. Styles for a page
live only in that page's own CSS file — editing `services.css` never
affects `about.html`, etc. Shared elements (navbar, footer, buttons,
brand colors) live in `common.css` and `common.js` — edit those once and
every page updates.

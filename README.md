# SaaSimulator - CEO Simulation

A real-time startup simulation game where you play as a CEO, managing product development, hiring, funding, random events, and finances.

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

**Recommended: Clean start (if experiencing 404 errors)**
```bash
# Kill any existing dev servers and clear cache
pkill -f "next dev" || true
rm -rf .next
npm run dev
```

Or use the helper script:
```bash
chmod +x scripts/dev-clean.sh
./scripts/dev-clean.sh
```

**Standard start:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Common Issues

**404 Errors for static assets:**
If you're seeing 404 errors for `/_next/static/` files:

1. Kill any existing Next.js processes:
   ```bash
   pkill -f "next dev"
   ```

2. Clear the build cache:
   ```bash
   rm -rf .next
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

4. Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows/Linux)

**Port already in use:**
If port 3000 is already in use, Next.js will automatically try port 3001, 3002, etc. Check the terminal output for the actual port.

### Building for Production

```bash
npm run build
npm start
```

### Deployment

This project is configured for GitHub Pages deployment. The GitHub Actions workflow will automatically build and deploy when you push to the `main` branch.

The site will be available at: `https://cecilkleine.github.io/SaaSimulator/`

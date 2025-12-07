# Crypto Portfolio Tracker

A real-time cryptocurrency portfolio tracker that helps you monitor multiple crypto accounts across different owners. Track Bitcoin, Ethereum, Solana, and more with live price updates.

## Features

- **Real-Time Price Updates** - Live cryptocurrency prices from CoinGecko API
- **Multi-Owner Support** - Track portfolios for multiple people in one place
- **Inline Editing** - Quickly update crypto amounts without re-adding accounts
- **Auto-Save** - Your data automatically saves to your browser
- **Export/Import CSV** - Backup your portfolio or share with others
- **Beautiful UI** - Modern glassmorphism design with smooth animations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- Cardano (ADA)
- Solana (SOL)
- XRP (XRP)
- Dogecoin (DOGE)
- Polkadot (DOT)
- Avalanche (AVAX)
- Chainlink (LINK)
- Polygon (MATIC)

## Live Demo

**[View Live Application](https://isaiahfite.github.io/Crypto-Portfolio-Tracker/)**

## How to Use

### Adding an Account
1. Enter the **Owner Name** (e.g., "Alice", "Bob")
2. Enter the **Account Name** (e.g., "Coinbase Wallet", "Hardware Wallet")
3. Select the **Cryptocurrency** from the dropdown
4. Enter the **Amount** you hold
5. Click **Add**

### Editing an Account
- Click the blue **Edit** button (pencil icon) on any account
- Update the amount
- Click the green **Check** button to save or **X** to cancel

### Exporting Your Data
- Click **Export CSV** to download your portfolio
- File saves to your Downloads folder with today's date
- Open in Excel, Google Sheets, or any spreadsheet software

### Importing Data
- Click **Import CSV**
- Select a previously exported CSV file
- Accounts will be added to your existing portfolio

## Installation & Setup

### Option 1: Use GitHub Pages (Recommended)
Follow the deployment guide in the repository to host your own instance.

### Option 2: Run Locally
1. Download the `index.html` file
2. Double-click to open in your browser
3. That's it! No installation needed.

### Option 3: Deploy to Your Own Server
1. Download the `index.html` file
2. Upload to any web hosting service
3. Access via your domain

## Privacy & Data Storage

- **All data is stored locally** in your browser's localStorage
- **No server or database** - your portfolio data never leaves your device
- **No account required** - completely anonymous
- Each person who accesses the site has their own separate data
- To backup data, use the Export CSV feature regularly

## Technical Details

### Built With
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **CoinGecko API** - Live cryptocurrency prices
- **LocalStorage API** - Client-side data persistence

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### API Usage
- Uses CoinGecko's free public API
- No API key required
- Rate limit: approximately 50 requests per minute
- Prices update automatically every 60 seconds

## CSV Format

Exported CSV files contain the following columns:
```
Owner,Account Name,Cryptocurrency,Amount,Current Price,Value
Alice,Coinbase Wallet,BTC,0.5,50000.00,25000.00
Bob,Hardware Wallet,ETH,10,3000.00,30000.00
```

## Contributing

Contributions are welcome! Here are some ways you can help:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
- Star this repository

### Feature Ideas
- Add more cryptocurrencies
- Price change indicators (% up/down)
- Historical price charts
- Multi-currency support (EUR, GBP, etc.)
- Dark/Light mode toggle
- Portfolio performance analytics

## Disclaimer

**This tool is for tracking purposes only.**

- Not financial advice
- Cryptocurrency prices are volatile
- Always verify amounts with your exchange/wallet
- Keep CSV backups of your portfolio data
- Not responsible for losses or data loss

## License

MIT License - feel free to use this project however you'd like.

## Acknowledgments

- Price data provided by [CoinGecko](https://www.coingecko.com/)
- Icons from [Lucide](https://lucide.dev/)
- Built with assistance from Claude AI

## Support

If you encounter any issues:

1. Check that you're using a modern browser
2. Clear your browser cache and reload
3. Export your data as CSV backup before troubleshooting
4. Open an issue in this repository

---

**Made for crypto enthusiasts**

Star this repo if you find it useful!

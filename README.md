# Crypto & Stock Portfolio Tracker

A real-time cryptocurrency and stock portfolio tracker that helps you monitor multiple accounts across different owners. Track Bitcoin, Ethereum, Solana, stocks, and more with live price updates.

## Features

- **Real-Time Price Updates** - Live cryptocurrency prices from CoinGecko API and stock prices from Yahoo Finance
- **Multi-Asset Support** - Track both cryptocurrencies and stocks in one place
- **Multi-Owner Support** - Track portfolios for multiple people in one place
- **Inline Editing** - Quickly update amounts and details without re-adding accounts
- **Optional Local Storage** - Choose whether to save data locally (disabled by default for privacy)
- **Purchase Tracking** - Record purchase price, date, and notes for each holding
- **Gain/Loss Calculation** - Automatically calculates profit/loss when purchase price is provided
- **Export/Import CSV** - Backup your portfolio or share with others
- **Beautiful UI** - Modern glassmorphism design with smooth animations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## Supported Assets

### Cryptocurrencies (39+)
- Bitcoin (BTC), Ethereum (ETH), Cardano (ADA), Solana (SOL), XRP
- Dogecoin (DOGE), Polkadot (DOT), Avalanche (AVAX), Chainlink (LINK), Polygon (MATIC)
- Algorand (ALGO), Stellar (XLM), Hedera (HBAR), VeChain (VET), IOTA
- Quant (QNT), XDC Network, Sui (SUI), Flare (FLR), Pendle, and many more

### Stocks (12+)
- XRP-related: XRPZ, XRPC, XRPI, PRXRF, XRPT, XXRP
- Precious Metals: WPM (Wheaton Precious Metals), GLD (SPDR Gold), IAU (iShares Gold), PHYS (Sprott Physical Gold), FNV (Franco-Nevada)

## Live Demo

**[View Live Application](https://isaiahfite.github.io/Crypto-Portfolio-Tracker/)**

## How to Use

### Adding an Account
1. Enter the **Owner Name** (e.g., "Alice", "Bob")
2. Select **Asset Type** (Cryptocurrency or Stock)
3. Select the **Asset** from the dropdown
4. Enter the **Amount** you hold
5. *(Optional)* Enter **Purchase Price per Unit** to track gains/losses
6. *(Optional)* Select **Purchase Date**
7. *(Optional)* Add **Notes** (e.g., "Coinbase Wallet", "Long-term hold")
8. Click **Add Account**

### Editing an Account
- Click the blue **Edit** button (pencil icon) on any account
- Update amount, purchase price, date, or notes
- Click the green **Check** button to save or **X** to cancel

### Enabling Local Storage
- By default, data is **not saved** between sessions for privacy
- Check the **"Save locally"** checkbox in the header to enable persistence
- When enabled, your portfolio saves automatically to your browser
- Uncheck to clear saved data

### Exporting Your Data
- Click **Export CSV** to download your portfolio
- File saves to your Downloads folder with today's date
- Includes all fields: amounts, prices, purchase info, and notes
- Open in Excel, Google Sheets, or any spreadsheet software

### Importing Data
- Click **Import CSV**
- Select a previously exported CSV file
- Accounts will replace your current portfolio

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

- **Local storage is optional** and disabled by default for maximum privacy
- **No server or database** - your portfolio data never leaves your device
- **No account required** - completely anonymous
- Enable "Save locally" to persist data between sessions
- Each person who accesses the site has their own separate data
- To backup data, use the Export CSV feature regularly

## Technical Details

### Built With
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **CoinGecko API** - Live cryptocurrency prices
- **Yahoo Finance API** - Live stock prices
- **LocalStorage API** - Optional client-side data persistence

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### API Usage
- Cryptocurrency prices from CoinGecko's free public API (no API key required)
- Stock prices from Yahoo Finance via CORS proxy
- Rate limit: approximately 50 requests per minute
- Prices update automatically every 60 seconds

## CSV Format

Exported CSV files contain the following columns:
```
Owner,Type,Asset,Amount,Current Price,Value,Purchase Price,Total Cost,Purchase Date,Notes
Alice,crypto,BTC,0.5,50000.00,25000.00,45000.00,22500.00,2024-01-15,Coinbase Wallet
Bob,stock,GLD,100,185.50,18550.00,180.00,18000.00,2024-03-01,Long-term hold
```

| Column | Description |
|--------|-------------|
| Owner | Name of the account holder |
| Type | `crypto` or `stock` |
| Asset | Asset symbol (BTC, ETH, GLD, etc.) |
| Amount | Quantity held |
| Current Price | Live market price |
| Value | Current total value (Amount × Price) |
| Purchase Price | *(Optional)* Price paid per unit |
| Total Cost | *(Optional)* Total purchase cost |
| Purchase Date | *(Optional)* Date of purchase |
| Notes | *(Optional)* Any additional notes |

## Contributing

Contributions are welcome! Here are some ways you can help:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
- Star this repository

### Feature Ideas
- Historical price charts
- Multi-currency support (EUR, GBP, etc.)
- Dark/Light mode toggle
- Portfolio performance analytics over time
- Price alerts and notifications

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

**Made for crypto and stock enthusiasts**

Star this repo if you find it useful!

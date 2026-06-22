# CipherPay (RupeeFlow)

A Web3 off-ramp application that converts cryptocurrency (USDC/XLM) into Indian Rupees (INR) and sends it directly to a UPI ID or bank account via IMPS.

---

## Table of Contents

- [What It Does](#what-it-does)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Wallet Connection](#wallet-connection)
- [Payment Methods](#payment-methods)
- [Supported Languages](#supported-languages)
- [Key Files Explained](#key-files-explained)
- [Available Scripts](#available-scripts)

---

## What It Does

CipherPay lets a user:

1. **Connect** a Stellar blockchain wallet
2. **Enter** an amount of USDC to convert
3. **Choose** a payment method (QR scan, manual entry, or direct wallet pay)
4. **Receive** the equivalent INR in their Indian bank account or UPI

Think of it as a crypto-to-fiat bridge for the Indian market.

---

## How It Works

```
User connects wallet
        |
        v
Enters USDC amount -----> Live rate fetched from CoinGecko
        |
        v
Chooses payout method (UPI or Bank Account)
        |
        v
Selects payment mode:
  - QR Code (scan to pay from any wallet)
  - Manual Entry (paste tx hash after sending)
  - Wallet Pay (deduct directly from connected Stellar wallet)
        |
        v
App verifies the transaction on Stellar testnet
        |
        v
IMPS/UPI transfer is dispatched
        |
        v
User receives INR + receipt with UTR number
```

---

## Features

### Wallet
- Connect Stellar wallet via Freighter browser extension
- View live XLM balance on Stellar testnet
- Refresh balance on demand
- Add testnet XLM tokens via Stellar Friendbot faucet
- Disconnect wallet anytime

### Payments
- **QR Code mode**: Scan a QR to send crypto from any wallet app
- **Manual Entry mode**: Paste a transaction hash after sending, enter payout details
- **Wallet Pay mode**: Pay directly from the connected Stellar wallet balance
- All three modes deduct from the Stellar wallet and show the balance decrease

### Exchange Rate
- Live USDC/INR and XLM/INR rates from CoinGecko API
- Refreshes every 60 seconds
- Interactive SVG line chart with LIVE, 7D, and 30D views
- Offline fallback with random walk when API is unavailable

### Transaction Ledger
- Persistent transaction history (stored in localStorage)
- Search, filter, and sort transactions
- Export to CSV
- Detailed reports with volume charts, network breakdown, top recipients
- Clear all transactions option

### Multi-Language Support
- English, Hindi, Spanish, French, German
- Language switcher in the top panel

### UI/UX
- Dark and light theme with smooth toggle
- Glassmorphic design with animated background
- Fully responsive (mobile-friendly)
- Step-by-step transaction progress with animations
- Success receipt with UTR and blockchain hash link

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| @stellar/freighter-api | Stellar wallet connection |
| CoinGecko API | Live crypto exchange rates |
| Stellar Horizon API | Account balance queries |
| Stellar Friendbot | Testnet token faucet |
| Lucide React | Icon library |
| CSS Custom Properties | Theming (dark/light mode) |
| localStorage | Transaction and theme persistence |

---

## Project Structure

```
moneyexchange/
├── public/
│   ├── favicon.svg          # App favicon
│   └── icons.svg            # Social media icon sprite
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Top navigation with wallet, language, theme
│   │   ├── SwapCalculator.jsx    # USDC-to-INR conversion form
│   │   ├── WalletModal.jsx       # Wallet selection modal (Solana/Celo/Stellar)
│   │   ├── RateChart.jsx         # Live exchange rate chart
│   │   ├── Ledger.jsx            # Transaction ledger with reports
│   │   ├── NetworkBadges.jsx     # Supported network badges
│   │   ├── BeneficiaryList.jsx   # Saved payout recipients
│   │   └── TransactionHistory.jsx # Transaction history view
│   ├── hooks/
│   │   ├── useLedger.js          # Transaction CRUD, reports, CSV export
│   │   └── useRupeeFlow.js       # App state: wallet, rates, beneficiaries
│   ├── i18n.js                   # Translations (EN, HI, ES, FR, DE)
│   ├── index.css                 # Full design system and styles
│   ├── App.jsx                   # Main app with screen routing
│   └── main.jsx                  # Entry point
├── index.html                    # HTML shell with theme script
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite configuration
└── README.md                     # This file
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ installed
- **npm** (comes with Node.js)
- **Freighter browser extension** (for Stellar wallet connection)

### Installation

```bash
# Clone the repository
git clone https://github.com/aditya7agrawal7/CipherPay.git

# Navigate to the project
cd moneyexchange

# Install dependencies
npm install
```

### Run the App

```bash
npm run dev
```

The app starts at `http://localhost:5173`. Open it in your browser.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Wallet Connection

### Stellar (Real Integration)

1. Click **"Connect Wallet"** in the top-right corner
2. Select **"Stellar"** from the modal
3. If Freighter is installed, it will request access to your public key
4. If Freighter is not installed, it uses the hardcoded testnet public key
5. Your XLM balance appears in the wallet dropdown
6. Click **"+ Add Tokens"** to fund the wallet with testnet XLM

### Solana / Celo (Mock)

These generate a random mock address for demo purposes. No real blockchain interaction.

---

## Payment Methods

### QR Code Mode

1. Enter USDC amount on the input screen
2. Click **Continue** -> select **Scan QR Code**
3. A mock QR code is displayed with a deposit address
4. Enter the destination UPI ID
5. Click **Confirm Payout**

### Manual Entry Mode

1. Enter USDC amount -> click **Continue** -> select **Manual Data Entry**
2. Choose UPI or Bank Account payout type
3. Fill in payout details (UPI ID, or IFSC + Account Number + Name)
4. Enter or generate a transaction hash
5. Click **Verify & Off-Ramp**

### Wallet Pay Mode

1. Connect a Stellar wallet first
2. Enter USDC amount -> click **Continue** -> select **Pay with Wallet**
3. Your XLM balance is displayed
4. Enter the XLM amount to pay
5. Enter the destination UPI ID
6. Click **Pay Now**

---

## Supported Languages

| Code | Language |
|---|---|
| EN | English |
| HI | Hindi (हिन्दी) |
| ES | Spanish (Español) |
| FR | French (Français) |
| DE | German (Deutsch) |

Use the globe icon dropdown in the top panel to switch languages.

---

## Key Files Explained

### `src/App.jsx`
The main component. Manages the screen state machine (`INPUT` -> `PAYMENT_METHODS` -> `SIMULATION` -> `SUCCESS` -> `LEDGER`). Handles wallet connection, balance fetching, token funding, payment simulation, and ledger integration.

### `src/hooks/useLedger.js`
Custom hook for transaction persistence. Stores transactions in localStorage. Provides `addTransaction`, `removeTransaction`, `clearAllTransactions`, `exportCSV`, and computed analytics (volume, success rate, daily charts, top recipients).

### `src/hooks/useRupeeFlow.js`
Main app state hook. Manages wallet state, exchange rate fetching, beneficiaries, and the swap simulation state machine with a 4-step stepper.

### `src/components/WalletModal.jsx`
Modal with three wallet options: Solana, Celo, Stellar. Each with custom SVG icons, colors, and descriptions.

### `src/components/RateChart.jsx`
SVG-based live exchange rate chart. Supports LIVE, 7D, and 30D timeframes. Interactive crosshair tooltip. Includes a compact converter widget.

### `src/components/Ledger.jsx`
Full transaction ledger with search, filter, sort, pagination, CSV export, and a reports tab with volume charts and analytics.

### `src/i18n.js`
Custom lightweight i18n system. All UI strings in 5 languages. Function-based translations for dynamic content (e.g., `selectTransfer: (amount) => ...`).

### `src/index.css`
Complete design system using CSS custom properties. Includes dark/light themes, glassmorphism, animations, responsive breakpoints, and component styles.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at localhost:5173 |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint on the project |

---

## License

This project is for educational and hackathon purposes.

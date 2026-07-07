# sta4

Minimal standalone frontend dapp for connecting an EVM wallet and calling a contract from a static site.

## Files

- `/home/runner/work/sta4/sta4/index.html` - app markup
- `/home/runner/work/sta4/sta4/styles.css` - minimal styling
- `/home/runner/work/sta4/sta4/app.js` - wallet connect and contract interaction logic
- `/home/runner/work/sta4/sta4/vendor/ethers.umd.min.js` - local copy of ethers for static deployment

## Run locally

This app does not need a build step.

From `/home/runner/work/sta4/sta4` run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in a browser with an injected EVM wallet such as MetaMask.

## Usage

1. Click **Connect Wallet**
2. Paste your contract address
3. Replace the example ABI with your contract ABI JSON
4. Set the read function name and JSON-array args, then click **Read Contract**
5. Set the write function name and JSON-array args, optionally add ETH value, then click **Write Contract**

## Customization notes

- The default ABI and function names in `/home/runner/work/sta4/sta4/app.js` are placeholders.
- Update the example `name` and `setValue` functions to match your contract.
- Function argument fields expect JSON arrays:
  - `[]`
  - `["hello"]`
  - `["0xabc...", 1]`

## Deployment

Because this is plain HTML/CSS/JavaScript, you can deploy it as a static site with GitHub Pages, Netlify, Vercel static output, or any basic web server.
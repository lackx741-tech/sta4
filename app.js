const defaultAbi = [
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "newValue", type: "string" }],
    name: "setValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const defaultState = {
  contractAddress: "",
  readFunctionName: "name",
  readFunctionArgs: "[]",
  writeFunctionName: "setValue",
  writeFunctionArgs: '["hello"]',
  writeValue: "0",
};

const elements = {
  connectWallet: document.getElementById("connect-wallet"),
  walletStatus: document.getElementById("wallet-status"),
  walletAddress: document.getElementById("wallet-address"),
  contractAddress: document.getElementById("contract-address"),
  contractAbi: document.getElementById("contract-abi"),
  readFunctionName: document.getElementById("read-function-name"),
  readFunctionArgs: document.getElementById("read-function-args"),
  readResult: document.getElementById("read-result"),
  writeFunctionName: document.getElementById("write-function-name"),
  writeFunctionArgs: document.getElementById("write-function-args"),
  writeValue: document.getElementById("write-value"),
  writeResult: document.getElementById("write-result"),
  readContract: document.getElementById("read-contract"),
  writeContract: document.getElementById("write-contract"),
};

let browserProvider;
let signer;
let currentAddress = "";

function setDefaults() {
  elements.contractAbi.value = JSON.stringify(defaultAbi, null, 2);
  elements.contractAddress.value = defaultState.contractAddress;
  elements.readFunctionName.value = defaultState.readFunctionName;
  elements.readFunctionArgs.value = defaultState.readFunctionArgs;
  elements.writeFunctionName.value = defaultState.writeFunctionName;
  elements.writeFunctionArgs.value = defaultState.writeFunctionArgs;
  elements.writeValue.value = defaultState.writeValue;
}

function formatValue(value) {
  return JSON.stringify(
    value,
    (_, nestedValue) => {
      if (typeof nestedValue === "bigint") {
        return nestedValue.toString();
      }
      return nestedValue;
    },
    2
  );
}

function parseJsonArray(rawValue, label) {
  let parsedValue;

  try {
    parsedValue = JSON.parse(rawValue || "[]");
  } catch (error) {
    throw new Error(`${label} must be valid JSON.`);
  }

  if (!Array.isArray(parsedValue)) {
    throw new Error(`${label} must be a JSON array.`);
  }

  return parsedValue;
}

function getContractConfig() {
  const contractAddress = elements.contractAddress.value.trim();

  if (!ethers.isAddress(contractAddress)) {
    throw new Error("Enter a valid EVM contract address.");
  }

  let abi;

  try {
    abi = JSON.parse(elements.contractAbi.value);
  } catch (error) {
    throw new Error("Contract ABI must be valid JSON.");
  }

  return { contractAddress, abi };
}

async function ensureWalletConnection() {
  if (!window.ethereum) {
    throw new Error("No EVM wallet detected. Install MetaMask or another injected wallet.");
  }

  if (!browserProvider) {
    browserProvider = new ethers.BrowserProvider(window.ethereum);
  }

  if (!signer) {
    await browserProvider.send("eth_requestAccounts", []);
    signer = await browserProvider.getSigner();
  }

  currentAddress = await signer.getAddress();
  elements.walletStatus.textContent = "Connected";
  elements.walletAddress.textContent = currentAddress;
}

async function connectWallet() {
  try {
    await ensureWalletConnection();
  } catch (error) {
    elements.walletStatus.textContent = error.message;
    elements.walletAddress.textContent = "-";
  }
}

async function readContract() {
  elements.readResult.textContent = "Reading contract...";

  try {
    await ensureWalletConnection();
    const { contractAddress, abi } = getContractConfig();
    const functionName = elements.readFunctionName.value.trim();
    const args = parseJsonArray(elements.readFunctionArgs.value, "Read function args");
    const contract = new ethers.Contract(contractAddress, abi, browserProvider);
    const result = await contract[functionName](...args);

    elements.readResult.textContent = formatValue(result);
  } catch (error) {
    elements.readResult.textContent = error.message;
  }
}

async function writeContract() {
  elements.writeResult.textContent = "Sending transaction...";

  try {
    await ensureWalletConnection();
    const { contractAddress, abi } = getContractConfig();
    const functionName = elements.writeFunctionName.value.trim();
    const args = parseJsonArray(elements.writeFunctionArgs.value, "Write function args");
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const writeValue = elements.writeValue.value.trim();
    const overrides = writeValue ? { value: ethers.parseEther(writeValue) } : {};
    const transaction = await contract[functionName](...args, overrides);
    const receipt = await transaction.wait();

    elements.writeResult.textContent = formatValue({
      transactionHash: transaction.hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status,
    });
  } catch (error) {
    elements.writeResult.textContent = error.message;
  }
}

function watchWalletEvents() {
  if (!window.ethereum) {
    return;
  }

  window.ethereum.on("accountsChanged", async (accounts) => {
    if (!accounts.length) {
      signer = null;
      currentAddress = "";
      elements.walletStatus.textContent = "Not connected";
      elements.walletAddress.textContent = "-";
      return;
    }

    signer = null;
    await ensureWalletConnection();
  });

  window.ethereum.on("chainChanged", () => {
    signer = null;
  });
}

setDefaults();
watchWalletEvents();

elements.connectWallet.addEventListener("click", connectWallet);
elements.readContract.addEventListener("click", readContract);
elements.writeContract.addEventListener("click", writeContract);

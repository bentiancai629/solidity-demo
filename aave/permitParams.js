import { signTypedData_v4 } from 'eth-sig-util'
import { fromRpcSig } from 'ethereumjs-util'

// ... other imports

import AaveTokenAbi from "./AaveTokenAbi.json"

// ... setup your web3 provider

const aaveTokenAddress = "AAVE_TOKEN_ADDRESS"
const aaveTokenContract = new web3.eth.Contract(AaveTokenAbi, aaveTokenAddress)

const privateKey = "YOUR_PRIVATE_KEY_WITHOUT_0x"
const chainId = 1
const owner = "OWNER_ADDRESS"
const spender = "SPENDER_ADDRESS"
const value = 100 // Amount the spender is permitted
const nonce = 1 // The next valid nonce, use `_nonces()`
const deadline = 1600093162

const permitParams = {
  types: {
    EIP712Domain: [
      { name: "name", type: "string" },
      { name: "version", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ],
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  },
  primaryType: "Permit",
  domain: {
    name: "Aave Token",
    version: "1",
    chainId: chainId,
    verifyingContract: aaveTokenAddress,
  },
  message: {
    owner,
    spender,
    value,
    nonce,
    deadline,
  },
}

const signature = signTypedData_v4(
  Buffer.from(privateKey, "hex"),
  { data: permitParams }
)

const { v, r, s } = fromRpcSig(signature)

await aaveTokenContract.methods
    .permit({
      owner,
      spender,
      value,
      deadline,
      v,
      r,
      s
    })
    .send()
    .catch((e) => {
        throw Error(`Error permitting: ${e.message}`)
    })
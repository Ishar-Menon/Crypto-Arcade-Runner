# Game-Oasis-Hackathon---Cryto-Arcade-Runner-
A blockchain based unity3d game built using Matic network and Nodejs.

## Requirements
1. nodejs (8 or above)
2. Unity3d (2019.2.8f1)
3. Matic.js
4. Metamask
## Installation instructions:
1. Create two accounts on metamask which are connected to both the ropsten network and Matic testnet.
    Instruction for the same can be found at : https://docs.matic.network/getting-started/

2. The First account acts as the user account who plays the game against our company which is the second account.

3. Update the account address information and private key in the config.js file in the backend folder and update the account information of the user in the unity scipts namely :   BteMatchScript.cs,GameManager1.cs

4. Update the WEB_URL in BteMatchScript.cs,GameManager1.cs, as the address of the node js server.

5. Build the unity project and get the executable

## Running instructions:
1. Inside the Backend run :  
        `  npm install `  
        `npm run dev `
2. Run the unity executable and enjoy.

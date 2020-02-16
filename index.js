let ethers = require('ethers')
let DappFunderABI = require('./DappFunder.json').abi

const funderContractAddress = "0xA45b491B7070c81a494cD8E03c5ddF37B6edF27A"

exports.handler = async (ev) => {

    if (ev.httpMethod === 'GET') {
        return success({please: "use POST"})
    } else if (ev.httpMethod === 'POST') {
        const body = JSON.parse(ev.body)

        // parse metatx info
        const { encodedMTX, signature } = body;

        // verify we want to pay for it
        let provider = ethers.getDefaultProvider("rinkeby")
        const funderContract = new ethers.Contract(funderContractAddress, DappFunderABI, provider)

        // sendTransaction
        console.log(process.env.SIGNER_PRIV_KEY)
        const signerWallet = new ethers.Wallet(process.env.SIGNER_PRIV_KEY, provider)

        let connected = funderContract.connect(signerWallet)
        let tx = await connected.executeMetaTransaction(encodedMTX, signature)

        return success({ tx })
    }
    

    
}

const fail = (reason, code) => {
    return {
        headers: {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: code || 400,
        body: JSON.stringify({ error: reason }),
    }
}
const success = (s) => {
    return {
        headers: {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: JSON.stringify(s) || "ok",
    }
}
let ethers = require('ethers')
let metaProxyABI = require('./MetaProxy.json').abi

const metaProxyAddress = "0xA45b491B7070c81a494cD8E03c5ddF37B6edF27A"

exports.handler = async (ev) => {

    if (ev.httpMethod === 'GET') {
        return success({please: "use POST"})
    } else if (ev.httpMethod === 'POST') {
        const body = JSON.parse(ev.body)

        // parse metatx info
        const { metaTx } = body;

        // verify we want to pay for it
        let provider = ethers.getDefaultProvider("rinkeby")
        const metaProxyContract = new ethers.Contract(metaProxyAddress, metaProxyABI, provider)
        let mtxObj = await metaProxyContract.rawToMetaTx(metaTx)
        console.log(mtxObj)
        let metaSignerAddress = await metaProxyContract.verifySigner(mtxObj)
        console.log(metaSignerAddress)
        
        try {
            let funcSig = mtxObj.data.slice(0, 10)
            let data = "0x" + mtxObj.data.slice(10)
            console.log("funcSig", funcSig)
            let abiCoder = ethers.utils.defaultAbiCoder
            let decoded = abiCoder.decode(["bytes32", "string", "address", "address", "bytes"], data)
            console.log(decoded)
        } catch (error) {
            console.log("shit")
        }

        // sendTransaction
        // return txId
        console.log(process.env.SIGNER_PRIV_KEY)
        const signerWallet = new ethers.Wallet(process.env.SIGNER_PRIV_KEY, provider)

        let connected = metaProxyContract.connect(signerWallet)
        let tx = await connected.proxy(metaTx)

        return success({ tx })
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
    
}
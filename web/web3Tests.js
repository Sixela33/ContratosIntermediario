const { Web3 } = require('web3')
const fs = require('fs').promises

var url = 'http://127.0.0.1:8545/'

const web3 = new Web3(url);

const vendedorAdress = '0xe5705df9C33d3131C9E371d51741280D95ED574f'
const vendedorPrivate = '0x03ef81f46b7b6cb8507e06e22414b131bc181d39c283cee0c2426a6dae033f41'
const compradorAdress = '0x98b5F4885b6FA8A612608e5d3BaFaD755Cca0989'
const factoryAdress = '0xaff266673cf9d5d70dee18353ac2164c34e1f980'


const pepe = async  () => {
    factoryContractABI = await fs.readFile('artifacts/contracts/ContratoInmobiliarioFactory.sol/ContratoInmobiliarioFactory.json', "utf8")
    inmoContractABI = await fs.readFile('artifacts/contracts/contratoInmobiliarioETH.sol/ContratoInmobiliarioETH.json', "utf8")

    factoryContractABI = JSON.parse(factoryContractABI)
    inmoContractABI = JSON.parse(inmoContractABI)
    contract = new web3.eth.Contract(factoryContractABI.abi, factoryAdress)
    
    // console.log("metodos del contrato", contract.methods)
    console.log("Leyendo balance de vendedor", await web3.eth.getBalance(vendedorAdress))
    
    const tx_data = await contract.methods.crearContratoETH(
        compradorAdress,
        Web3.utils.toWei('5', 'ether'), // Valor en Ether convertido a Wei
        Web3.utils.toWei('1', 'ether'), // Valor en Ether convertido a Wei
        12,
        30 * 24 * 60 * 60,
        true
    
    ).encodeABI()
    
    const nonce = await web3.eth.getTransactionCount(vendedorAdress);
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
        nonce: nonce,
        from: vendedorAdress,
        to: factoryAdress,
        gasPrice: gasPrice, // Puedes ajustar esto si lo deseas
        gas: 2000000, // Ajusta el límite de gas según sea necesario
        data: tx_data

    }

    let signedTx = await web3.eth.signTransaction(tx, vendedorPrivate)
    const txHash = await web3.eth.sendSignedTransaction(signedTx.raw);

    
    // Manejar el resultado de la transacción
    // console.log("contrato creado", txHash)
    
    reciept = await contract.methods.obtenerContratosXDireccion(vendedorAdress).call()

    // console.log("viendo datos", reciept)
    console.log(reciept[0][0])
    const inmoETHContractADD = reciept[0][0]
    inmoContract = new web3.eth.Contract(inmoContractABI.abi, inmoETHContractADD)

    console.log("metodos del contrato", inmoContract.methods)

    const tx_data2 = await inmoContract.methods.depositarColateral().encodeABI()

    const nonce2 = await web3.eth.getTransactionCount(compradorAdress)
    const gasPrice2 = await web3.eth.getGasPrice()

    const tx2 = {
        nonce: nonce2,
        from: compradorAdress,
        to: inmoETHContractADD,
        gasPrice: gasPrice2, // Puedes ajustar esto si lo deseas
        gas: 2000000, // Ajusta el límite de gas según sea necesario
        data: tx_data2,
        value: Web3.utils.toWei('5', 'ether')
    }

    let signedTx2 = await web3.eth.signTransaction(tx2, tx2.from)
    const txHash2 = await web3.eth.sendSignedTransaction(signedTx2.raw);
    console.log(txHash2)

}  

pepe()
const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("ContratoInmobiliarioETH - Reclamar Colateral", function () {
    let contratoInmobiliarioETH
    let comprador
    let vendedor
    let intermediario
    const depositoColateral = ethers.parseEther("5")
    const montoMensual = ethers.parseEther("1")
    const cantidadPagos = 12
    const plazoPagoDias = 30 * 24 * 60 * 60
    const intermediarioActivo = true

    beforeEach(async function () {
        [intermediario, comprador, vendedor] = await ethers.getSigners()

        const ContratoInmobiliarioETHFactory = await ethers.getContractFactory("ContratoInmobiliarioETH");
        contratoInmobiliarioETH = await ContratoInmobiliarioETHFactory.deploy(
            comprador.address,
            vendedor.address,
            depositoColateral,
            montoMensual,
            cantidadPagos,
            plazoPagoDias,
            intermediarioActivo
        );

        await contratoInmobiliarioETH.waitForDeployment()

        await contratoInmobiliarioETH.connect(comprador).depositarColateral({ value: depositoColateral })
      })

    it("Debe darle el colateral al vendedor si el comprador se atraso en sus pagos", async function () {
        for (let i = 0; i < cantidadPagos - 1; i++) {
            await contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual })
            // Asegurémonos de que haya pasado suficiente tiempo para reclamar el pago
            await ethers.provider.send("evm_increaseTime", [plazoPagoDias + 100])
            await ethers.provider.send("evm_mine")
            await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()
        }

        await ethers.provider.send("evm_increaseTime", [plazoPagoDias + 100])
        await ethers.provider.send("evm_mine")
        await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()

        //const balanceCompradorDespues = await ethers.provider.getBalance(vendedor);
        const balanceContratoAntes = await ethers.provider.getBalance(contratoInmobiliarioETH.target);
        
        await contratoInmobiliarioETH.connect(vendedor).reclamarColateralIncumplimiento() 

        const balanceContratoDespues = await ethers.provider.getBalance(contratoInmobiliarioETH.target);
        
        const cantidadPagosRestantes = await contratoInmobiliarioETH.cantidadPagosRestantes();
        const pagosAcumulados = await contratoInmobiliarioETH.pagosAcumulados();
        const fechaUltimoPago = await contratoInmobiliarioETH.fechaUltimoPago();
        const compradorIncumplio = await contratoInmobiliarioETH.compradorIncumplio();
        const contratoActivo = await contratoInmobiliarioETH.contratoActivo();
        
        // Verificamos que el vendedor haya recibido el pago
        //expect(balanceVendedorDespues).to.equal(balanceVendedorAntes + montoMensual )
        // Verificamos que el contrato haya actualizado sus estados correctamente
        expect(balanceContratoAntes).to.equal(depositoColateral)
        expect(balanceContratoDespues).to.equal(0);
        expect(cantidadPagosRestantes).to.equal(1);
        expect(pagosAcumulados).to.equal(0);
        expect(fechaUltimoPago).to.be.above(0);
        expect(compradorIncumplio).to.equal(true);
        
        expect(contratoActivo).to.equal(false);
    })
})
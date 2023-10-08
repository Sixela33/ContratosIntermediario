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

    it("Debe rechazar la transaccion si todavia quedan pagos por hacer", async function () {
        await expect(contratoInmobiliarioETH.connect(comprador).reclamarColateral())
        .to.be.revertedWith("Todavia quedan pagos pendientes")
     
    })

    it("Debe rechazar la transaccion si el comprador incumplio",async function () {
        await ethers.provider.send("evm_increaseTime", [plazoPagoDias + 100]);
        await ethers.provider.send("evm_mine");
        await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()

        await expect(contratoInmobiliarioETH.connect(comprador).reclamarColateral())
        .to.be.revertedWith("En comprador se ha retrazado en los pagos")

    })


    it("Debe darle el colateral al comprador si este hizo todos sus pagos a tiempo", async function () {
        for (let i = 0; i < cantidadPagos; i++) {
            await contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual })
            // Asegurémonos de que haya pasado suficiente tiempo para reclamar el pago
            const plazoPagoSegundos = plazoPagoDias + 100
            await ethers.provider.send("evm_increaseTime", [plazoPagoSegundos + 1])
            await ethers.provider.send("evm_mine")
            await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()
        }

        //const balanceCompradorDespues = await ethers.provider.getBalance(vendedor);
        const balanceContratoAntes = await ethers.provider.getBalance(contratoInmobiliarioETH.target);
        
        await contratoInmobiliarioETH.connect(comprador).reclamarColateral() 

        const balanceContratoDespues = await ethers.provider.getBalance(contratoInmobiliarioETH.target);

        
        const cantidadPagosAReclamar = await contratoInmobiliarioETH.cantidadPagosAReclamar();
        const cantidadPagosRealizados = await contratoInmobiliarioETH.cantidadPagosRealizados();
        const fechaUltimoPago = await contratoInmobiliarioETH.fechaUltimoPago();
        const compradorIncumplio = await contratoInmobiliarioETH.compradorIncumplio();
        const contratoActivo = await contratoInmobiliarioETH.contratoActivo();
        
        // Verificamos que el vendedor haya recibido el pago
        //expect(balanceVendedorDespues).to.equal(balanceVendedorAntes + montoMensual )
        // Verificamos que el contrato haya actualizado sus estados correctamente
        expect(balanceContratoAntes).to.equal(depositoColateral)
        expect(balanceContratoDespues).to.equal(0);
        expect(cantidadPagosAReclamar).to.equal(0);
        expect(cantidadPagosRealizados).to.equal(cantidadPagos);
        expect(compradorIncumplio).to.equal(false);
        expect(contratoActivo).to.equal(false);
    })
})
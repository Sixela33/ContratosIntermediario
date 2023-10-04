const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Funciones del contrato base", function () {
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
    });

    describe("Deployment", function () {
        it("Debe setear el estado inicial", async function () {
            expect(await contratoInmobiliarioETH.vendedor()).to.equal(vendedor.address);
            expect(await contratoInmobiliarioETH.comprador()).to.equal(comprador.address);
            expect(await contratoInmobiliarioETH.depositoColateral()).to.equal(depositoColateral);
            expect(await contratoInmobiliarioETH.montoMensual()).to.equal(montoMensual);
            expect(await contratoInmobiliarioETH.cantidadPagosRestantes()).to.equal(cantidadPagos);
            expect(await contratoInmobiliarioETH.plazoPagoDias()).to.equal(plazoPagoDias);
            expect(await contratoInmobiliarioETH.intermediarioActivo()).to.equal(intermediarioActivo);
            expect(await contratoInmobiliarioETH.colateralFueDepositado()).to.equal(false);

        })
    })
})
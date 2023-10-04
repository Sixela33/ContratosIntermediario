const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Funciones del contrato pre colateral", function () {
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

    describe("ContratoInmobiliarioETH - Depositar Colateral", function () {
        it("Debe permitir al comprador depositar el colateral correctamente", async function () {
            const colateralFueDepositadoAntes = await contratoInmobiliarioETH.colateralFueDepositado();
    
            await contratoInmobiliarioETH.connect(comprador).depositarColateral({ value: depositoColateral })
    
            const colateralFueDepositadoDespues = await contratoInmobiliarioETH.colateralFueDepositado();
    
            expect(colateralFueDepositadoAntes).to.equal(false);
            expect(colateralFueDepositadoDespues).to.equal(true);
        });
    
        it("Debe revertir si el colateral ya fue depositado previamente", async function () {
    
            await contratoInmobiliarioETH.connect(comprador).depositarColateral({ value: depositoColateral });
    
            await expect(contratoInmobiliarioETH.connect(comprador).depositarColateral({ value: depositoColateral }))
            .to.be.revertedWith("El colateral ya fue depositado");
        });
    
        it("Debe revertir si el monto depositado es incorrecto", async function () {
            const montoColateral = depositoColateral + ethers.parseEther("3"); // Monto incorrecto
    
            await expect(contratoInmobiliarioETH.connect(comprador).depositarColateral({ value: montoColateral }))
            .to.be.revertedWith("Monto Erroneo");
        });
    });

    describe("ContratoInmobiliarioETH - realizarPagoMensual", function () {
        it("Debe revertir si el colateral no fue depositado", async function () {
        
        await expect(contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual })
        ).to.be.revertedWith("El comprador debe depositar el colateral")
        });
    })
});

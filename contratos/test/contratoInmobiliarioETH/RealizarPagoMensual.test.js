const { expect } = require("chai")
const { ethers } = require("hardhat")


describe("ContratoInmobiliarioETH - Realizar Pago Mensual", function () {
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

      it("Debe permitir al comprador realizar el pago mensual correctamente", async function () {

          const balanceContratoAntes = await ethers.provider.getBalance(contratoInmobiliarioETH.target);
          await contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual });
          const balanceContratoDespues =await ethers.provider.getBalance(contratoInmobiliarioETH.target);
          const cantidadPagosRealizados = await contratoInmobiliarioETH.cantidadPagosRealizados();

          expect(balanceContratoDespues).to.equal(balanceContratoAntes + montoMensual);
          expect(cantidadPagosRealizados).to.equal(1);

      });
  
      it("Debe revertir si el contrato está inactivo", async function () {
        await contratoInmobiliarioETH.connect(intermediario).desactivarContrato();
        await expect(
          contratoInmobiliarioETH
            .connect(comprador)
            .realizarPagoMensual({ value: montoMensual })
        ).to.be.revertedWith("El contrato se encuentra inactivo")
      });
  
      
  
      it("Debe revertir si el monto de transacción es incorrecto", async function () {
        const montoIncorrecto = montoMensual + ethers.parseEther("3")
  
        await expect(
          contratoInmobiliarioETH
            .connect(comprador)
            .realizarPagoMensual({ value: montoIncorrecto })
        ).to.be.revertedWith("Monto de transaccion invaldio");
      });
    
})

const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("ContratoInmobiliarioETH - Reclamar Pago Mensual", function () {

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


    it("Debe permitir al vendedor reclamar el pago mensual correctamente", async function () {
      // Asegurémonos de que se haya pasado suficiente tiempo para reclamar el pago
      await contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual })

      const plazoPagoSegundos = plazoPagoDias + 100; // 10 segundos despues de que paso el tiempo
      await ethers.provider.send("evm_increaseTime", [plazoPagoSegundos + 1]);
      await ethers.provider.send("evm_mine");

      const balanceContratoAntes = await ethers.provider.getBalance(contratoInmobiliarioETH.target);

      const reciept = await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual();

      const balanceContratoDespues = await ethers.provider.getBalance(contratoInmobiliarioETH.target);

      const cantidadPagosAReclamar = await contratoInmobiliarioETH.cantidadPagosAReclamar();
      const compradorIncumplio = await contratoInmobiliarioETH.compradorIncumplio();
      const contratoActivo = await contratoInmobiliarioETH.contratoActivo();

      expect(balanceContratoDespues).to.equal(balanceContratoAntes - montoMensual)
      expect(cantidadPagosAReclamar).to.equal(cantidadPagos - 1);
      expect(compradorIncumplio).to.equal(false);
      expect(contratoActivo).to.equal(true);
    });

    it("Debe revertir si no ha pasado suficiente tiempo para reclamar el pago", async function () {
      // Configuramos el tiempo para que no haya pasado suficiente tiempo
      const plazoPagoSegundos = plazoPagoDias - 10000; // 100 segundos antes de que paso el tiempo
      await ethers.provider.send("evm_increaseTime", [plazoPagoSegundos]);
      await ethers.provider.send("evm_mine");

      await expect(contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()).to.be.revertedWith("Todavia no puede reclamar su pago");
    });

    it("Debe revertir si ya se realizaron todos los pagos", async function () {
      // Configuramos el contrato para que ya se hayan realizado todos los pagos
      for (let i = 0; i < cantidadPagos; i++) {
        await contratoInmobiliarioETH.connect(comprador).realizarPagoMensual({ value: montoMensual })
        // Asegurémonos de que haya pasado suficiente tiempo para reclamar el pago
        await ethers.provider.send("evm_increaseTime", [plazoPagoDias + 1])
        await ethers.provider.send("evm_mine")
        await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()
      }
      await ethers.provider.send("evm_increaseTime", [plazoPagoDias + 1])
      await ethers.provider.send("evm_mine")

    await expect(contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()).to.be.revertedWith("Ya se relizaron todos los pagos");

    });

    it("Debe revertir si el contrato no tiene suficiente balance para realizar el pago", async function () {
        // Asegurémonos de que haya pasado suficiente tiempo para reclamar el pago
        
        const plazoPagoSegundos = plazoPagoDias + 10;
        await ethers.provider.send("evm_increaseTime", [plazoPagoSegundos + 1]);
        await ethers.provider.send("evm_mine");

        // Intentemos que el vendedor reclame el pago, lo que setearia al comprador como moroso
        await contratoInmobiliarioETH.connect(vendedor).reclamarPagoMensual()
        expect(await contratoInmobiliarioETH.compradorIncumplio()).to.equal(true)
        expect(await contratoInmobiliarioETH.contratoActivo()).to.equal(false)
    });
  });
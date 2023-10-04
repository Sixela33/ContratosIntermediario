const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Funciones del contrato base", function () {

    let ContratoFactory
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

        const ContratoFactoryFactory = await ethers.getContractFactory("ContratoInmobiliarioFactory");
        ContratoFactory = await ContratoFactoryFactory.deploy();

        await ContratoFactory.waitForDeployment()
        
        
    })

    it("deberia crear un nuevo contrato", async function () {
        await ContratoFactory.connect(vendedor).crearContratoETH(
            comprador.address,
            depositoColateral,
            montoMensual,
            cantidadPagos,
            plazoPagoDias,
            intermediarioActivo
            )
        
        let contratosCreados = await ContratoFactory.obtenerContratosXDireccion(vendedor);
        contratosCreados = contratosCreados[0]
        
        expect(contratosCreados.length).to.equal(1, "Debería haber un contrato creado")
        
        const contrato = await ethers.getContractAt("ContratoInmobiliarioETH", contratosCreados[0])
        // Verificar que el vendedor sea la dirección del contrato
        
        const contratoVendedor = await contrato.vendedor();
        expect(contratoVendedor).to.equal(vendedor.address, "El vendedor debería ser la dirección del contrato") 
    })

    it("Prueba de recuperación de contratos por usuario", async function () {
        const contratosVendedor = 3
        const contratosComprador = 10

        for (let i = 0; i < contratosVendedor; i++) {
            await ContratoFactory.connect(vendedor).crearContratoETH(
                comprador.address,
                depositoColateral,
                montoMensual,
                cantidadPagos,
                plazoPagoDias,
                intermediarioActivo
                )
        }

        const contratosCreadosVendedor = await ContratoFactory.obtenerContratosXDireccion(vendedor);
        expect(contratosCreadosVendedor[0].length).to.equal(contratosVendedor, "")

        for (let i = 0; i < contratosComprador; i++) {
            await ContratoFactory.connect(comprador).crearContratoETH(
                vendedor.address,
                depositoColateral,
                montoMensual,
                cantidadPagos,
                plazoPagoDias,
                intermediarioActivo
            )
        }

        const contratosCreadosComprador = await ContratoFactory.obtenerContratosXDireccion(comprador);

        expect(contratosCreadosComprador[0].length).to.equal(contratosComprador, "")
        expect(contratosCreadosComprador[1].length).to.equal(contratosVendedor, "")

    })
})
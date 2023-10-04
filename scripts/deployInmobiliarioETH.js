// scripts/deployContratoInmobiliarioETH.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Define los parámetros del contrato
  const comprador = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Dirección del comprador
  const vendedor = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";   // Dirección del vendedor
  const depositoColateral = ethers.parseEther("5"); // El valor del colateral en ETH (ajustado según tu contrato)
  const montoMensual = ethers.parseEther("5");   // El monto mensual en ETH (ajustado según tu contrato)
  const cantidadPagos = 12;    // La cantidad de pagos
  const plazoPagoDias = 30 * 24 * 60 * 60;   // El plazo en días (ajustado según tu contrato)
  const activo = true;         // Indica si el intermediario está activo

  // Despliega el contrato
  const contratoInmobiliarioETH = await ethers.deployContract("ContratoInmobiliarioETH",
    [comprador,
    vendedor,
    depositoColateral,
    montoMensual,
    cantidadPagos,
    plazoPagoDias,
    activo]
  );

  await contratoInmobiliarioETH.waitForDeployment();

  console.log("Contrato Inmobiliario ETH desplegado en:", contratoInmobiliarioETH.target);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
  });

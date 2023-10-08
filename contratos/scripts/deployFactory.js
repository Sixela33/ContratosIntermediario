// scripts/deployContratoInmobiliarioETH.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Despliega el contrato
  const contratoInmobiliarioETH = await ethers.deployContract("ContratoInmobiliarioFactory");

  await contratoInmobiliarioETH.waitForDeployment();

  console.log("Contrato Inmobiliario ETH desplegado en:", contratoInmobiliarioETH.target);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
  });

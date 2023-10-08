import React, { useState } from 'react'
import { ethers } from "ethers";
import factoryABI from './FactoryABI.json' 
import inmobiliarioABI from './ContratoInmobiliario.json'

export default function Metamask() {
    const [signer, setSigner] = useState()
    const [provider, setProvider] = useState()
    const [contratoFactory, setFactory] = useState()
    const [contratosUsuario, setContratos] = useState()

    const factoryAdress = '0x36725C46a5aA065115A2ee279C84c87F7Ffc69aa'

    const coneccion = async () => {
        let providerTemp
        let signerTemp
        if (window.ethereum == null) {

            console.log("MetaMask not installed; using read-only defaults")
            providerTemp = ethers.getDefaultProvider()
        
        } else {
            
            providerTemp = new ethers.BrowserProvider(window.ethereum)
            setProvider(providerTemp)
            signerTemp = await providerTemp.getSigner();
            setSigner(signerTemp)
            console.log(providerTemp)
            console.log(signerTemp)

            setFactory(new ethers.Contract(factoryAdress, factoryABI.abi))

        }
    }

    const crearContrato = async () => {
        // Asegúrate de que haya un signer válido
        if (signer) {
            try {
                const tx = await contratoFactory.connect(signer).crearContratoETH(
                    '0xf2dCF83256063355B34619582000AdF6894CAFbb',
                    ethers.parseEther('6'),
                    ethers.parseEther('1'),
                    12,
                    30 * 24 * 60 * 60,
                    false
                );
                let reciept = await tx.wait(); // Espera a que la transacción se confirme
                console.log("Contrato creado con éxito.");
                console.log("recibo: ", reciept)
            } catch (error) {
                console.error("Error al crear el contrato:", error);
            }
        } else {
            console.error("No se ha conectado un signer válido.");
        }
    }

    const getContratos = async () => {
        if (signer) {
            try {
                const resultado = await contratoFactory.connect(signer).obtenerDatosDeCOntratos(signer.address)
                console.log("Contrato creado con éxito.");
                console.log("recibo: ", resultado)

                setContratos(resultado)

            } catch (error) {
                console.log(error)
            }
        }
    }

    const depositarColateral = async (event) => {
        let direccion = event.currentTarget.getAttribute("data-value")
        console.log(direccion)
        const contratoInmo = new ethers.Contract(direccion, inmobiliarioABI.abi)
        console.log("aaa")
        try {
            const tx = await contratoInmo.connect(signer).depositarColateral({value: ethers.parseEther('6')})
            console.log(tx)
        } catch (error) {
                console.log(error)
        }
    }

    const realizarPagoMensual = async (event) =>{
        let direccion = event.currentTarget.getAttribute("data-value")
        const contratoInmo = new ethers.Contract(direccion, inmobiliarioABI.abi)
        try {
            const tx = await contratoInmo.connect(signer).realizarPagoMensual({value: ethers.parseEther('1')})
            console.log(tx)
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div>
            <button onClick={coneccion}>conect</button>
            <br></br>
            <button onClick={crearContrato}>Crear Contrato</button>
            <br></br>
            <button onClick={getContratos}>get Contratos</button>
            <br></br>
            {contratosUsuario && contratosUsuario.map((contratos, index) => {
                return(
                    <>
                        <h1>{index}</h1>
                        
                        {contratos.map(contrato => {
                            return(
                            <>
                                <p>{contrato[2].toString()}</p>
                                <button data-value={contrato[2]} onClick={depositarColateral}>Depositar Colateral</button>
                                <button data-value={contrato[2]} onClick={realizarPagoMensual}>Realizar Pago mensual</button>
                            </>)
                        })}
                    </>
                )
                
            })}
        </div>
    )
}

import React, {useState, useContext, useEffect} from 'react'
import { MetamaskContext } from '../../Context/MetamaskContext';
import { ethers } from 'ethers';
import inmobiliarioABI from './ContratoInmobiliario.json'

export default function GetContratos() {
    const { signer, connectWallet, contratoFactory } = useContext(MetamaskContext);

    const [contratosUsuario, setContratos] = useState()

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

    useEffect(() => {
        getContratos()
    }, signer)


  return (
    <div>
        {contratosUsuario && contratosUsuario.map((contratos, index) => {
                console.log(contratos)
                return(
                    <>
                        <h1>{index}</h1>
                        
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th scope='col'>comprador</th>
                                    <th scope='col'>vendedor</th>
                                    <th scope='col'>direccion</th>
                                    <th scope='col'>depositoColateral</th>
                                    <th scope='col'>montoMensual</th>
                                    <th scope='col'>cantidadPagosTotales</th>
                                    <th scope='col'>plazoPagoDias</th>
                                    <th scope='col'>fechaUltimoPago</th>
                                    <th scope='col'>contratoActivo</th>
                                    <th scope='col'>compradorIncumplio</th>
                                    <th scope='col'>intermediarioActivo</th>
                                    <th scope='col'>tokenAddress</th>
                                    <th scope='col'>acciones</th>

                                </tr>
                            </thead>
                            <tbody>

                                {contratos.map(contrato => {
                                    return(
                                        <>
                                        
                                        <tr>
                                            {contrato.map(item => {
                                                return(
                                                    <td>{item.toString()}</td>
                                                )
                                            })}
                                            {/*<p>{contrato[2].toString()}</p>*/}
                                            <td className='d-flex'><button data-value={contrato[2]} onClick={depositarColateral} >Depositar Colateral</button>
                                            <button data-value={contrato[2]} onClick={realizarPagoMensual}>Realizar Pago mensual</button></td>
                                        </tr>
                                        </>
                                    )
                                })}
                            </tbody>
                        </table>
                    </>
                )
                
            })}
    </div>
  )
}

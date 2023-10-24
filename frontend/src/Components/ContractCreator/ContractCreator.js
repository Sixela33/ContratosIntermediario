import React, {useState, useContext} from 'react'
import { ethers } from 'ethers';
import { MetamaskContext } from '../../Context/MetamaskContext';

export default function ContractCreator() {
    const { signer, connectWallet, contratoFactory } = useContext(MetamaskContext);

    const [formValues, setFormValues] = useState({
        comprador: '0x26919c4B77ED49670dAa76A9212863f0EECa5aef',
        colateral: 0,
        mensual: 0,
        cantidad: 0,
        plazo: 0,
        intermediario: false,
        });

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const crearContrato = async (event) => {
        event.preventDefault();

        // Usar los valores del estado en lugar de event.target
        const {
          comprador,
          colateral,
          mensual,
          cantidad,
          plazo,
          intermediario,
        } = formValues;
        
        if (signer) {
            try {
                const tx = await contratoFactory.connect(signer).crearContratoETH(
                    comprador,
                    ethers.parseEther(colateral.toString()),
                    ethers.parseEther(mensual.toString()),
                    cantidad,
                    plazo * 24 * 60 * 60,
                    intermediario
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


    return (
    <form onSubmit={crearContrato}>
        <label htmlFor="comprador">Comprador: </label>
        <input type="text" id="comprador" name="comprador" onChange={handleInputChange} value={formValues.comprador}/>
        <br/>

        <label htmlFor="colateral">Colateral (ETH): </label>
        <input type="number" id="colateral" name="colateral" onChange={handleInputChange} value={formValues.colateral}/>
        <br/>

        <label htmlFor="mensual">monto pago mensual (ETH): </label>
        <input type="number" id="mensual" name="mensual" onChange={handleInputChange} value={formValues.mensual}/>
        <br/>

        <label htmlFor="cantidad">cantidad Pagos: </label>
        <input type="number" id="cantidad" name="cantidad" onChange={handleInputChange} value={formValues.cantidad}/>
        <br/>

        <label htmlFor="plazo">plazo entre Pagos: (Dias) </label>
        <input type="number" id="plazo" name="plazo" onChange={handleInputChange} value={formValues.plazo}/>
        <br/>
        <label htmlFor="intermediario">intermediarioActivo: </label>
        <input type="checkbox" id="intermediario" name="intermediario" onChange={handleInputChange} value={formValues.intermediario}/>

        <button type="submit">Submit</button>

    </form>
    )
}

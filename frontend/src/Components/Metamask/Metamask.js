import React, { useState, useContext } from 'react'
import { ethers } from "ethers";
import { MetamaskContext } from '../../Context/MetamaskContext';
import ContractCreator from '../ContractCreator/ContractCreator';
import GetContratos from '../GetContratos/GetContratos';

export default function Metamask() {
    // se usa este obj para firmar transacciones
    const { signer, connectWallet, contratoFactory } = useContext(MetamaskContext);

    // El provider es tipo un signer pero que solo puede leer la blockchain
    //const [provider, setProvider] = useState()
    const [contratosUsuario, setContratos] = useState()

    // El factory hay que deployarlo antes de correr el frontend    
    
    // Consigue los datos de todos los contratos en los que está involuicrada la direccion que está logueada
    // como comrador y vendedor, de cada contrato se sabe lo siguiente: 
    /*
        comprador: comprador,
        vendedor: vendedor,
        direccion: address(this),
        depositoColateral: depositoColateral,
        montoMensual: montoMensual,
        cantidadPagosTotales: cantidadPagosTotales,
        plazoPagoDias: plazoPagoDias,
        fechaUltimoPago: fechaUltimoPago,
        contratoActivo: contratoActivo,
        compradorIncumplio: compradorIncumplio,
        intermediarioActivo: intermediarioActivo,
        tokenAddress: tokenAddress
    */

    return (
        <div>
           
            <br></br>
            <ContractCreator/>
            <br></br>
            <br></br>
            <GetContratos/>
        </div>
    )
}

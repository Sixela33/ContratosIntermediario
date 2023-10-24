import { createContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import factoryABI from './FactoryABI.json' 

export const MetamaskContext = createContext(null)

export const MetamaskProvider = ({ children }) => {
    const [signer, setSigner] = useState()

    const factoryAdress = '0x1b5a1992CC700d2ee2C8cFBBBFbAaE18aa15A69f'
    const contratoFactory = new ethers.Contract(factoryAdress, factoryABI.abi)

    const connectWallet = async () => {
        let providerTemp
        let signerTemp
        if (window.ethereum == null) {

            console.log("MetaMask not installed; using read-only defaults")
            providerTemp = ethers.getDefaultProvider()
        
        } else {
            
            providerTemp = new ethers.BrowserProvider(window.ethereum)
            signerTemp = await providerTemp.getSigner();
            setSigner(signerTemp)
        }
    }

    return (
        <MetamaskContext.Provider value={{ signer, connectWallet, contratoFactory }}>
            {children}
        </MetamaskContext.Provider>
    )
}
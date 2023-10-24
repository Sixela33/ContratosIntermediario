import './App.css';
import Metamask from './Components/Metamask/Metamask';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ContractCreator from './Components/ContractCreator/ContractCreator';
import GetContratos from './Components/GetContratos/GetContratos';

function App() {
  return (
    <div className="App">
      
        <BrowserRouter>

            <Navbar/>
            <Routes>
              <Route exact path="/" element={<GetContratos/>} />
              <Route exact path="/create" element={<ContractCreator/>} />

            </Routes>
        </BrowserRouter>
        
    </div>
  );
}

export default App;

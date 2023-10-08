// SPDX-License-Identifier: CC-BY-NC-ND-4.0
// Copyright (c) 2023 Ramelax

// Información adicional sobre la licencia:
// - BY (Reconocimiento): Debes dar crédito al autor original (Tu Nombre) cuando utilices o compartas este contrato.
// - NC (No Comercial): No puedes utilizar este contrato con fines comerciales. No puedes ganar dinero directamente utilizando este contrato.
// - ND (No Derivados): No puedes modificar este contrato ni crear contratos derivados basados en él. Debes utilizar este contrato tal como se proporciona.

pragma solidity ^0.8.0;

abstract contract ContratoInmobiliario {

    address public vendedor;                // Billetera vendedor
    address public comprador;               // Billetera comprador
    uint256 public depositoColateral;       // Valor colateral
    uint256 public montoMensual;            // Valor a pagar por mes
    uint256 public cantidadPagosTotales;    // Cantidad de veces que debe pagar
    uint256 public cantidadPagosRealizados;
    uint256 public cantidadPagosAReclamar;
    uint256 public plazoPagoDias;           // timepo en dias entre pagos (hardcodeado a 30)
    uint256 public fechaUltimoPago;         // Fecha en la que se hizo el ultimo pago
    bool public contratoActivo;             // Esta activo el contrato
    bool public compradorIncumplio;         // El comprador intento retirar su dinero mensual y no estuvo (le da derecho a retirar el colateral)
    bool public locked;                    // Se puede interactuar con el contrato
    bool public colateralFueDepositado = false;

    bool public intermediarioActivo;
    address public factory;

    address public tokenAddress;

    struct ContractData {
        address comprador;
        address vendedor;
        address direccion;
        uint256 depositoColateral;
        uint256 montoMensual;
        uint256 cantidadPagosTotales;        
        uint256 plazoPagoDias;
        uint256 fechaUltimoPago;
        bool contratoActivo;
        bool compradorIncumplio;
        bool intermediarioActivo;
        address tokenAddress;
    }

    event PagoMensualRealizado(address indexed pagador, uint256 monto);
    event ColateralReclamadoIncumplimiento(address indexed reclamante, uint256 monto);
    event ColateralReclamado(address indexed reclamante, uint256 monto);
    event ColateralDepositado(address indexed pagador, uint256 monto);
    event CompradorIncumplido();


    constructor(
        address _comprador,
        address _vendedor,
        uint256 _depositoColateral,
        uint256 _montoMensual,
        uint256 _cantidadPagos,
        uint256 _plazoPagoDias,
        bool _intermediarioActivo
    ) {
        vendedor = _vendedor;
        comprador = _comprador;
        depositoColateral = _depositoColateral;
        montoMensual = _montoMensual;
        cantidadPagosTotales = _cantidadPagos;
        cantidadPagosAReclamar = cantidadPagosTotales;
        cantidadPagosRealizados = 0;
        plazoPagoDias = _plazoPagoDias;
        fechaUltimoPago = block.timestamp;
        contratoActivo = true;
        compradorIncumplio = false;
        locked = false;
        intermediarioActivo = _intermediarioActivo;
        factory = msg.sender;
    }

    modifier noReentrancy() {
        require(!locked, "Reentrancia detectada");
        locked = true;
        _;
        locked = false;
    }

    modifier soloVendedor() {
        require(msg.sender == vendedor, "Solo el vendedor puede llamar a esta funciOn");
        _;
    }

    modifier soloComprador() {
        require(msg.sender == comprador, "Solo el comprador puede llamar a esta funciOn");
        _;
    }

    modifier contratoActivoo() {
        require(contratoActivo, "El contrato se encuentra inactivo");
        _;
    }
    modifier colateralDepositado (){
        require (colateralFueDepositado, "El comprador debe depositar el colateral");
        _;
    }

    modifier soloFactory() {
        require(msg.sender == factory, "[Acceso Denegado]");
        require(intermediarioActivo, "[Acceso Denegado]");
        _;
    }

    function aplazarVencimiento() public virtual soloFactory    {
        fechaUltimoPago = block.timestamp;
    }

    function desactivarContrato() external soloFactory{
        contratoActivo = false;
    }

    function reactivarContrato() external soloFactory{
        contratoActivo = true;
        compradorIncumplio = false;
        aplazarVencimiento();
    }

    function getContractData() external view returns (ContractData memory) {
        return ContractData({
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
        });
    }

    function reclamarPagoMensual() external virtual soloVendedor  contratoActivoo  colateralDepositado noReentrancy{}

    function reclamarColateralIncumplimiento() external virtual soloVendedor colateralDepositado noReentrancy{}

    function reclamarColateral() external virtual soloComprador colateralDepositado noReentrancy{}

    function depositarColateral() external virtual payable soloComprador noReentrancy {}

    function realizarPagoMensual() external virtual payable soloComprador colateralDepositado noReentrancy {}

}
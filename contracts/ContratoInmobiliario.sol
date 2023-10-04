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
    uint256 public cantidadPagosRestantes;  // Cantidad de veces que debe pagar
    uint256 public plazoPagoDias;               // timepo en dias entre pagos (hardcodeado a 30)
    uint256 public plazoPago;               // timepo en dias entre pagos (hardcodeado a 30)
    uint256 public fechaUltimoPago;         // Fecha en la que se hizo el ultimo pago
    uint256 public pagosAcumulados;         // Colateral depositado en el contrato
    bool public contratoActivo;             // Esta activo el contrato
    bool public compradorIncumplio;         // El comprador intento retirar su dinero mensual y no estuvo (le da derecho a retirar el colateral)
    bool public locked;                    // Se puede interactuar con el contrato
    bool public colateralFueDepositado = false;

    bool public intermediarioActivo;
    address public factory;

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
        cantidadPagosRestantes = _cantidadPagos;
        plazoPagoDias = _plazoPagoDias;
        plazoPago = _plazoPagoDias;
        fechaUltimoPago = block.timestamp;
        contratoActivo = true;
        compradorIncumplio = false;
        locked = false;
        pagosAcumulados = 0;
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

    modifier contratoActivoNoIncumplido() {
        require(contratoActivo && !compradorIncumplio, "El contrato no esta activo o el comprador ha incumplido");
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

    function aplazarVencimiento() external virtual soloFactory    {
        fechaUltimoPago = block.timestamp;
    }

    function desactivarContrato() external soloFactory{
        contratoActivo = false;
    }

    function reclamarPagoMensual() external soloVendedor virtual contratoActivoNoIncumplido noReentrancy colateralDepositado {}

    function reclamarColateralIncumplimiento() external soloVendedor virtual noReentrancy colateralDepositado {}

    function reclamarColateral() external virtual soloComprador noReentrancy colateralDepositado{}

    function depositarColateral() external virtual payable soloComprador {}

    function realizarPagoMensual() external virtual payable soloComprador colateralDepositado{}

}
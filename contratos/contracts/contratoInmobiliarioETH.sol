// SPDX-License-Identifier: CC-BY-NC-ND-4.0
// Copyright (c) 2023 Ramelax

// Información adicional sobre la licencia:
// - BY (Reconocimiento): Debes dar crédito al autor original (Tu Nombre) cuando utilices o compartas este contrato.
// - NC (No Comercial): No puedes utilizar este contrato con fines comerciales. No puedes ganar dinero directamente utilizando este contrato.
// - ND (No Derivados): No puedes modificar este contrato ni crear contratos derivados basados en él. Debes utilizar este contrato tal como se proporciona.

pragma solidity ^0.8.0;

import "./ContratoInmobiliario.sol";

contract ContratoInmobiliarioETH is ContratoInmobiliario {

    constructor(
        address _comprador,
        address _vendedor,
        uint256 _depositoColateral,
        uint256 _montoMensual,
        uint256 _cantidadPagos,
        uint256 _plazoPagoDias,
        bool _intermediarioActivo
    ) ContratoInmobiliario(
        _comprador,
        _vendedor,
        _depositoColateral,
        _montoMensual,
        _cantidadPagos,
        _plazoPagoDias,
        _intermediarioActivo
    ) {

    }
    
    function reclamarPagoMensual() external override soloVendedor contratoActivoo  colateralDepositado noReentrancy {
        require(!compradorIncumplio, "El comprador ha incumplido y el vendedor puede reclamar el colateral.");
        require(block.timestamp - fechaUltimoPago >= plazoPagoDias, "Todavia no puede reclamar su pago");
        require(cantidadPagosAReclamar > 0, "Ya se relizaron todos los pagos"); 

        uint256 balanceMinimo = montoMensual + depositoColateral;

        if (address(this).balance < balanceMinimo) {
            compradorIncumplio = true;
            contratoActivo = false;
            emit CompradorIncumplido();
        } else {
            cantidadPagosAReclamar -= 1;
            fechaUltimoPago = block.timestamp;
            payable(vendedor).transfer(montoMensual);
            emit PagoMensualRealizado(msg.sender, montoMensual);
        }
    }

    function reclamarColateralIncumplimiento() external override soloVendedor colateralDepositado noReentrancy {
        require (compradorIncumplio, "El comprador debe atrasarse en los pagos para realizar esta accion");
        contratoActivo = false;
        payable(vendedor).transfer(address(this).balance);
        emit ColateralReclamadoIncumplimiento(msg.sender, address(this).balance);
    }

    function reclamarColateral() external override soloComprador colateralDepositado noReentrancy{
        require (!compradorIncumplio , "El comprador se ha retrazado en los pagos");
        require(cantidadPagosTotales == cantidadPagosRealizados, "Todavia quedan pagos pendientes");

        contratoActivo = false;
        payable(vendedor).transfer(address(this).balance);
        emit ColateralReclamado(msg.sender, address(this).balance);
    }

    function depositarColateral() external override payable soloComprador noReentrancy {
        require(!colateralFueDepositado, "El colateral ya fue depositado");
        require(msg.value == depositoColateral, "Monto Erroneo");
        colateralFueDepositado = true;
        fechaUltimoPago = block.timestamp;
        emit ColateralDepositado(msg.sender, msg.value);
    }

    function realizarPagoMensual() external override payable soloComprador colateralDepositado contratoActivoo noReentrancy{
        require(msg.value == montoMensual, "Monto de transaccion invaldio");
        require(cantidadPagosTotales != cantidadPagosRealizados, "Ya has realizado todos los pagos");
        cantidadPagosRealizados+=1;
    }
}
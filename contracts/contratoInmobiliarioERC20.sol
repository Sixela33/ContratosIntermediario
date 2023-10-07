// SPDX-License-Identifier: CC-BY-NC-ND-4.0
// Copyright (c) 2023 Ramelax

// Información adicional sobre la licencia:
// - BY (Reconocimiento): Debes dar crédito al autor original (Tu Nombre) cuando utilices o compartas este contrato.
// - NC (No Comercial): No puedes utilizar este contrato con fines comerciales. No puedes ganar dinero directamente utilizando este contrato.
// - ND (No Derivados): No puedes modificar este contrato ni crear contratos derivados basados en él. Debes utilizar este contrato tal como se proporciona.

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ContratoInmobiliario.sol";

contract ContratoInmobiliarioERC20 is ContratoInmobiliario {

    address public tokenAddress;            // Direccion del token con el que trabaja el contrato
    uint256 public saldoTokens;              // Saldo en contrato

    constructor(
        address _comprador,
        address _vendedor,
        uint256 _depositoColateral,
        uint256 _montoMensual,
        uint256 _cantidadPagos,
        uint256 _plazoPagoDias,
        address _tokenAddress,
        bool _activo
    ) ContratoInmobiliario(
        _comprador,
        _vendedor,
        _depositoColateral,
        _montoMensual,
        _cantidadPagos,
        _plazoPagoDias,
        _activo
    ) {

    }

    function depositarTokens(uint256 amount) external soloComprador {
        require(contratoActivo, "Este contrato se encuentra inactivo");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        saldoTokens += amount;
    }

    function transferirTokens( address to, uint256 amount) private soloVendedor {
        require(saldoTokens >= amount, "Saldo insuficiente en el contrato");
        saldoTokens -= amount;
        IERC20(tokenAddress).transfer(to, amount);
    }

    function reclamarPagoMensual() external override soloVendedor contratoActivoNoIncumplido noReentrancy{
        require(block.timestamp - fechaUltimoPago >= 30 days, "Debe pasar al menos un mes entre pagos");
        require(cantidadPagosTotales > 0, "Ya se relizaron todos los pagos"); 

        uint256 balanceMinimo = montoMensual + depositoColateral;

        if (saldoTokens < balanceMinimo) {
            compradorIncumplio = true;
            contratoActivo = false;
        } else {
            transferirTokens(vendedor, montoMensual);
            cantidadPagosTotales -= 1;
            fechaUltimoPago = block.timestamp;
            cantidadPagosTotales -= montoMensual;
            emit PagoMensualRealizado(msg.sender, montoMensual);
        }
    }

    // El vendedor de la propiedad reclama el saldo del contrato pq no pudo retirar su mensualidad
    function reclamarColateralIncumplimiento() external override soloVendedor noReentrancy {
        require (compradorIncumplio, "El comprador debe atrasarse en los pagos para realizar esta accion");
        contratoActivo = false;
        cantidadPagosTotales = 0;
        transferirTokens(vendedor, saldoTokens);
        emit ColateralReclamadoIncumplimiento(msg.sender, saldoTokens);
    }

    // El comprador reclama el colateral despues de haber hecho todos sus pagos
    function reclamarColateral() external override soloComprador noReentrancy {
        require (!compradorIncumplio && cantidadPagosTotales <=0, "El comprador debe realizar todos para realizar esta accion");
        contratoActivo = false;
        cantidadPagosTotales = 0;
        transferirTokens(comprador, saldoTokens);
        emit ColateralReclamado(msg.sender, saldoTokens);
    }

    function depositarColateral(uint256 amount) external soloComprador {
        require(amount == depositoColateral, "Monto Erroneo");
        contratoActivo = true;
        this.depositarTokens(amount);
        emit ColateralDepositado(msg.sender, amount);
    }
}


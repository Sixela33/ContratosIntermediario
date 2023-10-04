// SPDX-License-Identifier: CC-BY-NC-ND-4.0
// Copyright (c) 2023 Ramelax

// Información adicional sobre la licencia:
// - BY (Reconocimiento): Debes dar crédito al autor original (Tu Nombre) cuando utilices o compartas este contrato.
// - NC (No Comercial): No puedes utilizar este contrato con fines comerciales. No puedes ganar dinero directamente utilizando este contrato.
// - ND (No Derivados): No puedes modificar este contrato ni crear contratos derivados basados en él. Debes utilizar este contrato tal como se proporciona.

pragma solidity ^0.8.0;

import "./contratoInmobiliarioETH.sol";

contract ContratoInmobiliarioFactory {
    mapping (address => address[]) vendedorXContratos;
    mapping (address => address[]) compradorXContratos;

   struct ContratosYCompradores {
        address[] vendedor;
        address[] comprador;
    }

    event NuevoContratoCreado(address indexed direccionContrato);

    function crearContratoETH(
        address _comprador,
        uint256 _depositoColateral,
        uint256 _montoMensual,
        uint256 _cantidadPagos,
        uint256 _plazoPagoDias,
        bool _intermediarioActivo
    ) external {

        address vendedor = msg.sender;

        ContratoInmobiliario nuevoContrato = new ContratoInmobiliarioETH(
            _comprador,
            vendedor,
            _depositoColateral,
            _montoMensual,
            _cantidadPagos,
            _plazoPagoDias,
            _intermediarioActivo
        );

        vendedorXContratos[vendedor].push(address(nuevoContrato));
        compradorXContratos[_comprador].push(address(nuevoContrato));

        emit NuevoContratoCreado(address(nuevoContrato));
    }

    function obtenerContratosXDireccion(address direccion) external view returns (ContratosYCompradores memory) {
        return ContratosYCompradores({
            vendedor: vendedorXContratos[direccion],
            comprador: compradorXContratos[direccion]
        });
    }
}

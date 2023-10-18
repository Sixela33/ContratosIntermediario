Ahi te puse unos comentarios en el front, para correr todo tenes que hacer los siguientes pasos

1- vas a nacesitar una red de prueba
Ganache es un proveedor local que esta buenazo para desarollo, instalando con el siguiente comando

        npm install ganache --global

y lo corres escribiendo "ganache". Esto te va a arrancar una red local donde se van a registrar las transacciones,
te va a dar los datos necesarios para agregar la red al metamask y tambien cuentas para que puedas agregar con la clave publica

2- el frontend y los contratos tienen distintos node modules, pero vas a necesitar deployar el contrato factory para que pueda interactuar
con el frontend, lo haces de la siguiente manera: 

        - entras a la carpeta contratos
        - npm i
        - npx ganache --network localhost run scripts/deployFactory.js

Ahi te va a tirar la direccion del contrato que deployaste para que pongas en la constante del frontend. Y ya esta, con eso ya seteaste todo
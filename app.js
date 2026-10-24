/* =====================================================
   VARIABLES
===================================================== */

let carrito = [];


/* =====================================================
   ELEMENTOS DEL HTML
===================================================== */

const productosContainer =
    document.getElementById("productos");

const contadorCarrito =
    document.getElementById("contadorCarrito");

const modalCotizacion =
    document.getElementById("modalCotizacion");

const modalCliente =
    document.getElementById("modalCliente");

const listaCotizacion =
    document.getElementById("listaCotizacion");

const totalCotizacion =
    document.getElementById("totalCotizacion");


/* =====================================================
   MOSTRAR PRODUCTOS
===================================================== */

function mostrarProductos(lista = equipos) {

    productosContainer.innerHTML = "";

    if (lista.length === 0) {

        productosContainer.innerHTML = `
            <div class="no-products">
                No encontramos equipos
                con esos filtros.
            </div>
        `;

        return;
    }


    lista.forEach(equipo => {

        const tarjeta =
            document.createElement("article");

        tarjeta.className =
            "product-card";


        tarjeta.innerHTML = `

            <div class="product-image">
                ${equipo.icono}
            </div>

            <div class="product-info">

                <span class="product-category">
                    ${equipo.categoria}
                </span>

                <h3>
                    ${equipo.nombre}
                </h3>

                <p class="product-model">
                    ${equipo.marca}
                    ·
                    ${equipo.modelo}
                </p>

                <p>
                    ${equipo.descripcion}
                </p>

                <div class="product-specs">

                    <span>
                        ${equipo.especificacion}
                    </span>

                    <span>
                        Disponible: ${equipo.cantidad}
                    </span>

                </div>

                <div class="product-footer">

                    <span class="product-price">

                        ${
                            equipo.precio > 0
                            ? `$${equipo.precio.toFixed(2)}`
                            : "Consultar"
                        }

                    </span>

                    <button
                        class="add-button"
                        onclick="agregarAlCarrito(${equipo.id})">

                        + COTIZAR

                    </button>

                </div>

            </div>
        `;


        productosContainer.appendChild(tarjeta);

    });

}


/* =====================================================
   FILTROS
===================================================== */

function aplicarFiltros() {

    const categoria =
        document.getElementById(
            "filtroCategoria"
        ).value;

    const tipo =
        document.getElementById(
            "filtroTipo"
        ).value;

    const texto =
        document.getElementById(
            "buscador"
        ).value
        .toLowerCase();


    const resultado =
        equipos.filter(equipo => {

            const coincideCategoria =
                categoria === "Todos" ||
                equipo.categoria === categoria;


            const coincideTipo =
                tipo === "Todos" ||
                equipo.tipo === tipo;


            const coincideTexto =
                equipo.nombre
                    .toLowerCase()
                    .includes(texto)

                ||

                equipo.modelo
                    .toLowerCase()
                    .includes(texto)

                ||

                equipo.marca
                    .toLowerCase()
                    .includes(texto);


            return (
                coincideCategoria &&
                coincideTipo &&
                coincideTexto
            );

        });


    mostrarProductos(resultado);
}


/* =====================================================
   FILTRAR DESDE LAS CATEGORÍAS
===================================================== */

function filtrarCategoria(categoria) {

    document.getElementById(
        "filtroCategoria"
    ).value = categoria;


    document.getElementById(
        "filtroTipo"
    ).value = "Todos";


    document.getElementById(
        "buscador"
    ).value = "";


    aplicarFiltros();


    document.getElementById(
        "equipos"
    ).scrollIntoView({
        behavior: "smooth"
    });

}


/* =====================================================
   AGREGAR AL CARRITO
===================================================== */

function agregarAlCarrito(id) {

    const equipo =
        equipos.find(
            item => item.id === id
        );


    if (!equipo) {
        return;
    }


    const existente =
        carrito.find(
            item => item.id === id
        );


    if (existente) {

        existente.cantidad++;

    } else {

        carrito.push({

            id: equipo.id,

            nombre: equipo.nombre,

            modelo: equipo.modelo,

            precio: equipo.precio,

            cantidad: 1

        });

    }


    actualizarCarrito();


    mostrarMensaje(
        "Equipo agregado a tu cotización."
    );

}


/* =====================================================
   ACTUALIZAR CARRITO
===================================================== */

function actualizarCarrito() {

    const cantidadTotal =
        carrito.reduce(
            (total, item) =>
                total + item.cantidad,
            0
        );


    contadorCarrito.textContent =
        cantidadTotal;

}


/* =====================================================
   ABRIR COTIZACIÓN
===================================================== */

function abrirCotizacion() {

    renderizarCotizacion();

    modalCotizacion.classList.add(
        "active"
    );

}


/* =====================================================
   CERRAR COTIZACIÓN
===================================================== */

function cerrarCotizacion() {

    modalCotizacion.classList.remove(
        "active"
    );

}


/* =====================================================
   MOSTRAR COTIZACIÓN
===================================================== */

function renderizarCotizacion() {

    listaCotizacion.innerHTML = "";


    if (carrito.length === 0) {

        listaCotizacion.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Tu cotización está vacía
                </h3>

                <p>
                    Agrega equipos desde
                    nuestro catálogo.
                </p>

            </div>

        `;

        totalCotizacion.textContent =
            "$0.00";

        return;
    }


    let total = 0;


    carrito.forEach(item => {

        const equipo =
            equipos.find(
                producto =>
                    producto.id === item.id
            );


        const subtotal =
            equipo.precio *
            item.cantidad;


        total += subtotal;


        const elemento =
            document.createElement(
                "div"
            );


        elemento.className =
            "quote-item";


        elemento.innerHTML = `

            <div>

                <h4>
                    ${item.nombre}
                </h4>

                <p>
                    ${item.modelo}
                </p>

                ${
                    equipo.precio > 0
                    ? `<p>$${equipo.precio.toFixed(2)} c/u</p>`
                    : `<p>Precio por consultar</p>`
                }

            </div>


            <div class="quote-controls">

                <button
                    onclick="cambiarCantidad(
                        ${item.id},
                        -1
                    )">

                    −

                </button>


                <strong>
                    ${item.cantidad}
                </strong>


                <button
                    onclick="cambiarCantidad(
                        ${item.id},
                        1
                    )">

                    +

                </button>


                <button
                    class="remove-item"
                    onclick="eliminarDelCarrito(
                        ${item.id}
                    )">

                    ×

                </button>

            </div>

        `;


        listaCotizacion.appendChild(
            elemento
        );

    });


    totalCotizacion.textContent =
        `$${total.toFixed(2)}`;

}


/* =====================================================
   CAMBIAR CANTIDAD
===================================================== */

function cambiarCantidad(
    id,
    cambio
) {

    const item =
        carrito.find(
            producto =>
                producto.id === id
        );


    if (!item) {
        return;
    }


    item.cantidad += cambio;


    if (item.cantidad <= 0) {

        carrito =
            carrito.filter(
                producto =>
                    producto.id !== id
            );

    }


    actualizarCarrito();

    renderizarCotizacion();

}


/* =====================================================
   ELIMINAR PRODUCTO
===================================================== */

function eliminarDelCarrito(id) {

    carrito =
        carrito.filter(
            item =>
                item.id !== id
        );


    actualizarCarrito();

    renderizarCotizacion();

}


/* =====================================================
   FORMULARIO DEL CLIENTE
===================================================== */

function mostrarFormulario() {

    if (carrito.length === 0) {

        alert(
            "Agrega al menos un equipo antes de solicitar una cotización."
        );

        return;
    }


    cerrarCotizacion();


    modalCliente.classList.add(
        "active"
    );

}


function cerrarFormulario() {

    modalCliente.classList.remove(
        "active"
    );

}


/* =====================================================
   ENVIAR COTIZACIÓN
===================================================== */

function enviarCotizacion(evento) {

    evento.preventDefault();


    const cliente = {

        nombre:
            document.getElementById(
                "clienteNombre"
            ).value,

        telefono:
            document.getElementById(
                "clienteTelefono"
            ).value,

        correo:
            document.getElementById(
                "clienteCorreo"
            ).value,

        tipoEvento:
            document.getElementById(
                "tipoEvento"
            ).value,

        fecha:
            document.getElementById(
                "fechaEvento"
            ).value,

        lugar:
            document.getElementById(
                "lugarEvento"
            ).value,

        mensaje:
            document.getElementById(
                "mensajeCliente"
            ).value,

        equipos: carrito

    };


    console.log(
        "COTIZACIÓN:",
        cliente
    );


    alert(
        "Tu solicitud fue preparada correctamente."
    );


    console.log(
        JSON.stringify(
            cliente,
            null,
            2
        )
    );


    cerrarFormulario();


    document
        .getElementById("formCliente")
        .reset();

}


/* =====================================================
   MENÚ MÓVIL
===================================================== */

function abrirMenu() {

    const menu =
        document.getElementById(
            "menuMobile"
        );


    if (
        menu.style.display === "flex"
    ) {

        menu.style.display = "none";

    } else {

        menu.style.display = "flex";

    }

}


/* =====================================================
   MENSAJE
===================================================== */

function mostrarMensaje(texto) {

    console.log(texto);

}


/* =====================================================
   INICIALIZAR PÁGINA
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        mostrarProductos();

        actualizarCarrito();

    }
);

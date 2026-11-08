// Carrito compartido entre páginas mediante localStorage.
const CART_KEY = "tuEventoCarritoV1";

function leerCarrito() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function guardarCarrito(carrito) {
  localStorage.setItem(CART_KEY, JSON.stringify(carrito));
  actualizarContadores();
}
function actualizarContadores() {
  const total = leerCarrito().reduce((sum, item) => sum + item.cantidad, 0);
  document.querySelectorAll("[data-cart-count]").forEach(el => el.textContent = total);
}
function formatoDinero(valor) {
  return new Intl.NumberFormat("es-PA", { style: "currency", currency: "USD" }).format(valor);
}
function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function configurarMenu() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const abierto = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(abierto));
      toggle.textContent = abierto ? "×" : "☰";
    });
  }
  const pagina = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach(link => {
    if (link.dataset.nav === pagina) link.classList.add("active");
  });
}

function renderizarProductos(lista) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";
  const count = document.getElementById("resultsCount");
  if (count) count.textContent = `${lista.length} equipo(s) encontrado(s)`;
  if (!lista.length) {
    grid.innerHTML = '<div class="empty-state">No encontramos equipos con esos filtros. Prueba otra búsqueda.</div>';
    return;
  }
  lista.forEach(equipo => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-visual"><span>${escaparHTML(equipo.icono)}</span><small>${escaparHTML(equipo.categoria)}</small></div>
      <div class="product-content">
        <p class="card-index">${escaparHTML(equipo.marca)} / ${escaparHTML(equipo.modelo)}</p>
        <h2>${escaparHTML(equipo.nombre)}</h2>
        <p class="product-description">${escaparHTML(equipo.descripcion)}</p>
        <div class="product-meta"><span>${escaparHTML(equipo.tipo)}</span><span>${escaparHTML(equipo.especificacion)}</span></div>
        <div class="product-bottom"><strong>${equipo.precio == null ? "Precio por consultar" : formatoDinero(equipo.precio)}</strong><button class="btn btn-small btn-gold" type="button" data-add="${equipo.id}">+ Agregar</button></div>
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => agregarAlCarrito(Number(btn.dataset.add))));
}

function filtrarProductos() {
  const category = document.getElementById("filterCategory")?.value || "";
  const type = document.getElementById("filterType")?.value || "";
  const search = (document.getElementById("searchProducts")?.value || "").trim().toLowerCase();
  const filtered = equipos.filter(e => {
    const matchesCategory = !category || e.categoria === category;
    const matchesType = !type || e.tipo === type;
    const text = `${e.nombre} ${e.modelo} ${e.marca} ${e.descripcion}`.toLowerCase();
    return matchesCategory && matchesType && text.includes(search);
  });
  renderizarProductos(filtered);
}

function agregarAlCarrito(id) {
  const equipo = equipos.find(e => e.id === id);
  if (!equipo) return;
  const carrito = leerCarrito();
  const existente = carrito.find(item => item.id === id);
  if (existente) existente.cantidad += 1;
  else carrito.push({ id: equipo.id, cantidad: 1 });
  guardarCarrito(carrito);
  const boton = document.querySelector(`[data-add="${id}"]`);
  if (boton) {
    const original = boton.textContent;
    boton.textContent = "✓ Agregado";
    setTimeout(() => { boton.textContent = original; }, 900);
  }
}

function renderizarCotizacion() {
  const contenedor = document.getElementById("quoteItems");
  if (!contenedor) return;
  const carrito = leerCarrito();
  contenedor.innerHTML = "";
  if (!carrito.length) {
    contenedor.innerHTML = '<div class="empty-state"><h3>Tu cotización está vacía</h3><p>Visita el catálogo para agregar equipos.</p><a class="btn btn-gold" href="equipos.html">Explorar equipos</a></div>';
  }
  let total = 0;
  carrito.forEach(item => {
    const equipo = equipos.find(e => e.id === item.id);
    if (!equipo) return;
    if (typeof equipo.precio === "number") total += equipo.precio * item.cantidad;
    const row = document.createElement("article");
    row.className = "quote-row";
    row.innerHTML = `
      <div class="quote-product-icon">${escaparHTML(equipo.icono)}</div>
      <div class="quote-product-info"><h3>${escaparHTML(equipo.nombre)}</h3><p>${escaparHTML(equipo.modelo)} · ${equipo.precio == null ? "Precio por consultar" : formatoDinero(equipo.precio)}</p></div>
      <div class="quantity-control"><button type="button" aria-label="Disminuir" data-minus="${item.id}">−</button><strong>${item.cantidad}</strong><button type="button" aria-label="Aumentar" data-plus="${item.id}">+</button></div>
      <button type="button" class="remove-button" data-remove="${item.id}">Quitar</button>`;
    contenedor.appendChild(row);
  });
  document.getElementById("quoteSubtotal").textContent = formatoDinero(total);
  document.querySelectorAll("[data-minus]").forEach(btn => btn.addEventListener("click", () => cambiarCantidad(Number(btn.dataset.minus), -1)));
  document.querySelectorAll("[data-plus]").forEach(btn => btn.addEventListener("click", () => cambiarCantidad(Number(btn.dataset.plus), 1)));
  document.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => quitarEquipo(Number(btn.dataset.remove))));
}

function cambiarCantidad(id, cambio) {
  const carrito = leerCarrito();
  const item = carrito.find(e => e.id === id);
  if (!item) return;
  item.cantidad += cambio;
  guardarCarrito(carrito.filter(e => e.cantidad > 0));
  renderizarCotizacion();
}
function quitarEquipo(id) {
  guardarCarrito(leerCarrito().filter(item => item.id !== id));
  renderizarCotizacion();
}

function configurarFormulario() {
  const form = document.getElementById("requestForm");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const carrito = leerCarrito();
    if (!carrito.length) {
      alert("Primero agrega al menos un equipo desde el catálogo.");
      return;
    }
    const datos = Object.fromEntries(new FormData(form).entries());
    const detalle = carrito.map(item => {
      const equipo = equipos.find(e => e.id === item.id);
      return `${equipo ? equipo.nombre : "Equipo"} x ${item.cantidad}`;
    }).join("\n");
    const resumen = [
      "SOLICITUD DE COTIZACIÓN - TU EVENTO",
      `Nombre: ${datos.nombre}`,
      `Teléfono: ${datos.telefono}`,
      `Correo: ${datos.correo}`,
      `Tipo de evento: ${datos.tipoEvento}`,
      `Fecha: ${datos.fecha}`,
      `Lugar: ${datos.lugar}`,
      `Detalles: ${datos.mensaje || "No especificados"}`,
      "Equipos:", detalle
    ].join("\n");
    const blob = new Blob([resumen], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solicitud-cotizacion-tu-evento.txt";
    a.click();
    URL.revokeObjectURL(url);
    alert("Se descargó el resumen de tu solicitud. Esta versión aún no envía los datos a un servidor.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarMenu();
  actualizarContadores();
  if (document.getElementById("productGrid")) {
    const params = new URLSearchParams(location.search);
    const categoria = params.get("categoria");
    if (categoria) document.getElementById("filterCategory").value = categoria;
    ["filterCategory", "filterType"].forEach(id => document.getElementById(id).addEventListener("change", filtrarProductos));
    document.getElementById("searchProducts").addEventListener("input", filtrarProductos);
    filtrarProductos();
  }
  renderizarCotizacion();
  configurarFormulario();
});

// 1. CONEXIÓN A LA NUBE
const supabaseUrl = 'https://zzexfnwioneothelpyus.supabase.co'; //
const supabaseKey = 'sb_publishable_UE82ESRv31elzVUgvCQb2g_T6DZpt-E'; // REEMPLAZA CON TU KEY COMPLETA
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. TUS PRODUCTOS (Mapeados de tu lista real)
const productosMaestros = [
    "AGUA HATSU 500ML", "AGUA HATSU CON GAS 300ML", "AGUARDIENTE ANTIOQUEÑO AZUL BOTELLA",
    "AGUARDIENTE ANTIOQUEÑO AZUL MEDIA", "AGUARDIENTE ANTIOQUEÑO ROJO BOTELLA",
    "AGUARDIENTE ANTIOQUEÑO ROJO MEDIA", "AGUARDIENTE ANTIOQUEÑO VERDE BOTELLA",
    "AGUARDIENTE ANTIOQUEÑO VERDE MEDIA", "ALFAJOR BLANCO BALANCE", "ALFAJOR NEGRO BALANCE",
    "AMINOX", "BARRA DE PROTEINA BEST WHEY", "BARRA DE PROTEINA CACAO Y SAL MARINA",
    "BARRA DE PROTEINA MANI Y ARANDANOS", "BARRA DE PROTEINA WARP AVENA Y ARANDANOS",
    "BARRA DE PROTEINA WARP AVENA Y PISTACHO", "BARRA ENERGETICA WARP AVENA Y CHOCOLATE",
    "BARRA PROTEIAN WILD CHOCOLATE", "BARRA PROTEINA WILD CARAMELO", "BLONDIE CHOCOLATE NEGRO",
    "BONYURT GRIEGO", "BOTELLA DE VINO", "BRETAÑA ORIGINAL", "BROWNIE MELCOCHUDO BALANCE",
    "CAFÉ", "C4", "CERVEZA SOL", "CERVEZA STELLA", "CHIA CREAM", "CHOCO UP",
    "CHOCOLATE MUNDIAL CARAMELO CROCANTE", "CHOCOLATE MUNDIAL DARK MILK 55%",
    "CHOCOLATE MUNDIAL OSCURO 70%", "CLUB COLOMBIA DORADA 330ML", "COCA COLA ORIGINAL",
    "COCA COLA ZERO", "COPA DE VINO", "COPA DE VINO CORTESIA", "CORONA 330ML",
    "CORONA CERO", "CORONITA 250ML", "CREMA DE MANI WAKEUP CHOCOLATE", "ELECTROLIT FRESA KIWI",
    "ELECTROLIT MARACUYA", "ELECTROLIT MORA AZUL", "GALLETAS PROBA", "GATORADE SIN AZUCAR FRESA KIWI 500 ML",
    "GATORADE BLU ICE", "GATORADE MANDARINA", "GATORADE PONCHE DE FRUTAS 500 ML",
    "GATORADE SIN AZUCAR NARANJA 500 ML", "GATORLIT FRESA", "GATORLIT MORA AZUL", "GATORLIT UVA",
    "GRANIZADO", "HATSU AMARILLO", "HATSU BLANCO", "HATSU LILA", "HATSU NEGRO", "HATSU ROSADO",
    "HEINEKEN 330 ML", "HIT MANGO", "HIT MORA", "HIT NARANJA PIÑA", "HIT TROPICAL", "JP ROSADO",
    "LICUADA", "MAHATI BLUE", "MAHATI GREEN", "MAHATI PINK", "MAHATTI MANDARINA", "MANTEQUILLA DE MANI",
    "MANZANA POSTOBON", "MICHELADO", "PAPITAS MONTEROJO", "PAPITAS NATURALES", "PARMESANITOS",
    "PLATANITOS LIMON", "PLATANITOS NATURALES", "PROTEINA CHOCOLATE", "PROTEINA COOKIE AND CREAM",
    "PROTEINA VAINILLA", "REDBULL ORIGINAL", "REDBULL SANDIA", "REDBULL SIN AZUCAR", "SEVEN",
    "SMILE DRINKS", "SMIRNOFF ICE VERDE", "SODA HATSU AMARILLA", "SODA HATSU ROSADA", "SODA HATSU VERDE",
    "TEQUILA CRISTALINO BOTELLA 1800", "ALMENDRAS", "AVENA", "TRES CORDILLERAS ROSE",
    "TRUFAS NEGRAS BALANCE", "VIVENTE AMARILLO", "VIVENTE MORADO", "DEDITOS DE QUESO TIPO PARMESANO"
].sort(); //

// 3. ELEMENTOS DEL DOM
const selectSede = document.getElementById('selectSede');
const selectProducto = document.getElementById('selectProducto');
const visorStock = document.getElementById('contenedorStockSede');
const listaAlertas = document.getElementById('listaAlertas');

// 4. INICIALIZACIÓN
function init() {
    // Llenar el menú de productos al cargar
    selectProducto.innerHTML = '<option value="" selected disabled>Seleccionar producto</option>';
    productosMaestros.forEach(p => {
        let opt = document.createElement('option');
        opt.value = p; opt.innerText = p;
        selectProducto.appendChild(opt);
    });
}

// 5. FUNCIÓN: CARGAR STOCK DESDE SUPABASE
async function cargarStockSede() {
    const sede = selectSede.value;
    
    if (!sede) {
        visorStock.innerHTML = '<p class="msg-guia">Selecciona una sede para ver el inventario.</p>';
        listaAlertas.innerHTML = '';
        return;
    }

    try {
        // Consultar a la base de datos filtrando por la sede seleccionada
        const { data, error } = await _supabase
            .from('inventario')
            .select('*')
            .eq('Sede', sede);

        if (error) throw error;

        visorStock.innerHTML = '';
        listaAlertas.innerHTML = '';

        if (data.length === 0) {
            visorStock.innerHTML = `<p class="msg-guia">No hay stock en ${sede}</p>`;
            return;
        }

        data.forEach(item => {
            // Renderizar en el visor principal
            const div = document.createElement('div');
            div.className = 'fila-producto';
            const claseBadge = item.Cantidad < 10 ? 'stock-bajo' : 'stock-ok';
            
            div.innerHTML = `
                <span>${item.Producto}</span>
                <span class="badge-stock ${claseBadge}">${item.Cantidad} uds</span>
            `;
            visorStock.appendChild(div);

            // Si el stock es bajo ( < 10 ), enviarlo a Alertas Críticas
            if (item.Cantidad < 10) {
                listaAlertas.innerHTML += `
                    <div class="alerta-critica">
                        <span>${item.Producto}</span>
                        <span class="badge">${item.Cantidad} UDS</span>
                    </div>
                `;
            }
        });
    } catch (err) {
        console.error("Error de conexión:", err.message);
    }
}

// 6. FUNCIÓN: GUARDAR NUEVO REGISTRO
async function registrarEntrada() {
    const registro = {
        Sede: selectSede.value,
        Responsable: document.getElementById('inputResponsable').value,
        Turno: document.getElementById('selectTurno').value,
        Producto: selectProducto.value,
        Cantidad: parseInt(document.getElementById('inputCantidad').value),
        Vencimiento: document.getElementById('inputFecha').value
    };

    if (!registro.Sede || !registro.Producto || isNaN(registro.Cantidad)) {
        alert("Por favor completa los campos obligatorios.");
        return;
    }

    try {
        const { error } = await _supabase.from('inventario').insert([registro]);
        if (error) throw error;

        alert("✅ Registrado en la nube con éxito.");
        cargarStockSede(); // Refrescar vista automáticamente
    } catch (err) {
        alert("Error al guardar: " + err.message);
    }
}

// 7. EVENTOS
selectSede.addEventListener('change', cargarStockSede);
document.getElementById('btnRegistrar').addEventListener('click', registrarEntrada);

init();

async function cargarStockSede() {
    const sede = selectSede.value;
    if (!sede) return;

    try {
        const { data, error } = await _supabase
            .from('inventario')
            .select('*')
            .eq('Sede', sede);

        if (error) throw error;

        // Limpiamos los contenedores antes de rellenar
        visorStock.innerHTML = '';
        listaAlertas.innerHTML = ''; 

        // 1. Configuramos la fecha límite para "Pronto a vencer" (ej: 7 días desde hoy)
        const hoy = new Date();
        const proximaSemana = new Date();
        proximaSemana.setDate(hoy.getDate() + 7);

        data.forEach(item => {
            // --- RENDERIZADO EN VISOR PRINCIPAL ---
            const div = document.createElement('div');
            div.className = 'fila-producto';
            const cantidadNum = parseInt(item.Cantidad);
            const claseBadge = cantidadNum < 10 ? 'stock-bajo' : 'stock-ok';
            
            div.innerHTML = `
                <span>${item.Producto}</span>
                <span class="badge-stock ${claseBadge}">${cantidadNum} uds</span>
            `;
            visorStock.appendChild(div);

            // --- LÓGICA DE ALERTAS CRÍTICAS ---
            const fechaVencimiento = new Date(item.Vencimiento);
            let esCritico = false;
            let razonAlerta = "";

            // Alerta 1: Stock Bajo
            if (cantidadNum < 10) {
                esCritico = true;
                razonAlerta = `STOCK BAJO (${cantidadNum})`;
            }

            // Alerta 2: Vencimiento Próximo
            if (fechaVencimiento <= proximaSemana && fechaVencimiento >= hoy) {
                esCritico = true;
                razonAlerta = razonAlerta ? "STOCK Y VENCIMIENTO" : "VENCIMIENTO PRÓXIMO";
            }

            if (esCritico) {
                const alertaDiv = document.createElement('div');
                alertaDiv.className = 'alerta-critica';
                alertaDiv.innerHTML = `
                    <div style="display:flex; flex-direction:column">
                        <span style="font-weight:800">${item.Producto}</span>
                        <small style="font-size:0.6rem; opacity:0.8">${razonAlerta}</small>
                    </div>
                    <span class="badge">${item.Vencimiento}</span>
                `;
                listaAlertas.appendChild(alertaDiv);
            }
        });

        if (data.length === 0) {
            visorStock.innerHTML = `<p class="msg-guia">No hay inventario en ${sede}</p>`;
        }

    } catch (err) {
        console.error("Error al cargar alertas:", err.message);
    }
}

// Configura EmailJS (regístrate en emailjs.com es gratis)
// Necesitarás: Service ID, Template ID y Public Key

function verificarAlertasCriticas(item) {
    const hoy = new Date();
    const fechaVencimiento = new Date(item.Vencimiento);
    
    // Calcular diferencia en días
    const diferenciaTiempo = fechaVencimiento - hoy;
    const diasParaVencer = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    // CONDICIÓN: Vence en 5 días o menos Y stock menos de 10
    if (diasParaVencer <= 5 && item.Cantidad < 10) {
        enviarAlertaEmail(item, diasParaVencer);
    }
}

function enviarAlertaEmail(item, dias) {
    const templateParams = {
        producto: item.Producto,
        stock: item.Cantidad,
        dias_restantes: dias,
        sede: item.Sede,
        vencimiento: item.Vencimiento,
        email_to: "tu-correo@ejemplo.com" // Tu correo aquí
    };

    // Usando EmailJS para el envío directo
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
        .then(() => {
            console.log('📧 Correo de alerta enviado!');
        }, (error) => {
            console.error('❌ Error al enviar correo:', error);
        });
}

async function registrarEntrada() {
    // ... (tu lógica de datos anterior)

    try {
        const { error } = await _supabase.from('inventario').insert([registro]);
        if (error) throw error;

        mostrarFeedback("✅ Sincronizado correctamente", "success");
        
        // DISPARAR VERIFICACIÓN DE CORREO
        verificarAlertasCriticas(registro);

        cargarStockSede();
    } catch (err) {
        mostrarFeedback("❌ Error al guardar", "error");
    }
}
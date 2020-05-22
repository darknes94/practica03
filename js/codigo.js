// =================================================================================
// Funciones generales que se utilizan para generar los modals
// =================================================================================

function mensajeModal(h2,p,f_boton,boton) {
    let html = '';
    html += '<article>';
    html +=   '<h2>'+h2+'</h2>';
    html +=   '<p>'+p+'</p>';
    html +=   '<footer class="modal"><button onclick="'+f_boton+'">'+boton+'</button></footer>';
    html += '</article>';
    crearModal(html);
}

function modalConfirmacion(h2,codigo,btnAceptar,btnCancelar) {
    let html = '';
    html += '<article>';
    html +=   '<h2>'+h2+'</h2>';
    html +=   codigo;
    html +=   '<footer class="modal">'+btnAceptar+'<button onclick="'+btnCancelar+'">Cancelar</button></footer>';
    html += '</article>';
    crearModal(html);
}

function crearModal(html) {
    let div = document.createElement('div');
    div.setAttribute('id','capa-fondo');
    div.innerHTML = html;
    document.body.appendChild(div);
    
    // Ocultamos las barras de desplazamiento
    document.body.setAttribute('style','overflow-x:hidden; overflow-y:hidden;');
}

function borraCodigoModal() {
    document.querySelector('#capa-fondo').remove();
    document.body.removeAttribute('style');
}

function cerrarMensajeModal(tipo, redirigir) {
    borraCodigoModal();

    if (tipo == '0') { // Login, nuevo articulo
        
        if (redirigir) // redirigimos en caso de login correcto y nuevo articulo creado
            window.location.replace("index.html");
        else // (solo para login) devuelve el foco al input 'login'
            document.querySelector("#login_name_lg").focus();

    } else if (tipo == '1') { // Preguntas
        if (redirigir)
            document.querySelector("#art-pre").value = '';
        else
            document.querySelector("#art-pre").focus();
    }
    else if (tipo == '2') { // Registro
        if (redirigir)
        {
            window.location.replace("login.html");
        }
        else // (solo para login) devuelve el foco al input 'login'
        {
            document.querySelector("#login_name").focus();
        }
    }
}



// =================================================================================
// Funciones para manejar el canvas
// =================================================================================
var anchCelda = 50;
var regiones = 4;

function prepararCanvas() {
    let cv = document.querySelector('#cvRejilla');

    cv.width  = anchCelda*regiones;
    cv.height = anchCelda*regiones;

    pintarBorde();

    cv.onclick = function(evt) {
        let fila, columna;

        fila = Math.floor(evt.offsetX / (cv.width/regiones));
        columna = Math.floor(evt.offsetY / (cv.height/regiones));
        
        console.log(fila + ' - ' + columna);

        limpiarCanvas();
        pintarCeldaSeleccionada(cv, fila, columna);
        anyadirNumDisponibles();
    };
}

function limpiarCanvas() {
    let cv = document.querySelector('#cvRejilla');
    cv.width = cv.width;
}

function pintarCeldaSeleccionada(cv, fila, columna) {
    let ctx = cv.getContext('2d');
    
    ctx.beginPath();
    ctx.fillStyle = '#A0EEFF';

    // Seleccion vertical e horizontal
    for (let f=0; f<cv.width; f++) {
        ctx.fillRect(f*anchCelda, columna*anchCelda, anchCelda, anchCelda);
        ctx.fillRect(fila*anchCelda, f*anchCelda, anchCelda, anchCelda);
    }
    
    // Celda seleccionada
    ctx.beginPath();
    ctx.fillStyle = '#06B';
    ctx.fillRect(fila*anchCelda, columna*anchCelda, anchCelda, anchCelda);

    //TODO
    // Celdas grises
    // Numeros

    // Bordes
    pintarBorde();

    // Borde rojo
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#E00';
    ctx.strokeRect(fila*anchCelda, columna*anchCelda, anchCelda, anchCelda);
}

function pintarBorde() {
    let cv  = document.querySelector('#cvRejilla'),
        ctx = cv.getContext('2d');

    // Borde de fuera
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
    ctx.strokeRect(0,0,cv.width,cv.height);

    for (let l=0; l<regiones; l++) {
        // Lineas horizontales finas
        ctx.moveTo(anchCelda*l,0);
        ctx.lineTo(anchCelda*l,cv.height);

        // Lineas verticales finas
        ctx.moveTo(0,anchCelda*l);
        ctx.lineTo(cv.width,anchCelda*l);
    }
    ctx.stroke();

    // Lineas gordas
    ctx.beginPath();
    ctx.lineWidth = 2;

    if (regiones == 4) {
        lineasGordas4x4(cv, ctx);
    }
    else {
        lineasGordas9x9(cv, ctx)
    }
    ctx.stroke();
}

function lineasGordas4x4(cv, ctx) {
    // Lineas horizontales gordas
    ctx.moveTo(cv.width/2,0);
    ctx.lineTo(cv.width/2,cv.height);

    // Lineas verticales gordas
    ctx.moveTo(0,cv.height/2);
    ctx.lineTo(cv.width,cv.height/2);
}

function lineasGordas9x9(cv, ctx) {
    // Lineas horizontales gordas
    ctx.moveTo(anchCelda*3,0);
    ctx.lineTo(anchCelda*3,cv.height);

    ctx.moveTo(anchCelda*6,0);
    ctx.lineTo(anchCelda*6,cv.height);

    // Lineas verticales gordas
    ctx.moveTo(0,anchCelda*3);
    ctx.lineTo(cv.width,anchCelda*3);

    ctx.moveTo(0,anchCelda*6);
    ctx.lineTo(cv.width,anchCelda*6);
}

function cambiarCanvas(rbt) {
    let cv  = document.querySelector('#cvRejilla');
    regiones  = rbt.value;
    cv.width  = anchCelda*regiones;
    cv.height = anchCelda*regiones;

    pintarBorde();
}

function empezar() {
    let aside    = document.querySelector('#juego aside'),
        radios  = document.querySelectorAll('#tamanyo input');

    for (let i = 0; i < radios.length; i++) {
        radios[i].disabled = true;
    }

    let html = '<p>Tiempo: 00:00:00</p>';
    html += '<button class="btnFunc" onclick="comprobar();">Comprobar</button>';
    html += '<button class="btnFunc" onclick="finalizar();">Finalizar</button>';
    aside.innerHTML = html;
}

function anyadirNumDisponibles() {
    eliminarNumDisponibles();

    let aside  = document.querySelector('#juego aside'),
        html   = '',
        div = document.createElement('div');

    div.setAttribute('id','numD');
    html += '<h3>Números disponibles</h3><div>';

    for (let num=0; num<regiones; num++) {
        html += '<button class="btnNum" value="'+(num+1)+'" onclick="selectNumero(this);">'+(num+1)+'</button>';
    }
    html += '</div>';
    div.innerHTML = html;
    aside.appendChild(div);
}

function eliminarNumDisponibles() {
    let elemento  = document.querySelector('#juego aside #numD');
    if (elemento != null) {
        elemento.remove();
    }
}

function selectNumero(btn) {
    console.log(btn.value);

    eliminarNumDisponibles();
    limpiarCanvas();

    pintarBorde();
}






















//-------------------------------------------------------------------
//              Funciones para la botonera de paginación

/*
function hacerLogin(frm) {
    let url = 'api/usuarios/login',
        fd  = new FormData(frm);

    fetch(url, {method:'POST', 
        body:fd}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    sessionStorage['usuario'] = JSON.stringify(datos);

                    // Texto del mensaje
                    mensajeModal('LOGIN',
                        'El usuario '+ datos.login +' se ha logueado correctamente.',
                        'cerrarMensajeModal(0,true);',
                        'Aceptar');
                });
            } else if(respuesta.status == 401) {
                
                    // Texto del mensaje
                    mensajeModal('LOGIN INCORRECTO',
                        'Usuario o contraseña incorrectos.',
                        'cerrarMensajeModal(0,false);',
                        'Cerrar');
            } else 
                console.log('Error en la petición fetch de login.');
        });
    return false; // Para no recargar la página
}

function comprobarLogin() {
    // Si esta logueado, no puede entrar a login ni a registro
    if ((sessionStorage['usuario']) &&
        ((document.body.getAttribute('data-pagina') == 'login') ||
        (document.body.getAttribute('data-pagina') == 'registro'))) {
            window.location.replace("index.html");
            
    } // Si no esta logueado, no puede entrar a nuevo
    else if ((!sessionStorage['usuario']) && 
        (document.body.getAttribute('data-pagina') == 'nuevo')) {
            window.location.replace("index.html");
    }
}


function menu() {
    comprobarLogin();
    let html = '';

    if (document.body.getAttribute('data-pagina') != 'inicio')
        html += '<li><a href="index.html" title="Inicio"><i class="flaticon-home"></i> <span>Inicio</span></a></li>';
    
    if (document.body.getAttribute('data-pagina') != 'buscar')
        html += '<li><a href="buscar.html" title="Buscar"><i class="flaticon-loupe"></i> <span>Buscar</span></a></li>';

    if(sessionStorage['usuario']) {
        if (document.body.getAttribute('data-pagina') != 'nuevo')
            html += '<li><a href="nuevo.html" title="Nuevo"><i class="flaticon-plus"></i> <span>Nuevo</span></a></li>';
        
        let usu = JSON.parse(sessionStorage['usuario']);
        html += `<li onclick="logout();" class="logout"><i class="flaticon-logout"></i> <span>Logout (${usu.nombre})</span></li>`;
    
    } else {
        if (document.body.getAttribute('data-pagina') != 'login')
        html += '<li><a href="login.html" title="Login"><i class="flaticon-enter"></i> <span>Login</span></a></li>';

        if (document.body.getAttribute('data-pagina') != 'registro')
            html += '<li><a href="registro.html" title="Registro"><i class="flaticon-id-card"></i> <span>Registro</span></a></li>';
    }

    document.querySelector('body>header>nav>ul').innerHTML = html;
}

// Logout, los datos de sessionStorage se borran y en la BD borramos el token de dicho usuario
function logout() {
    let url = 'api/usuarios/logout',
        usu = JSON.parse(sessionStorage['usuario']);

        fetch(url, {method:'POST',
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos) {
                    console.log(datos);
                    delete sessionStorage['usuario'];
                    window.location.replace("index.html");
                });
            } else 
                console.log('Error al intentar hacer logout.');
        });
}

// Rellena el select de categorias que hay en buscar y el datalist de nuevo articulo
function pedirCategorias(buscar) {
    let url="api/categorias";

    fetch(url).then(function(respuesta) {
        if(respuesta.ok) { 
            respuesta.json().then(function(datos) {
                if (datos.RESULTADO == 'OK') {
                    let html = '';

                    if (buscar)         // opcion para el select
                        html += '<option selected value="-">-</option>';

                    datos.FILAS.forEach(function(e) {
                        if (!buscar)    // opcion para el datalist
                            html += `<option id="${e.id}" value="${e.nombre}">`;
                        else            // opcion para el select
                            html += `<option value="${e.id}">${e.nombre}</option>`;
                    });
                    document.querySelector('#categorias').innerHTML = html;
                } else
                    console.log('ERROR: ' + datos.DESCRIPCION);
            });
        } else
            console.log('Error en la petición fetch');
    });
}

// Comprueba si hay fotos para enviar en el nuevo articulo y las guarda en un array
function comprobarFotos() {
    let fichas = document.querySelector('#add-img').querySelectorAll('div');
    var fotos = [];

    if (fichas.length > 0) {
        for (var i = 0; i < fichas.length; i++) {
            let foto = fichas[i].querySelector('input').files[0];
            if (foto != null)
                fotos.push(foto);
        }
    }
    return fotos;
}

// Crea el nuevo articulo 
function crearNuevoArticulo(frm) {

    let url = 'api/articulos/',
    fd  = new FormData(frm),
    usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                
                    // Comprobamos si hay alguna foto seleccionada para subirla al server
                    let fotos = comprobarFotos();
                    if (fotos.length > 0) {
                        let foto = 0;
                        let continuar = true;
                        while (foto < fotos.length && continuar) {

                            enviarFoto(datos.ID, fotos[foto])
                                .then(() => {}, // Si todo va bien, no hacemos nada
                                function(err){
                                    continuar = false;
                                    console.log(err.status+': '+err.statusText);
                                });
                            foto++;
                        }
                    }
                    mensajeModal('NUEVO ARTICULO',
                        'Se ha guardado correctamente el artículo',
                        'cerrarMensajeModal(0,true);',
                        'Aceptar');
                });
            } else
                console.log('Error en la petición fetch de nuevo artículo.');
        });
    return false; // Para no recargar la página
}

// Envia 1 foto al servidor y le pasa el resultado a crearNuevoArticulo(frm)
function enviarFoto(id, foto) {
    return new Promise(function(todoOK, hayError) {

        let url = 'api/articulos/'+id+'/foto',
            fd  = new FormData(),
            usu = JSON.parse(sessionStorage['usuario']);

        fd.append('fichero', foto);

        fetch(url, {method:'POST', 
            body:fd,
            headers:{'Authorization':usu.login + ':' + usu.token}})
            .then(function(r) {
                if(r.ok) {
                    todoOK(r);
                } else
                    hayError(r);
            });
    });
}



    

function getIdArticulo() {
    return new URLSearchParams(window.location.search).get('id');
}
function getVendedorArticulo() {
    return new URLSearchParams(window.location.search).get('login');
}
function getTextoArticulo() {
    return new URLSearchParams(window.location.search).get('texto');
}

function pedirInfoArticulo() {

    let url = 'api/articulos/'+getIdArticulo(),
        init = null;

    if (sessionStorage['usuario']) {
        usu = JSON.parse(sessionStorage['usuario']);
        // method get es por defecto y body no hace falta
        init = { headers:{'Authorization':usu.login + ':' + usu.token} };
    }

    // la cabecera con el login hace que aparezca el campo 'estoy_siguiendo'
    fetch(url, init).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                let articulo = datos.FILAS[0];
                let propietario = false;

                if ((init != null) && (usu.login == articulo.vendedor))
                    propietario = true;

                anyadirInfoArticulo(articulo.nombre, articulo.descripcion, articulo.precio,
                    articulo.veces_visto, articulo.vendedor, articulo.imagen, articulo.nfotos,
                    articulo.nsiguiendo, articulo.npreguntas, articulo.estoy_siguiendo, propietario,
                    articulo.id, articulo.categoria, articulo.fecha, articulo.foto_vendedor);

            });
        } else
            console.log('Error en la petición fetch');
    });
}

// Para eliminar un articulo, se abrira primero un modal para pedir confirmacion al usuario
function eliminarArt() {
    modalConfirmacion('ELIMINAR ARTICULO',
        '<p>¿Está seguro que desea eliminar el artículo?</p>',
        '<button onclick="borrarArtServer();">Aceptar</button>',
        'borraCodigoModal();');
}

function borrarArtServer() {
    let url = 'api/articulos/'+getIdArticulo(),
        usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'DELETE', 
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    window.location.replace("index.html");
                });
            }
        });
}

function modificarArt() {
    let precio = document.querySelector('#precio').innerHTML.replace(' €','');
    let descp = document.querySelector('#descp').innerHTML.replace(/<br>/gi,'\r');
    let html = '<form id="modArt" onsubmit="modificarArtServer(this); return false;">';
        html += '<p>Nuevo precio:</p>';
        html += `<input type="number" id="prec" name="precio" min="0" max="9999" value="${precio}" step="0.01" required> €`;
        html += '<p>Nueva descripción:</p>';
        html += `<textarea maxlength="300" name="descripcion" required>${descp}</textarea>`;
        html += '</form>';

    modalConfirmacion('MODIFICAR ARTICULO',
        html,
        '<button type="submit" form="modArt">Aceptar</button>',
        'borraCodigoModal();');
}

function modificarArtServer(frm) {
    console.log(frm.descripcion.value);
    let url = 'api/articulos/'+getIdArticulo(),
    fd  = new FormData(frm),
    usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                document.querySelector('#precio').innerHTML = frm.precio.value+' €';
                document.querySelector('#descp').innerHTML = frm.descripcion.value.replace(/\n/gi,'<br>');;

                borraCodigoModal();
                mensajeModal('MODIFICAR ARTICULO',
                    'Se ha modificado correctamente el artículo',
                    'borraCodigoModal();',
                    'Aceptar');
            } else
                console.log('Error en la petición fetch de modificar artículo.');
        });
}*/

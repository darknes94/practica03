// =================================================================================
// Funciones para manejar los modals
// =================================================================================

function mensajeModal(p1,p2,codigoBtn) {
    let html = '';
    html += '<article>';
    html +=   '<h2>SUDOKU</h2>';
    html +=   '<p>'+p1+'</p>';
    html +=   '<p>'+p2+'</p>';
    html +=   '<footer class="modal">'+codigoBtn+'</footer>';
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

function cerrarMensajeModal(tipo) {
    // Borra el html del modal
    document.querySelector('#capa-fondo').remove();
    document.body.removeAttribute('style');

    if (tipo == '0') { // Aceptar de enhorabuena
        finalizar(false);
    } else if (tipo == '1') { // No de la confirmacion
        finalizar(true);
    }
}


// =================================================================================
// Funciones para manejar el canvas
// =================================================================================
var anchCelda = 50;
var regiones = 4;
var subcuadros = 2;
var juego = listaFallos = null;
var clic = errores = false;
var casLlenas = casLlenJuego = 0;

function prepararCanvas() {
    let cv     = document.querySelector('#cvRejilla'),
        aside  = document.querySelector('#juego aside'),
        html   = '<button class="btnFunc" onclick="empezar();">Empezar</button>',
        radios = document.querySelectorAll('#tamanyo input');

    aside.innerHTML = html;
    cv.width  = anchCelda*regiones;
    cv.height = anchCelda*regiones;
    pintarBorde();

    cv.onmousemove = '';
    cv.onclick = '';
    cv.style.cursor = 'auto';

    for (let i = 0; i < radios.length; i++) {
        radios[i].disabled = false;
    }
    radios[0].checked = true;
}

function limpiarCanvas() {
    let cv = document.querySelector('#cvRejilla');
    cv.width = cv.width;
}

function pintarCeldaSeleccionada(cv, fila, columna, filaSub, colSub) {
    let ctx = cv.getContext('2d');
    
    ctx.beginPath();
    ctx.fillStyle = '#A0EEFF';

    // Seleccion vertical e horizontal
    for (let f=0; f<cv.width; f++) {
        ctx.fillRect(f*anchCelda, columna*anchCelda, anchCelda, anchCelda);
        ctx.fillRect(fila*anchCelda, f*anchCelda, anchCelda, anchCelda);
    }

    // Seleccion de la subcuadricula
    ctx.fillRect(filaSub*(anchCelda*subcuadros), colSub*(anchCelda*subcuadros),
        (anchCelda*subcuadros), (anchCelda*subcuadros));
    
    // Celda seleccionada
    pintarCeldaHover(cv, fila, columna);

    // Celdas grises con numeros
    pintarCeldasGrises();

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

function pintarCeldaHover(cv, fila, columna) {
    let ctx = cv.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = '#06B';
    ctx.fillRect(fila*anchCelda, columna*anchCelda, anchCelda, anchCelda);
}

function pintarCeldasGrises() {
    let cv  = document.querySelector('#cvRejilla'),
        ctx = cv.getContext('2d'),
        usu = JSON.parse(sessionStorage['usuario']),
        rAnc  = cAnc = 0,
        mitad = anchCelda/2;

    // Celdas grises con numeros
    for (let row=0; row<usu.SUDOKU.length; row++) {
        for (let col=0; col<usu.SUDOKU.length; col++) {
            rAnc = row*anchCelda;
            cAnc = col*anchCelda;

            if (usu.SUDOKU[col][row] != '0') {
                ctx.beginPath();
                ctx.fillStyle = '#DBDBDB';
                ctx.fillRect(rAnc, cAnc, anchCelda, anchCelda);
            }

            if (juego[col][row] != '0') {
                ctx.beginPath();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 25px sans-serif,arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(juego[col][row],rAnc+mitad, cAnc+mitad);
            }
        }
    }
}

function cambiarCanvas(rbt) {
    let cv  = document.querySelector('#cvRejilla');
    regiones  = rbt.value;
    cv.width  = anchCelda*regiones;
    cv.height = anchCelda*regiones;

    if (regiones == 4) {
        subcuadros = 2;
    } else {
        subcuadros = 3;
    }

    pintarBorde();
}

function empezar() {
    let aside   = document.querySelector('#juego aside'),
        radios  = document.querySelectorAll('#tamanyo input'),
        cv      = document.querySelector('#cvRejilla');

    for (let i = 0; i < radios.length; i++) {
        radios[i].disabled = true;
    }

    let html = '<p>Tiempo: <output class="crono" id="crono-raf">00:00:00</output></p>';
    html += '<button class="btnFunc" onclick="comprobar();">Comprobar</button>';
    html += '<button class="btnFunc" onclick="finalizar(true);">Finalizar</button>';
    aside.innerHTML = html;

    generarSudoku();

    cv.onmousemove = function(evt) {
        let fila = Math.floor(evt.offsetX / (cv.width/regiones)),
            columna = Math.floor(evt.offsetY / (cv.height/regiones));

        if (!clic) {
            if (comprobarCelda(fila, columna)) {
                limpiarCanvas();
                pintarCeldaHover(cv, fila, columna);
                pintarCeldasGrises();
                pintarBorde();
                cv.style.cursor = 'pointer';
            } else {
                limpiarCanvas();
                pintarCeldasGrises();
                pintarBorde();
                cv.style.cursor = 'auto';
            }
        } else {
            if (comprobarCelda(fila, columna)) {
                cv.style.cursor = 'pointer';
            } else {
                cv.style.cursor = 'auto';
            }
        }
    }

    // Activamos la seleccion de celdas
    cv.onclick = function(evt) {
        let fila    = Math.floor(evt.offsetX / (cv.width/regiones)),
            columna = Math.floor(evt.offsetY / (cv.height/regiones)),
            filaSub, colSub;
        
        if (comprobarCelda(fila, columna)) {
            clic = true;
            filaSub = Math.floor(evt.offsetX / (cv.width/subcuadros));
            colSub = Math.floor(evt.offsetY / (cv.height/subcuadros));
    
            limpiarCanvas();
            pintarCeldaSeleccionada(cv, fila, columna, filaSub, colSub);
            anyadirNumDisponibles(fila, columna);
        }
    };

    // Activamos el timer
    iniciarRAF();
}

function comprobarCelda(fila, columna) {
    let usu = JSON.parse(sessionStorage['usuario']);

    if (usu.SUDOKU[columna][fila] == '0')
        return true;
    return false;
}

function anyadirNumDisponibles(fila, columna) {
    eliminarNumDisponibles();

    let aside  = document.querySelector('#juego aside'),
        html   = '',
        div = document.createElement('div');

    div.setAttribute('id','numD');
    html += '<h3>Números disponibles</h3><div>';

    for (let num=0; num<regiones; num++) {
        html += '<button class="btnNum" value="'+(num+1)+'" onclick="selectNumero(this,'+fila+', '+columna+');">'+(num+1)+'</button>';
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

function selectNumero(btn, fila, columna) {
    juego[columna][fila] = parseInt(btn.value);
    eliminarNumDisponibles();
    limpiarCanvas();
    pintarCeldasGrises();
    pintarBorde();

    clic = false;

    // Si todo esta relleno, llamamos a comprobar
    if (comprobarCasillasRellenas()) {
        comprobar();
    }
}

function generarSudoku() {
    let url = 'api/sudoku/generar/'+regiones;

        fetch(url, {method:'POST'}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos) {
                    sessionStorage['usuario'] = JSON.stringify(datos);
                    juego = JSON.parse(sessionStorage['usuario']).SUDOKU.slice();

                    for (let row=0; row<juego.length; row++) {
                        for (let col=0; col<juego.length; col++) {
                            if (juego[col][row] != '0')
                                casLlenas++;
                        }
                    }
                    pintarCeldasGrises();
                    pintarBorde();
                });
            } else 
                console.log('Error al intentar generar el sudoku.');
        });
}

function comprobarCasillasRellenas() {
    let completo = false;

    for (let row=0; row<juego.length; row++) {
        for (let col=0; col<juego.length; col++) {
            if (juego[col][row] != '0')
                casLlenJuego++;
        }
    }

    if (casLlenJuego == (regiones*regiones)){
        completo = true;
    }
    casLlenJuego = 0;
    return completo;
}

function comprobar() {

    let usu = JSON.parse(sessionStorage['usuario']),
        url = 'api/sudoku/'+usu.ID+'/comprobar',
        fd  = new FormData();

    fd.append('juego', JSON.stringify(juego));

    fetch(url, {method:'POST',
        body:fd,
        headers:{'Authorization':usu.TOKEN}}).then(function(respuesta) {

            if(respuesta.ok) {
                respuesta.json().then(function(datos) {

                    console.log(datos.FALLOS.length);
                    console.log(datos.FALLOS);
                    if (datos.FALLOS.length > 0) {
                        listaFallos = datos.FALLOS.slice();

                        mensajeModal('HAY '+datos.FALLOS.length+' ERRORES',
                        '¿Quieres intentr corregir los errores?',
                        '<button onclick="cerrarMensajeModal(2);">Sí</button><button onclick="cerrarMensajeModal(1);">No</button>'
                        );
                    } else {
                        mensajeModal('¡¡¡ENHORABUENA!!!',
                        'Has resuelto el sudoku correctamente en un tiempo de '+document.querySelector('#crono-raf').value,
                        '<button onclick="cerrarMensajeModal(0);">Aceptar</button>'
                        );
                    }
                });
            } else
                console.log('Error en la petición fetch de comprobar SUDOKU.');
        });
}

function finalizar(pararTimer) {
    if (pararTimer)
        pararRAF();

    let usu = JSON.parse(sessionStorage['usuario']),
        url = 'api/sudoku/'+usu.ID;

    fetch(url, {method:'DELETE', 
        headers:{'Authorization':usu.TOKEN}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){

                    delete(sessionStorage['usuario']);
                    regiones = 4;
                    subcuadros = 2;
                    clic = errores = false;
                    juego = listaFallos = null;
                    casLlenas = casLlenJuego = 0;
                    
                    prepararCanvas();
                });
            } else
                console.log('Error en la petición fetch de borrar SUDOKU.');
        });
}


// =================================================================================
// Funciones para manejar el timer
// =================================================================================

function actualizarRAF( timestamp ) {
    if (document.querySelector('#crono-raf').getAttribute('data-parar'))
        return false;

    if (!document.querySelector('#crono-raf').getAttribute('data-valor'))
        document.querySelector('#crono-raf').setAttribute('data-valor', timestamp);

    let valor    = Math.floor((timestamp - parseInt(document.querySelector('#crono-raf').getAttribute('data-valor'))) / 1000),
        horas    = Math.floor(valor / 3600),
        minutos  = Math.floor((valor - horas * 3600) / 60),
        segundos = valor - horas * 36000 - minutos * 60;
    
    horas    = (horas < 10?'0':'') + horas;
    minutos  = (minutos < 10?'0':'') + minutos;
    segundos = (segundos < 10?'0':'') + segundos;

    document.querySelector('#crono-raf').innerHTML = `${horas}:${minutos}:${segundos}`;
    requestAnimationFrame( actualizarRAF );
}

function pararRAF() {
    console.log('Parado');
    document.querySelector('#crono-raf').setAttribute('data-parar', 'si');
}

function iniciarRAF() {
    document.querySelector('#crono-raf').innerHTML = '00:00:00';
    document.querySelector('#crono-raf').removeAttribute('data-parar');
    document.querySelector('#crono-raf').removeAttribute('data-valor');
    requestAnimationFrame( actualizarRAF );
}
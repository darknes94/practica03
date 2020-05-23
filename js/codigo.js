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
var subcuadros = 2;
var juego;
var clic = false;

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

    let html = '<p>Tiempo: 00:00:00</p>';
    html += '<button class="btnFunc" onclick="comprobar();">Comprobar</button>';
    html += '<button class="btnFunc" onclick="finalizar();">Finalizar</button>';
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
}

function comprobarCelda(fila, columna) {
    let usu = JSON.parse(sessionStorage['usuario']);

    if (usu.SUDOKU[columna][fila] == '0')
        return true;
    return false;
}

function pintarCeldaHover(cv, fila, columna) {
    let ctx = cv.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = '#06B';
    ctx.fillRect(fila*anchCelda, columna*anchCelda, anchCelda, anchCelda);
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
}


function generarSudoku() {
    let url = 'api/sudoku/generar/'+regiones;

        fetch(url, {method:'POST'}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos) {
                    console.log(datos);
                    sessionStorage['usuario'] = JSON.stringify(datos);
                    juego = JSON.parse(sessionStorage['usuario']).SUDOKU.slice();
                    pintarCeldasGrises();
                    pintarBorde();
                });
            } else 
                console.log('Error al intentar generar el sudoku.');
        });
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

function comprobar() {

    let usu = JSON.parse(sessionStorage['usuario']),
        url = 'api/sudoku/'+usu.ID+'/comprobar',
        fd  = new FormData();

    /*let cosa = '[';

    for (let i=0; i<juego.length; i++)
        cosa += '['+juego[i]+'],';
    cosa = cosa.substring(0,cosa.length-1);
    cosa += ']';
        console.log(cosa);*/


    fd.append('juego', juego);
    console.log(juego);

    fetch(url, {method:'POST',
        body:fd,
        headers:{'Authorization':usu.TOKEN}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    console.log(datos);
                    /*mensajeModal('NUEVO ARTICULO',
                        'Se ha guardado correctamente el artículo',
                        'cerrarMensajeModal(0,true);',
                        'Aceptar');*/
                });
            } else
                console.log('Error en la petición fetch de comprobar SUDOKU.');
        });
}

function finalizar() {
    let usu = JSON.parse(sessionStorage['usuario']),
        url = 'api/sudoku/'+usu.ID;

    fetch(url, {method:'DELETE', 
        headers:{'Authorization':usu.TOKEN}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){

                    delete(sessionStorage['usuario']);
                    regiones = 4;
                    subcuadros = 2;
                    juego = 4;
                    clic = false;
                    prepararCanvas();
                });
            } else
                console.log('Error en la petición fetch de borrar SUDOKU.');
        });
}
// VARIAVEIS
const janela = {
    isOpen: false,
    som_fecha: new Audio("Sounds/janela_fecha.wav"),
    som_abre: new Audio("Sounds/janela_abre.wav"),
    fechadaImg: "Objects/janela_fechada.svg",
    abertaImg: "Objects/janela_aberta.svg",
    object: document.getElementById('janela'),
    blackoutEffectObj:document.getElementById('janela-blackout')
};

const vase = {
    skinValue: 0,

    skin0Img:"Objects/vaso_skin0.svg",
    skin1Img:"Objects/vaso_skin1.svg",
    object: document.getElementById("vaso")
}

const regador = {

    waterOffset: {x: 50 , y: 50},

    som_watering: new Audio("Sounds/watering.mp3"),
    object: document.getElementById("regador"),
    isDragging: false,
    inicialPos: {x: null, y: null}, 
    normalImg: "Objects/regador_normal.svg",
    viradoImg: "Objects/regador_virado.svg"
}

const paisagem = {
    object: document.getElementById('paisagem'),
    diaImg: "Objects/paisagem_dia.svg",
    noiteImg: "Objects/paisagem_noite.svg"
}

const advanced = {
    buttonObj: document.getElementById("advanced-button"),
    active: false,
    listened: "",
    sound: "",

    codigos: {
        "0521200501131500": "sementes",
        "0000111100001111": "code_memory_clr",
        "2222222222222222":"vaso_skin",
        "7777777777777777":"umidade_20",
        "0000111144447777":"reset_growth",
        "2222444422224444":"skip_24",
        "1111000000000000":"umidade_100",
    }
}

const flower = {
    
    
    wateredLast: null,
    moisture: 0,
    stage:0,

    plantedTime:null,
    targetDate: new Date('2026-02-21T09:00:00').getTime(),
    totalStages: 25,
    imagePath: "Plant/",
    dryingRate: 3.5, // % por hora 

    plantObj: document.getElementById("planta"),

}


const vaseSkins = 2;
const plant_container = document.getElementById("plant-container");
const som_plant = new Audio("Sounds/planting.wav");
let waterInterval = null;
let dayTime = null;
let hasSeed = null;
let seedAlive = null;
let moistureInterval = null;
let notificationTimer = null;
let tempoJogo = Date.now();
let somRegando = null;


// DATA MANAGEMENT 
function saveData(){
    const data = {
        janela_IsOpen: janela.isOpen,
        vase_skinValue: vase.skinValue,
        wall_paintValue: 1,
        day_time: dayTime ,
        has_seed: hasSeed,
        seed_alive: seedAlive,

        f_plantedTime: flower.plantedTime,
        f_wateredLast: flower.wateredLast,
        f_moisture: flower.moisture,
        f_stage: flower.stage,


    };
    localStorage.setItem('SaveData', JSON.stringify(data));
}

function loadData(){
    const saved = localStorage.getItem('SaveData')



    if (saved) {
        const data = JSON.parse(saved);
        janela.isOpen = data.janela_IsOpen;
        vase.skinValue = data.vase_skinValue;
        dayTime = data.day_time;
        hasSeed = data.has_seed;
        seedAlive = data.seed_alive;

        flower.plantedTime = data.f_plantedTime;
        flower.wateredLast = data.f_wateredLast;
        flower.moisture = data.f_moisture;
        flower.stage = data.f_stage;


        

    }

    renderAll();
}

function renderAll() {
    
    
    janela.object.src = janela.isOpen ? janela.abertaImg : janela.fechadaImg;
    vase.object.src = (vase.skinValue == 0) ? vase.skin0Img : vase.skin1Img;
    
    if(seedAlive){
        spawnSeed();
    }

    // Lógica de Blackout (Prioridade: Noite > Janela)
    if (dayTime === 1) {
        // Se for noite, fica escuro sempre
        paisagem.object.src = paisagem.noiteImg;
        janela.blackoutEffectObj.style.opacity = '1';
    } else {
        // Se for dia, a janela controla a luz
        paisagem.object.src = paisagem.diaImg;
        janela.blackoutEffectObj.style.opacity = janela.isOpen ? '0' : '1';
    }

    updatePlantStage();
    
}
// GAME FUNCTIONS

/* MODO AVANÇADO */ {

function ativarModoAvancado() {
    advanced.active = !advanced.active;
    advanced.listened = ""; // Reseta sempre que clica no botão
    
    advanced.buttonObj.classList.toggle('active', advanced.active);
    
    if (advanced.active) {
        console.log("Modo avançado: Escutando...");
    }
}

document.addEventListener('keydown', (e) => {
    if (!advanced.active) return;

    // Captura apenas números
    if (!isNaN(e.key) && e.key !== " ") {
        advanced.listened += e.key;

        // Ao atingir os 16 dígitos
        if (advanced.listened.length === 16) {
            codigoManager(advanced.listened);
        }
    }
});

function finalizarModoAvancado() {
    advanced.active = false;
    advanced.listened = "";
    advanced.buttonObj.classList.remove('active');
}

}


function codigoManager(codigo){
    const produto = advanced.codigos[codigo]

    if (produto) {
        if (produto === "sementes"){
            if (!hasSeed) {
                notify("Código resgatado com sucesso!", 5000);
                hasSeed = true;
                seedAlive = true;

                spawnSeed();

                saveData();

            } else {
                notify("Esse código já foi resgatado.");

            }
        }else if (produto === "code_memory_clr"){

            hasSeed = null;
            flower.stage = 0;
            flower.plantedTime = null;
            saveData();
            renderAll();
            notify("Memória limpa com êxito",5000);
    
        }else if (produto === "vaso_skin"){

            vase.skinValue = (vase.skinValue === 0) ? 1 : 0;
            saveData();
            notify('Skin de "Vaso" foi alterada');
            renderAll();
    
        } else if (produto === "umidade_20"){

            flower.moisture = 0.2;
            saveData();
            notify('Umidade alterada para: 20%');
            
    
        } else if (produto === "umidade_100"){

            flower.moisture = 1;
            saveData();
            notify('Umidade alterada para: 100%');
            
    
        } else if (produto === "skip_24"){

            skipTime(24);
            
    
        } else if (produto === "reset_growth"){


            flower.plantedTime = Date.now();
            flower.stage = 0;
            saveData();
            renderAll()
            notify('Crescimento da planta resetado');
            
    
        } else {

            

        }
    } else {

        notify("Código inválido ou inexistente",5000);

    }

    finalizarModoAvancado();

}

function dizerHoras(){
    const agora = new Date();
    notify(`Agora são ${agora.getHours()}:${agora.getMinutes().toString().padStart(2, '0')}`);
}

function dizerUmidade(){
    notify(`Umidade: ${(flower.moisture * 100).toFixed(0)}%`)
}

function notify(text, duration = 1500) {

    const notifyObj = document.getElementById("notification");

    console.log("TO USER: ", text);

    // Cancela o timer anterior se ele existir
    if (notificationTimer) {
        clearTimeout(notificationTimer);
    }

    notifyObj.innerText = text;
    notifyObj.style.opacity = "1";

    // Cria o novo timer
    notificationTimer = setTimeout(() => {
        notifyObj.style.opacity = "0";
        notificationTimer = null;
    }, duration);
}

setInterval(minuteTick, 1000*60);
function minuteTick() {
    

    moisture('remove')

    const agora = new Date;
    const agoraMinutos = (agora.getHours() * 60) + agora.getMinutes();
    
    //noite set
    if (agoraMinutos < 320 || agoraMinutos > 1160 ) {
        noite()
    } else {
        dia()
    }
    
    tempoJogo = Date.now();

    atualizarRelogio();
    saveData()
    
}

function moisture(type, percent = null) {
    const value = percent / 100; 

    const agora = Date.now()

    if (type === 'add') {
        if (agora - flower.wateredLast < 500) return; // Anti-spam
        flower.moisture = Math.min(1, flower.moisture + value);
        flower.wateredLast = agora;
        notify(`Umidade: ${(flower.moisture * 100).toFixed(0)}%`,2000);
        saveData();
    } 
    else if (type === 'remove') {
        if (!flower.wateredLast) {
            flower.wateredLast = Date.now();
            return;
        }

        const agora = Date.now();
        const msPassados = agora - flower.wateredLast;
        
        // Se passou menos de 1 segundo, ignora para evitar erro de arredondamento
        if (msPassados < 1000) return;

        const horasPassadas = msPassados / (1000 * 60 * 60);
        const perdaTotal = (horasPassadas * flower.dryingRate) / 100;

        flower.moisture = Math.max(0, flower.moisture - perdaTotal);
        flower.wateredLast = agora;
        console.log(flower.wateredLast);

        saveData()
        
    }
    else if (type === 'set') {
        // Assume que 'percent' vem como valor inteiro (ex: 20 para 20%)
        flower.moisture = Math.max(0, Math.min(1, percent / 100));
        flower.wateredLast = agora; 
    }
    

}

function updatePlantStage() {
    const plantaImg = flower.plantObj;
    if (!plantaImg || !flower.plantedTime) {
        if(plantaImg) plantaImg.style.display = "none";
        return;
    }

    // USAMOS tempoJogo EM VEZ DE Date.now()
    const agora = tempoJogo; 
    const inicio = Number(flower.plantedTime);
    const fim = Number(flower.targetDate);

    const tempoTotal = fim - inicio;
    const tempoPassado = agora - inicio;
    
    let progresso = tempoPassado / tempoTotal;
    progresso = Math.max(0, Math.min(1, progresso));

    // Multiplicamos por 20 estágios
    let estagioAtual = Math.floor(progresso * flower.totalStages);

    if (estagioAtual > 0) {
        plantaImg.style.display = "block";
        const imgNum = Math.min(estagioAtual, flower.totalStages);
        plantaImg.src = `${flower.imagePath}${imgNum}.svg`;
        flower.stage = imgNum;
    } else {
        plantaImg.style.display = "none";
        flower.stage = 0;
    }

    console.log("Horas restantes reais:", ((fim - agora) / 1000 / 60 / 60).toFixed(1));
}


function noite(){
    dayTime = 1
    //janela.blackoutEffectObj.style.opacity = "1";
    
    saveData()
    renderAll()
}

function dia(){
    dayTime = 0
    //janela.blackoutEffectObj.style.opacity = "0";
    
    saveData()
    renderAll()
}

function spawnSeed(){
    const sementeCont = document.getElementById("semente-container");
        
        sementeCont.style.display = 'flex';
        sementeCont.style.left = ""; 
        sementeCont.style.top = "";
        sementeCont.classList.remove('retornando');
}

function skipTime(horas) {
    const msParaPular = horas * 60 * 60 * 1000;
    
    // Avançamos o "relogio" do jogo
    tempoJogo += msParaPular;

    if (flower.wateredLast) {
        flower.wateredLast = Number(flower.wateredLast) - msParaPular;
    }

    moisture('remove');
    renderAll();
    notify(`Tempo avançado: +${horas}h. Estágio: ${flower.stage}`);
}


/* REGADOR SETUP */ {
    const regador_container = document.getElementById("regador-container");
    const regador_img = regador.object;

    function capturarPosicaoOriginal() {
    // 1. Remove classes de animação
    regador_container.classList.remove('retornando');
    
    // 2. IMPORTANTE: Limpa as posições manuais para o CSS original assumir
    regador_container.style.left = "";
    regador_container.style.top = "";
    regador_container.style.bottom = ""; // Limpa possíveis conflitos
    regador_container.style.right = "";

    // 3. Agora que ele está no lugar "natural", lemos a posição
    const rect = regador_container.getBoundingClientRect();
    regador.inicialPos.x = rect.left;
    regador.inicialPos.y = rect.top;
}

    window.addEventListener('resize', () => {
        // Se o regador não estiver sendo arrastado, recalcula a "casa" dele
        if (!regador.isDragging) {
            capturarPosicaoOriginal();
        }
    });

    window.addEventListener('load', capturarPosicaoOriginal);
    window.addEventListener('resize', capturarPosicaoOriginal);

    regador_img.addEventListener("mousedown", (e) => {
        e.preventDefault();
        regador.isDragging = true;
        regador_container.classList.remove('retornando');
    });

    document.addEventListener('mousemove', (e) => {
        if (!regador.isDragging) return;

        let x = e.clientX - (regador_container.clientWidth / 2);
        let y = e.clientY - (regador_container.clientHeight / 2);
        
        regador_container.style.left = x + "px";
        regador_container.style.top = y + "px";
        regador_container.style.bottom = "auto";
        regador_container.style.right = "auto";

        const colidindo = checarColisao(regador_img, plant_container);

        if (colidindo) {
            if (regador_img.src !== regador.viradoImg) {
                regador_img.src = regador.viradoImg;
            }

            

            // Jorro visual
            if (!waterInterval) {

                //SOM ESTA AQUI SEU CEGO
                tocarSom(regador.som_watering, 1, true);

                waterInterval = setInterval(() => {
                    const quantidade = Math.floor(Math.random() * 3) + 3; 
                    for (let i = 0; i < quantidade; i++) { soltarAgua(); }
                }, 60);
            }

            // Lógica de Umidade corrigida
            if (!moistureInterval) {
                const cicloAleatorio = () => {
                    // SE NÃO ESTIVER MAIS COLIDINDO OU ARRASTANDO, PARA TUDO
                    const aindaColidindo = checarColisao(regador_img, plant_container);
                    if (!regador.isDragging || !aindaColidindo) {
                        clearTimeout(moistureInterval);
                        moistureInterval = null;
                        return;
                    }

                    moisture('add', Math.random() * 2 + 2);
                    const proximoTempo = Math.random() * 1000 + 1200;
                    moistureInterval = setTimeout(cicloAleatorio, proximoTempo);
                };
                cicloAleatorio();
            }            

        } else {
            regador_img.src = regador.normalImg;
            pararDeRegar(); // Aqui limpamos os intervalos ao sair da colisão
        }
    });

    function pararDeRegar() {
        clearInterval(waterInterval);
        clearTimeout(moistureInterval);
        waterInterval = null;
        moistureInterval = null; // ESSENCIAL: Permite regar novamente depois



        //SOM AQUI TAMBEM

        regador.som_watering.loop = false;
        regador.som_watering.currentTime = regador.som_watering.duration;


    }

    document.addEventListener('mouseup', () => {
        if (!regador.isDragging) return;
        regador.isDragging = false;

        regador_container.classList.add('retornando');
        regador_container.style.left = regador.inicialPos.x + "px";
        regador_container.style.top = regador.inicialPos.y + "px";

        setTimeout(() => {
            if (!regador.isDragging) {
                regador_container.style.left = "";
                regador_container.style.top = "";
                regador_container.classList.remove('retornando');
            }
        }, 600);

        regador_img.src = regador.normalImg;
        pararDeRegar();
    });
}


function soltarAgua() {

    const rect = regador.object.getBoundingClientRect();
    const rectPlant = plant_container.getBoundingClientRect();
    const gota = document.createElement('div');
    gota.className = 'gota';
    document.body.appendChild(gota);

    // Posiciona na borda esquerda (X) e no centro da altura (Y) do regador
    let randomOffset = (Math.random() - 0.5) * 25; 
    let posX = rect.left + randomOffset + regador.waterOffset.x; 
    let posY = rect.top + (rect.height / 2) + regador.waterOffset.y;
    
    let velY = Math.random()*2; 
    const gravidade = 0.5;

    const animarGota = setInterval(() => {
        velY += gravidade;
        posY += velY;
        
        gota.style.left = posX + "px";
        gota.style.top = posY + "px";


        if (posY > rectPlant.bottom) { // O -20 é para sumir "dentro" do vaso
            gota.remove();
            clearInterval(animarGota);
        }

        if (posY > window.innerHeight - 100) {
            gota.remove();
            clearInterval(animarGota);
        }
    }, 20);
}

function recalcularPosicaoSemente() {
    const sementeCont = document.getElementById("semente-container");
    if (sementeCont) {
        // Limpa posições antigas
        sementeCont.style.left = "";
        sementeCont.style.top = "";
        
        // Mede a posição real definida pelo seu CSS (bottom/left 5%)
        const rect = sementeCont.getBoundingClientRect();
        
        // Como 'inicialPos' está dentro do escopo da sua outra função, 
        // a forma mais simples de corrigir é disparar um evento de redimensionamento
        // ou garantir que o rect seja lido.
        window.dispatchEvent(new Event('resize'));
    }
}

function checarColisao(el1, el2) {
    const r1 = el1.getBoundingClientRect();
    const r2 = el2.getBoundingClientRect();
    return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function inicializarItensArrastaveis() {
    const itens = document.querySelectorAll('.arrastavel');
    const alvoVaso = document.getElementById('vaso');

    itens.forEach(container => {
        const img = container.querySelector('img');
        let isDragging = false;

        // Tornamos a função de reset acessível globalmente através do elemento
        container.resetarParaHome = () => {
            container.classList.remove('retornando');
            container.style.left = "";
            container.style.top = "";
            const rect = container.getBoundingClientRect();
            // Guardamos a posição no próprio elemento para o MouseUp ler depois
            container.dataset.homeX = rect.left;
            container.dataset.homeY = rect.top;
        };

        window.addEventListener('load', container.resetarParaHome);
        window.addEventListener('resize', container.resetarParaHome);

        img.addEventListener("mousedown", (e) => {
            e.preventDefault();
            isDragging = true;
            container.classList.remove('retornando');
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            container.style.left = (e.clientX - container.clientWidth / 2) + "px";
            container.style.top = (e.clientY - container.clientHeight / 2) + "px";

            if (checarColisao(container, alvoVaso)) {
                img.classList.add('interagindo');
            } else {
                img.classList.remove('interagindo');
            }
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;
            img.classList.remove('interagindo');

            if (checarColisao(container, alvoVaso) && container.id === "semente-container") {
                plantar(); 
                container.style.display = "none";
            } else {
                // Se soltar fora do vaso, em vez de animar para um ponto X,Y que pode estar errado...
                // ...nós simplesmente limpamos o estilo e deixamos o CSS original puxar ela de volta
                container.classList.add('retornando');
                container.style.left = ""; 
                container.style.top = "";
                
                // Remove a classe de animação depois que ela chegar no canto
                setTimeout(() => {
                    container.classList.remove('retornando');
                }, 500);
            }
        });
    });
}


function plantar(){

const agora = new Date();

    // Formata para o padrão: "14 de fevereiro, às 22:24"
    const dataFormatada = agora.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(',', ' às'); 

    notify(`Semente plantada com sucesso em ${dataFormatada}`,6000);
    
    seedAlive = false;

    tocarSom(som_plant, 1);

    flower.plantedTime = Date.now();
    saveData();
    renderAll();


}

function janelaInteract() {
    
    if (janela.isOpen) {
        
        tocarSom(janela.som_fecha,0.5);

    } else {

        tocarSom(janela.som_abre,0.5);

    }
    
    janela.isOpen = !janela.isOpen;
    
    saveData();
    renderAll();
}

function atualizarRelogio() {
    const agora = new Date();
    
    const fuso = -3;

    const horas = (agora.getHours() % 12) + fuso;
    const minutos = agora.getMinutes();
    const segundos = agora.getSeconds();

    // Cálculos de rotação
    const grausSegundos = segundos * 6; // 360 / 60 = 6
    const grausMinutos = minutos * 6 + (segundos * 0.1);
    const grausHoras = (horas * 30) + (minutos * 0.5);

    // Aplicando ao elemento (exemplo com ponteiro de horas)
    const ponteiroHoras = document.getElementById('relogio-horas');
    if (ponteiroHoras) {
        ponteiroHoras.style.transform = `rotate(${grausHoras}deg)`;
    }
    const ponteiroMinutos = document.getElementById('relogio-minutos')
    if (ponteiroMinutos) {
        ponteiroMinutos.style.transform = `rotate(${grausMinutos}deg)`;
    }
}

function tocarSom(audio, volume = 1.0, loop = false){
    audio.currentTime = 0;
    audio.loop = loop;
    audio.volume = volume;
    audio.play();
}







loadData();
console.log(flower.wateredLast);
inicializarItensArrastaveis();
minuteTick();

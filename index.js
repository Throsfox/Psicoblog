// Futura memória provisoria

const estadoSalvo = {};











// todos os overlays + função de fechar todas as telas de avaliação
const overlayDiferente = {
    entrada: document.getElementById("overlayEntrada")
}

const overlays = {
    saude: document.getElementById("overlaySaude"),
    aparencia: document.getElementById("overlayAparencia"),
    carisma: document.getElementById("overlayCarisma"),
    inteligencia: document.getElementById("overlayInteligencia"),
    espiritualidade: document.getElementById("overlayEspiritualidade")
}

function fecharTodosOverlays() {
    Object.values(overlays).forEach(ov => {
        ov.classList.remove("aberto");
    });
}
function fecharOverlayEntrada() {
    overlayDiferente.entrada.classList.add("fechado")

}

// função para criação e controle do estado das telas

function CapturarEstado(overlay) {
    return {
        respostas: [...overlay.querySelectorAll(".botoes")].map(grupo => {
            const selecionado = grupo.querySelector(".selecionado");
            return selecionado ? selecionado.textContent : null;
        }),
        nota: overlay.querySelector(".slider-nota")?.value ?? 0,
        texto: overlay.querySelector(".justificativa")?.value ?? ""
    };
}

function aplicarEstado(overlay, estado) {
    if (!estado) return;

    const grupos = overlay.querySelectorAll(".botoes");

    grupos.forEach((grupo, i) => {
        grupo.querySelectorAll("button").forEach(botao => {
            botao.classList.toggle(
                "selecionado",
                botao.textContent === estado.respostas[i]
            );
        });
    });

    const slider = overlay.querySelector(".slider-nota");
    const span = overlay.querySelector(".valor-nota");
    if (slider && span) {
        slider.value = estado.nota;
        span.textContent = estado.nota;
    }

    const textarea = overlay.querySelector(".justificativa");
    if (textarea) textarea.value = estado.texto;
}

//abrir as overlays e aplicar o estado salvo

Object.keys(overlays).forEach(atributo => {
    const botao = document.getElementById(atributo);
    const overlayAtual = overlays[atributo];

    botao.addEventListener("click", () => {
        fecharTodosOverlays();

        const estado = estadoSalvo[atributo];
        aplicarEstado(overlayAtual, estado);

        AtualizarSlider(overlayAtual);

        overlayAtual.classList.add("aberto");
    });
});

// botão para fechar

document.querySelectorAll(".fechar").forEach(botaoFechar => {
    botaoFechar.addEventListener("click", () => {
        const Entrada = botaoFechar.closest(".Entrada");

        if (Entrada) {
            fecharOverlayEntrada();
        } else {
            fecharTodosOverlays();
        }  
    });
});

// função para seleção dos botões para respostas das perguntas

document.querySelectorAll(".botoes") .forEach(grupo => {
    const botoes = grupo.querySelectorAll("button");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {

            botao.classList.add("selecionado");

            botoes.forEach(outrobotao => {
                if (outrobotao !== botao) {
                    outrobotao.classList.remove("selecionado");
                }
            });
            const overlay = botao.closest(".overlay");
            AtualizarSlider(overlay);
        });
    });
});

// função para fazer o slider de escolha de nota funcionar

document.querySelectorAll(".overlay").forEach(overlay => {

    const slider = overlay.querySelector(".slider-nota");
    const span = overlay.querySelector(".valor-nota");

    if (!slider || !span) return;

    span.textContent = slider.value;

    slider.addEventListener("input", () => {
        span.textContent = slider.value;
    });

});

// função para fazer o calculo do overlay e função para atualizar o mesmo

function CalcularPontuacao(overlay) {
    let soma = 0;

    overlay.querySelectorAll(".botoes").forEach(grupo => {
        const selecionado = grupo.querySelector(".selecionado");
        if (selecionado) {
            soma += Number(selecionado.dataset.valor);
        }
    });
    return soma;
}

function AtualizarSlider(overlay) {

    const slider = overlay.querySelector(".slider-nota");
    const span = overlay.querySelector(".valor-nota");

    if (!slider || !span) return;

    const pontos = CalcularPontuacao(overlay);
    const novoMax = 5 + pontos;
    slider.max = novoMax;
    
    if (Number(slider.value) > novoMax) {
        slider.value = novoMax;
        span.textContent = novoMax;
    };
}


// função para o botão "concluir"

document.querySelectorAll(".concluir").forEach(botao => {
    botao.addEventListener("click", () => {

        const atributo = botao.dataset.atributo;
        const card = document.getElementById(atributo);
        const overlay = botao.closest(".overlay");

        if (!atributo || !card || !overlay) return;

        const grupos = overlay.querySelectorAll(".botoes");
        const faltandoResposta = [...grupos].some(
            grupo => !grupo.querySelector(".selecionado")
        );
        if (faltandoResposta) {
            alert("Responda todas as perguntas para prosseguir.");
            return;
        }
            
        const slider = overlay.querySelector(".slider-nota");
        const nota = slider ? slider.value : 0;
        const spanResultado = document.getElementById(`nota-registro-${atributo}`);
        if (spanResultado) 
            spanResultado.textContent = nota;

        estadoSalvo[atributo] = {
            ...CapturarEstado(overlay),
            nota: nota
        };

        card.dataset.estado = "concluido";
        card.classList.remove("pendente");
        card.classList.add("concluido");
        overlay.classList.remove("aberto");
    });
});
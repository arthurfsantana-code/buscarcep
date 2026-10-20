const campoCep = document.querySelector("#cep");
const mensagem = document.querySelector("#mensagem");
const camposEndereco = {
    logradouro: document.querySelector("#logradouro"),
    complemento: document.querySelector("#complemento"),
    bairro: document.querySelector("#bairro"),
    localidade: document.querySelector("#localidade"),
    uf: document.querySelector("#uf")
};

let controladorBusca;
let idBusca = 0;

function limparEndereco() {
    Object.values(camposEndereco).forEach((campo) => {
        campo.value = "";
    });
}

function exibirMensagem(texto, tipo = "") {
    mensagem.textContent = texto;
    mensagem.className = `mensagem${tipo ? ` ${tipo}` : ""}`;
}

async function buscarCep(cep) {
    const idAtual = ++idBusca;
    controladorBusca = new AbortController();
    exibirMensagem("Buscando endereço...");

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
            signal: controladorBusca.signal
        });

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar o serviço ViaCEP.");
        }

        const endereco = await resposta.json();

        if (endereco.erro) {
            throw new Error("CEP não encontrado. Confira os números e tente novamente.");
        }

        if (idAtual !== idBusca) {
            return;
        }

        Object.entries(camposEndereco).forEach(([campo, elemento]) => {
            elemento.value = endereco[campo] || "";
        });
        exibirMensagem("Endereço preenchido com sucesso.", "sucesso");
    } catch (erro) {
        if (erro instanceof Error && erro.name === "AbortError") {
            return;
        }

        if (idAtual === idBusca) {
            exibirMensagem(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao consultar o CEP. Tente novamente.",
                "erro"
            );
        }
    }
}

campoCep.addEventListener("input", () => {
    const digitos = campoCep.value.replace(/\D/g, "").slice(0, 8);
    campoCep.value = digitos.length > 5
        ? `${digitos.slice(0, 5)}-${digitos.slice(5)}`
        : digitos;
    campoCep.setCustomValidity("");
    controladorBusca?.abort();
    idBusca += 1;
    limparEndereco();
    exibirMensagem("");

    if (digitos.length === 8) {
        buscarCep(digitos);
    }
});

campoCep.addEventListener("blur", () => {
    const cep = campoCep.value.replace(/\D/g, "");

    if (cep.length > 0 && cep.length !== 8) {
        campoCep.setCustomValidity("Digite um CEP com 8 números.");
        exibirMensagem("O CEP deve conter exatamente 8 dígitos.", "erro");
    }
});

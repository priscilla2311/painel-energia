let grafico;

// BASE DE APARELHOS
const baseAparelhos = {
  // BANHEIRO
  "Chuveiro": 5500,
  "Secador de cabelo": 1200,

  // COZINHA
  "Geladeira": 150,
  "Geladeira duplex": 250,
  "Freezer": 200,
  "Micro-ondas": 1200,
  "Microondas": 1200,
  "Forno elétrico": 2000,
  "Air fryer": 1500,
  "Liquidificador": 300,
  "Cafeteira": 800,
  "Sandwicheira": 800,

  // SALA / QUARTO
  "Tv": 120,
  "Televisão": 120,
  "Tv 50": 150,
  "Videogame": 200,
  "Computador": 300,
  "Notebook": 100,
  "Roteador": 20,
  "Modem": 15,
  "Som": 100,

  // CLIMATIZAÇÃO
  "Ar-condicionado": 1200,
  "Ar condicionado": 1200,
  "Ar 9000": 900,
  "Ar 12000": 1200,
  "Ventilador": 80,

  // ILUMINAÇÃO
  "Lâmpada": 10,
  "Lampada": 10,
  "Lâmpada led": 10,
  "Lampada led": 10,

  // LAVANDERIA
  "Máquina de lavar roupa": 1000,
  "Maquina de lavar roupa": 1000,
  "Lavadora": 1000,
  "Secadora": 2000,
  "Ferro de passar": 1000,

  // GENÉRICOS (sempre por último)
  "Máquina": 1000,
  "Maquina": 1000,
  "Micro": 1000,
  "Ar": 1200
};

// CONVERTER HORAS
function converterHoras(valor) {
  if (!valor) return 0;

  valor = valor.toString().toLowerCase().trim();

  if (valor.includes("h")) {
    const partes = valor.split("h");
    const horas = parseFloat(partes[0]) || 0;
    const minutos = parseFloat(partes[1]) || 0;
    return horas + (minutos / 60);
  }

  if (valor.includes("min")) {
    return parseFloat(valor) / 60;
  }

  return parseFloat(valor) || 0;
}

// TEMA
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
}

// BUSCAR POTÊNCIA
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarPotencia(nomeDigitado) {
  const nome = normalizar(nomeDigitado);

  for (let chave in baseAparelhos) {
    const chaveNormalizada = normalizar(chave);

    //  Aceita começo da palavra também
    if (
      nome.includes(chaveNormalizada) ||
      chaveNormalizada.includes(nome)
    ) {
      return baseAparelhos[chave];
    }
  }

  return 0;
}

// AUTO SUGESTÃO
function sugerirPotenciaPorNome(input) {
  mostrarSugestoes(input);
}

function mostrarSugestoes(input) {
  const valor = normalizar(input.value);

  const listaAntiga = input.parentElement.querySelector(".lista-sugestoes");
  if (listaAntiga) listaAntiga.remove();

  if (!valor) return;

  const lista = document.createElement("div");
  lista.classList.add("lista-sugestoes");

  let encontrou = false;

  for (let chave in baseAparelhos) {
    const chaveNormalizada = normalizar(chave);

    if (chaveNormalizada.includes(valor)) {
      encontrou = true;

      const item = document.createElement("div");
      item.classList.add("item-sugestao");
      item.innerText = `${chave} - ${baseAparelhos[chave]}W`;

      item.onclick = function () {
	  const linha = input.closest("tr");
	  const inputs = linha.querySelectorAll("input");

	  inputs[0].value = chave;
	  inputs[1].value = baseAparelhos[chave];

	  lista.remove();

	  calcular();
	  ativarRecalculoAutomatico();
	};

      lista.appendChild(item);
    }
  }

  if (encontrou) {
    input.parentElement.appendChild(lista);
  }
}

function navegarSugestoes(event, input) {
  const lista = input.parentElement.querySelector(".lista-sugestoes");
  if (!lista) return;

  const itens = lista.querySelectorAll(".item-sugestao");
  if (itens.length === 0) return;

  let atual = Array.from(itens).findIndex(item =>
    item.classList.contains("ativo")
  );

  if (event.key === "ArrowDown") {
    event.preventDefault();

    if (atual >= 0) {
      itens[atual].classList.remove("ativo");
    }

    atual = atual < itens.length - 1 ? atual + 1 : 0;
    itens[atual].classList.add("ativo");
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();

    if (atual >= 0) {
      itens[atual].classList.remove("ativo");
    }

    atual = atual > 0 ? atual - 1 : itens.length - 1;
    itens[atual].classList.add("ativo");
  }

  if (event.key === "Enter") {
    event.preventDefault();

    if (atual >= 0) {
      itens[atual].click();
    }
  }

  if (event.key === "Escape") {
    lista.remove();
  }
}

// BOTÃO ⚡
function sugerirPotenciaManual(btn) {
  const linha = btn.closest("tr");

  const nome = linha.querySelectorAll("input")[0].value;
  const potencia = buscarPotencia(nome);

  if (potencia > 0) {
    linha.querySelectorAll("input")[1].value = potencia;
    calcular();
  } else {
    alert("Digite algo como: geladeira, tv, chuveiro...");
  }
}

// ADICIONAR LINHA (CORRIGIDO)
function adicionarLinha() {
  const tbody = document.getElementById("corpoTabela");

  const novaLinha = `
    <tr>
      <td><input value="Novo aparelho" oninput="sugerirPotenciaPorNome(this)" onkeydown="navegarSugestoes(event, this)"></td>
      <td>
        <input type="number" value="0">
        <button onclick="sugerirPotenciaManual(this)">⚡</button>
      </td>
      <td><input type="text" placeholder="Ex:9min,1h"></td>
      <td><input type="checkbox"></td>
      <td class="consumoDia">0</td>
      <td class="consumoMes">0</td>
      <td class="custo">R$ 0,00</td>
	  <td class="nivel"></td>
      <td>
        <button class="btn-remover" onclick="removerLinha(this)">✕</button>
      </td>
    </tr>
  `;

  tbody.insertAdjacentHTML("beforeend", novaLinha);
  calcular();
}

// REMOVER
function removerLinha(btn) {
  const confirmar = confirm("Tem certeza que deseja remover este aparelho?");
  if (!confirmar) return;

  btn.closest("tr").remove();

  calcular();
  ativarRecalculoAutomatico(); 
}

// CALCULAR
function calcular() {
  const tarifa = parseFloat(document.getElementById("tarifa").value) || 0;

  let totalMes = 0;
  let custoTotal = 0;

  const labels = [];
  const dados = [];

  document.querySelectorAll("#corpoTabela tr").forEach(linha => {
    const inputs = linha.querySelectorAll("input");

    const nome = inputs[0].value;
    const potencia = parseFloat(inputs[1].value) || 0;
    const horas = converterHoras(inputs[2].value);

    const isInverter = inputs[3]?.checked;
	const fator = isInverter ? 0.6 : 1;

	const consumoDia = (potencia * horas * fator) / 1000;
	const consumoMes = consumoDia * 30;
	
	let nivel = "";
	let classe = "";

	if (consumoMes > 200) {
	  nivel = "🔴 Alto consumo";
	  classe = "alto";
	} else if (consumoMes > 50) {
	  nivel = "🟡 Médio";
	  classe = "medio";
	} else {
	  nivel = "🟢 Baixo";
	  classe = "baixo";
	}
	
    const custo = consumoMes * tarifa;

    linha.querySelector(".consumoDia").innerText = consumoDia.toFixed(2);
    linha.querySelector(".consumoMes").innerText = consumoMes.toFixed(2);
    linha.querySelector(".custo").innerText =
      custo.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
	  
	let colunaNivel = linha.querySelector(".nivel");

	colunaNivel.innerText = nivel;
	colunaNivel.className = "nivel " + classe;  

    totalMes += consumoMes;
    custoTotal += custo;

    labels.push(nome);
    dados.push(consumoMes);
  });

  document.getElementById("resultado").innerHTML = `
    Consumo total: <strong>${totalMes.toFixed(2)} kWh/mês</strong><br>
    Custo estimado: <strong>${custoTotal.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    })}</strong>
  `;

  atualizarGrafico(labels, dados);
}

// GRÁFICO
function atualizarGrafico(labels, dados) {
  const ctx = document.getElementById("graficoConsumo").getContext("2d");

  if (grafico) grafico.destroy();

  const coresAplicadas = labels.map((_, i) =>
    `hsl(${(i * 137) % 360}, 70%, 50%)`
  );

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: dados,
        backgroundColor: coresAplicadas,
        borderColor: "#ffffff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 20,
            padding: 15
          }
        },
        title: {
          display: true,
          text: "Distribuição do Consumo Mensal"
        }
      }
    }
  });
}

function ativarRecalculoAutomatico() {
  document.querySelectorAll("#corpoTabela input, #tarifa").forEach(input => {
    input.removeEventListener("input", calcular);
    input.addEventListener("input", calcular);
  });
}
// 🔁 RECÁLCULO AUTOMÁTICO
ativarRecalculoAutomatico();

// FECHAR SUGESTÕES AO CLICAR FORA
document.addEventListener("click", function(e) {
  document.querySelectorAll(".lista-sugestoes").forEach(lista => {
    if (!lista.contains(e.target)) {
      lista.remove();
    }
  });
});

window.onload = calcular;
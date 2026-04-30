let grafico;

// BASE DE APARELHOS
const baseAparelhos = {
  // BANHEIRO
  "chuveiro": 5500,
  "secador de cabelo": 1200,

  // COZINHA
  "geladeira": 150,
  "geladeira duplex": 250,
  "freezer": 200,
  "micro-ondas": 1200,
  "microondas": 1200,
  "forno elétrico": 2000,
  "air fryer": 1500,
  "liquidificador": 300,
  "cafeteira": 800,
  "sandwicheira": 800,

  // SALA / QUARTO
  "tv": 120,
  "televisão": 120,
  "tv 50": 150,
  "videogame": 200,
  "computador": 300,
  "notebook": 100,
  "roteador": 20,
  "modem": 15,
  "som": 100,

  // CLIMATIZAÇÃO
  "ar-condicionado": 1200,
  "ar condicionado": 1200,
  "ar 9000": 900,
  "ar 12000": 1200,
  "ventilador": 80,

  // ILUMINAÇÃO
  "lâmpada": 10,
  "lampada": 10,
  "lâmpada led": 10,
  "lampada led": 10,

  // LAVANDERIA
  "máquina de lavar roupa": 1000,
  "maquina de lavar roupa": 1000,
  "lavadora": 1000,
  "secadora": 2000,
  "ferro de passar": 1000,

  // GENÉRICOS (sempre por último)
  "máquina": 1000,
  "maquina": 1000,
  "micro": 1000,
  "ar": 1200
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
      };

      lista.appendChild(item);
    }
  }

  if (encontrou) {
    input.parentElement.appendChild(lista);
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
      <td><input value="Novo aparelho" oninput="sugerirPotenciaPorNome(this)"></td>
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

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: dados,
        backgroundColor: [
          "#ef4444",
          "#3b82f6",
          "#f59e0b",
          "#8b5cf6",
          "#14b8a6",
          "#22c55e"
        ]
      }]
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
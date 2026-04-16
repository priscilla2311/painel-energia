let grafico;

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
}

function adicionarLinha() {
  const tbody = document.getElementById("corpoTabela");

  const novaLinha = `
    <tr>
      <td><input value="Novo aparelho"></td>
      <td><input type="number" value="0"></td>
      <td><input type="number" value="0"></td>
      <td class="consumoDia">0</td>
      <td class="consumoMes">0</td>
      <td class="custo">R$ 0,00</td>
      <td>
        <button class="btn-remover" onclick="removerLinha(this)" title="Remover aparelho">
          ✕
        </button>
      </td>
    </tr>
  `;

  tbody.insertAdjacentHTML("beforeend", novaLinha);
  ativarRecalculoAutomatico();
}

function removerLinha(botao) {
  const confirmar = confirm("Tem certeza que deseja remover este aparelho?");
  if (!confirmar) return;

  botao.closest("tr").remove();
  calcular();
}

function calcular() {
  const loading = document.getElementById("loading");
  loading.classList.add("ativo");

  setTimeout(() => {

    const tarifa = parseFloat(document.getElementById("tarifa").value) || 0;
    const linhas = document.querySelectorAll("#corpoTabela tr");

    let totalMes = 0;
    let custoTotal = 0;

    const labels = [];
    const dadosGrafico = [];

    linhas.forEach(linha => {
      const inputs = linha.querySelectorAll("input");

      const nome = inputs[0].value || "Aparelho";
      const potencia = parseFloat(inputs[1].value) || 0;
      const horas = parseFloat(inputs[2].value) || 0;

      const consumoDia = (potencia * horas) / 1000;
      const consumoMes = consumoDia * 30;
      const custo = consumoMes * tarifa;

      linha.querySelector(".consumoDia").innerText = consumoDia.toFixed(2);
      linha.querySelector(".consumoMes").innerText = consumoMes.toFixed(2);
      linha.querySelector(".custo").innerText =
        custo.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        });

      totalMes += consumoMes;
      custoTotal += custo;

      labels.push(nome);
      dadosGrafico.push(consumoMes);
    });

    const maiorIndice = dadosGrafico.indexOf(Math.max(...dadosGrafico));
    const maiorConsumo = labels[maiorIndice] || "-";

    document.getElementById("resultado").innerHTML = `
      Consumo total: <strong>${totalMes.toFixed(2)} kWh/mês</strong><br>
      Custo estimado: <strong>${custoTotal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}</strong><br>
      Maior consumo: <strong>${maiorConsumo}</strong>
    `;

    atualizarGrafico(labels, dadosGrafico);

    loading.classList.remove("ativo");

  }, 300);
}

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
          "#22c55e",
          "#f97316",
          "#64748b"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
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
  document.querySelectorAll("input").forEach(input => {
    input.removeEventListener("input", calcular);
    input.addEventListener("input", calcular);
  });
}

ativarRecalculoAutomatico();
window.onload = calcular;
let grafico;

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  document.querySelector('table').classList.toggle('dark-theme');
}

function calcular() {
  const potChuveiro = parseFloat(document.getElementById("potChuveiro").value) || 0;
  const potGeladeira = parseFloat(document.getElementById("potGeladeira").value) || 0;
  const potLampada = parseFloat(document.getElementById("potLampada").value) || 0;
  const potLavar = parseFloat(document.getElementById("potLavar").value) || 0;
  const potMicro = parseFloat(document.getElementById("potMicro").value) || 0;
  const potAr = parseFloat(document.getElementById("potAr").value) || 0;

  const hChuveiro = parseFloat(document.getElementById("chuveiro").value) || 0;
  const hGeladeira = parseFloat(document.getElementById("geladeira").value) || 0;
  const hLampada = parseFloat(document.getElementById("lampada").value) || 0;
  const hLavar = parseFloat(document.getElementById("lavar").value) || 0;
  const hMicro = parseFloat(document.getElementById("micro").value) || 0;
  const hAr = parseFloat(document.getElementById("ar").value) || 0;

  const tarifa = parseFloat(document.getElementById("tarifa").value) || 0;

  const aparelhos = [
    { nome: "Chuveiro", pot: potChuveiro, horas: hChuveiro },
    { nome: "Geladeira", pot: potGeladeira, horas: hGeladeira },
    { nome: "Lâmpada", pot: potLampada, horas: hLampada },
    { nome: "Máquina de lavar", pot: potLavar, horas: hLavar },
    { nome: "Micro-ondas", pot: potMicro, horas: hMicro },
    { nome: "Ar-condicionado", pot: potAr, horas: hAr }
  ];

  let totalMes = 0;
  let custoTotal = 0;
  const dadosGrafico = [];

  aparelhos.forEach((a, i) => {
    const consumoDia = (a.pot * a.horas) / 1000;
    const consumoMes = consumoDia * 30;
    const custo = consumoMes * tarifa;

    totalMes += consumoMes;
    custoTotal += custo;
    dadosGrafico.push(consumoMes);

    const ids = ["Chuveiro", "Geladeira", "Lampada", "Lavar", "Micro", "Ar"];

    document.getElementById(`consumo${ids[i]}Dia`).innerText = consumoDia.toFixed(2);
    document.getElementById(`consumo${ids[i]}Mes`).innerText = consumoMes.toFixed(2);
    document.getElementById(`custo${ids[i]}`).innerText = "R$ " + custo.toFixed(2);
  });

  document.getElementById("resultado").innerText =
    `Consumo total: ${totalMes.toFixed(2)} kWh/mês | Custo estimado: R$ ${custoTotal.toFixed(2)}`;

  const ctx = document.getElementById("graficoConsumo").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: aparelhos.map(a => a.nome),
      datasets: [{
        data: dadosGrafico,
        backgroundColor: [
          "#e74c3c",
          "#3498db",
          "#f1c40f",
          "#9b59b6",
          "#1abc9c",
          "#34495e"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Participação no Consumo Mensal (kWh)"
        }
      }
    }
  });
}
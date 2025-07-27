let dadosProcessados = [];

document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const texto = event.target.result;

    // CHAMA A FUNÇÃO AQUI ✅
    preencherNomeArquivoBaseComSegundaLinha(texto);

    processarCSV(texto);
  };
  reader.readAsText(file, 'UTF-8');
});

function processarCSV(texto) {
  const linhas = texto.split('\n').filter(l => l.trim() !== '');
  const cabecalho = linhas[0].split(';').map(h => h.trim().replace(/^'|'$/g, ''));
  const colunaEscolhida = document.getElementById('colunaSelecionada').value;

  const indice = cabecalho.findIndex(c => c.toUpperCase() === colunaEscolhida.toUpperCase());
  if (indice === -1) {
    alert(`Coluna ${colunaEscolhida} não encontrada.`);
    return;
  }

  dadosProcessados = linhas.slice(1).map(linha => {
    const colunas = linha.split(';');
    return colunas[indice]?.replace(/^'|'$/g, '').trim();
  }).filter(Boolean);

  exibirTabela();
}

function exibirTabela() {
  const corpo = document.getElementById('outputBody');
  corpo.innerHTML = '';

  dadosProcessados.forEach(valor => {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = valor;
    tr.appendChild(td);
    corpo.appendChild(tr);
  });
}

async function exportarCSV() {
  const sufixo = document.getElementById('formatoSaida').value;
  const quantidadeArquivos = parseInt(document.getElementById('quantidadeArquivos').value) || 1;
  const nomeArquivoBase = document.getElementById('nomeArquivoBase').value.trim();

  if (quantidadeArquivos < 1) {
    alert('Digite um número válido de arquivos.');
    return;
  }

  if (!nomeArquivoBase) {
    alert('Digite o nome base para o arquivo.');
    return;
  }

  // ✅ Gera um timestamp no padrão brasileiro com data e hora única
  const agora = new Date();
  const timestamp = `${String(agora.getDate()).padStart(2, '0')}-${String(agora.getMonth() + 1).padStart(2, '0')}-${agora.getFullYear()}_${String(agora.getHours()).padStart(2, '0')}-${String(agora.getMinutes()).padStart(2, '0')}-${String(agora.getSeconds()).padStart(2, '0')}`;

  const zip = new JSZip();
  const totalRegistros = dadosProcessados.length;
  const tamanhoPorArquivo = Math.ceil(totalRegistros / quantidadeArquivos);

  for (let i = 0; i < quantidadeArquivos; i++) {
    const inicio = i * tamanhoPorArquivo;
    const fim = inicio + tamanhoPorArquivo;
    const parte = dadosProcessados.slice(inicio, fim).map(v => v + sufixo).join('\n');

    // ✅ Nome do arquivo individual com nome base + timestamp + parte
    zip.file(`${nomeArquivoBase}_${timestamp}_parte${i + 1}.csv`, parte);
  }

  // ✅ Nome do arquivo ZIP também com timestamp único
  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${nomeArquivoBase}_csv_${timestamp}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function preencherNomeArquivoBaseComSegundaLinha(textoCSV) {
  const linhas = textoCSV.split('\n').filter(l => l.trim() !== '');
  if (linhas.length < 2) return;

  const segundaLinha = linhas[1].trim();
  const primeiraColuna = segundaLinha.split(/[;,]/)[0]?.replace(/["']/g, '').trim();

  console.log("Valor detectado para nome do arquivo:", primeiraColuna);

  if (primeiraColuna) {
    document.getElementById('nomeArquivoBase').value = primeiraColuna;
  }
}






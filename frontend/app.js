// =====================================================
// Veterion - app.js - lógica de TODAS as telas (fetch + DOM)
// Cada página tem <body data-pagina="..."> e só roda o trecho dela.
// =====================================================
const API = 'http://localhost:3000/api';
const pagina = document.body.dataset.pagina;

// ---------- Utilitários ----------
const $ = (id) => document.getElementById(id);

function esc(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function formatarData(iso) {
  return iso ? new Date(iso + 'T00:00').toLocaleDateString('pt-BR') : '-';
}

function classeStatus(status) {
  if (status === 'Concluído') return 'status-concluido';
  if (status === 'Cancelado') return 'status-cancelado';
  return 'status-agendado';
}

async function api(caminho, opcoes = {}) {
  const resp = await fetch(API + caminho, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  });
  const dados = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(dados.erro || 'Erro na requisição');
  return dados;
}

function mostrarErro(idElemento, mensagem) {
  const el = $(idElemento);
  el.textContent = mensagem;
  el.hidden = !mensagem;
}

// ---------- Sessão (localStorage) ----------
const usuarioNome = localStorage.getItem('usuarioNome');
if (pagina !== 'login' && !usuarioNome) {
  window.location.href = 'index.html';
}

if ($('nomeUsuario')) $('nomeUsuario').textContent = '👤 ' + usuarioNome;
if ($('boasVindas')) $('boasVindas').textContent = usuarioNome;
if ($('btnSair')) {
  $('btnSair').addEventListener('click', () => {
    localStorage.removeItem('usuarioNome');
    window.location.href = 'index.html';
  });
}

// =====================================================
// LOGIN
// =====================================================
if (pagina === 'login') {
  if (localStorage.getItem('usuarioNome')) window.location.href = 'dashboard.html';

  $('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const usuario = await api('/login', {
        method: 'POST',
        body: JSON.stringify({ login: $('login').value, senha: $('senha').value }),
      });
      localStorage.setItem('usuarioNome', usuario.nome);
      window.location.href = 'dashboard.html';
    } catch (erro) {
      mostrarErro('msgErro', erro.message);
    }
  });
}

// =====================================================
// DASHBOARD (resumo numérico - novidade do Veterion)
// =====================================================
if (pagina === 'dashboard') {
  api('/dashboard/resumo').then((r) => {
    $('resumoTutores').textContent = r.totalTutores;
    $('resumoPets').textContent = r.totalPets;
    $('resumoHoje').textContent = r.agendamentosHoje;
    $('resumoAbertos').textContent = r.agendamentosAbertos;
  }).catch(() => {});
}

// =====================================================
// TUTORES (busca + cadastro + edição + exclusão)
// =====================================================
if (pagina === 'tutores') {
  let tutores = [];

  async function carregarTutores(busca = '') {
    tutores = await api('/tutores?busca=' + encodeURIComponent(busca));
    $('tabelaTutores').innerHTML = tutores.length
      ? tutores.map((t) => `
          <tr>
            <td>${esc(t.nome)}</td>
            <td>🔒 protegido</td>
            <td>${esc(t.telefone)}</td>
            <td>${esc(t.email)}</td>
            <td class="acoes">
              <button onclick="editarTutor(${t.id})">Editar</button>
              <button class="perigo" onclick="excluirTutor(${t.id})">Excluir</button>
            </td>
          </tr>`).join('')
      : '<tr><td colspan="5">Nenhum tutor encontrado.</td></tr>';
  }

  $('formBusca').addEventListener('submit', (e) => {
    e.preventDefault();
    carregarTutores($('busca').value);
  });
  $('btnLimparBusca').addEventListener('click', () => {
    $('busca').value = '';
    carregarTutores();
  });

  window.editarTutor = (id) => {
    const t = tutores.find((x) => x.id === id);
    $('tutorId').value = t.id;
    $('tutorNome').value = t.nome;
    $('tutorCpf').value = '';
    $('tutorCpf').placeholder = 'Deixe em branco para manter o atual';
    $('tutorTelefone').value = t.telefone || '';
    $('tutorEmail').value = t.email || '';
    $('tituloFormTutor').textContent = 'Editar tutor';
    $('formTutor').scrollIntoView({ behavior: 'smooth' });
  };

  // NOVO em relação ao sistema original: exclusão de tutor.
  window.excluirTutor = async (id) => {
    if (!confirm('Excluir este tutor? Os pets e agendamentos relacionados também serão removidos.')) return;
    try {
      await api('/tutores/' + id, { method: 'DELETE' });
      carregarTutores($('busca').value);
    } catch (erro) {
      alert(erro.message);
    }
  };

  function limparFormTutor() {
    $('formTutor').reset();
    $('tutorId').value = '';
    $('tutorCpf').placeholder = '000.000.000-00';
    $('tituloFormTutor').textContent = 'Novo tutor';
    mostrarErro('msgTutor', '');
  }
  $('btnCancelarTutor').addEventListener('click', limparFormTutor);

  $('formTutor').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('tutorId').value;
    const corpo = {
      nome: $('tutorNome').value,
      cpf: $('tutorCpf').value,
      telefone: $('tutorTelefone').value,
      email: $('tutorEmail').value,
    };
    try {
      await api(id ? '/tutores/' + id : '/tutores', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(corpo),
      });
      limparFormTutor();
      carregarTutores($('busca').value);
    } catch (erro) {
      mostrarErro('msgTutor', erro.message);
    }
  });

  carregarTutores();
}

// =====================================================
// PETS (listagem com filtro + cadastro + edição + exclusão)
// =====================================================
if (pagina === 'pets') {
  let pets = [];
  let tutoresCache = [];

  async function carregarPets() {
    const especie = $('filtroEspecie').value;
    pets = await api('/pets' + (especie ? '?especie=' + encodeURIComponent(especie) : ''));
    $('tabelaPets').innerHTML = pets.length
      ? pets.map((p) => `
        <tr>
          <td>${esc(p.nome)}</td>
          <td>${esc(p.especie)}</td>
          <td>${esc(p.raca)}</td>
          <td>${formatarData(p.data_nascimento)}</td>
          <td>${esc(p.tutor)}</td>
          <td class="acoes">
            <button onclick="editarPet(${p.id})">Editar</button>
            <button class="perigo" onclick="excluirPet(${p.id})">Excluir</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="6">Nenhum pet encontrado.</td></tr>';
  }

  function atualizarFiltroEspecies() {
    const especies = [...new Set(pets.map((p) => p.especie))].sort();
    const atual = $('filtroEspecie').value;
    $('filtroEspecie').innerHTML = '<option value="">Todas as espécies</option>' +
      especies.map((e) => `<option value="${esc(e)}">${esc(e)}</option>`).join('');
    $('filtroEspecie').value = atual;
  }

  async function carregarSelectTutores() {
    tutoresCache = await api('/tutores');
    $('petTutor').innerHTML = '<option value="">Selecione o tutor...</option>' +
      tutoresCache.map((t) => `<option value="${t.id}">${esc(t.nome)}</option>`).join('');
  }

  $('filtroEspecie').addEventListener('change', carregarPets);
  $('btnLimparFiltro').addEventListener('click', () => {
    $('filtroEspecie').value = '';
    carregarPets();
  });

  // NOVO em relação ao sistema original: editar um pet já cadastrado.
  window.editarPet = (id) => {
    const p = pets.find((x) => x.id === id);
    $('petId').value = p.id;
    $('petNome').value = p.nome;
    $('petEspecie').value = p.especie;
    $('petRaca').value = p.raca || '';
    $('petNascimento').value = p.data_nascimento || '';
    $('petTutor').value = p.tutor_id;
    $('tituloFormPet').textContent = 'Editar pet';
    $('formPet').scrollIntoView({ behavior: 'smooth' });
  };

  // NOVO em relação ao sistema original: exclusão de pet.
  window.excluirPet = async (id) => {
    if (!confirm('Excluir este pet? Os agendamentos relacionados também serão removidos.')) return;
    try {
      await api('/pets/' + id, { method: 'DELETE' });
      await carregarPets();
      atualizarFiltroEspecies();
    } catch (erro) {
      alert(erro.message);
    }
  };

  function limparFormPet() {
    $('formPet').reset();
    $('petId').value = '';
    $('tituloFormPet').textContent = 'Novo pet';
    mostrarErro('msgPet', '');
  }
  $('btnCancelarPet').addEventListener('click', limparFormPet);

  $('formPet').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = $('petId').value;
    const corpo = {
      nome: $('petNome').value,
      especie: $('petEspecie').value,
      raca: $('petRaca').value,
      data_nascimento: $('petNascimento').value,
      tutor_id: $('petTutor').value,
    };
    try {
      await api(id ? '/pets/' + id : '/pets', {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(corpo),
      });
      limparFormPet();
      await carregarPets();
      atualizarFiltroEspecies();
    } catch (erro) {
      mostrarErro('msgPet', erro.message);
    }
  });

  (async () => {
    await carregarPets();
    atualizarFiltroEspecies();
    await carregarSelectTutores();
  })();
}

// =====================================================
// AGENDAMENTOS (listagem + filtro por status + remarcar + concluir/cancelar + excluir)
// =====================================================
if (pagina === 'agendamentos') {
  let agendamentos = [];

  async function carregarAgendamentos() {
    const status = $('filtroStatus').value;
    agendamentos = await api('/agendamentos' + (status ? '?status=' + encodeURIComponent(status) : ''));
    $('tabelaAgendamentos').innerHTML = agendamentos.length
      ? agendamentos.map((a) => `
        <tr>
          <td>${formatarDataHora(a.data_agendamento)}</td>
          <td>${esc(a.servico)}</td>
          <td><span class="status-pill ${classeStatus(a.status)}">${esc(a.status)}</span></td>
          <td>${esc(a.pet)}</td>
          <td>${esc(a.especie)}</td>
          <td>${esc(a.tutor)}</td>
          <td>${esc(a.telefone)}</td>
          <td class="acoes">
            <button onclick="editarAgendamento(${a.id})">Remarcar</button>
            ${a.status === 'Agendado' ? `
              <button class="sucesso" onclick="mudarStatus(${a.id}, 'Concluído')">Concluir</button>
              <button class="perigo" onclick="mudarStatus(${a.id}, 'Cancelado')">Cancelar</button>
            ` : ''}
            <button class="perigo" onclick="excluirAgendamento(${a.id})">Excluir</button>
          </td>
        </tr>`).join('')
      : '<tr><td colspan="8">Nenhum agendamento encontrado.</td></tr>';
  }

  $('filtroStatus').addEventListener('change', carregarAgendamentos);
  $('btnLimparFiltroStatus').addEventListener('click', () => {
    $('filtroStatus').value = '';
    carregarAgendamentos();
  });

  window.editarAgendamento = (id) => {
    const a = agendamentos.find((x) => x.id === id);
    $('agendamentoId').value = a.id;
    $('novaData').value = a.data_agendamento;
    $('infoEditar').textContent = `${a.pet} (${a.tutor}) - ${a.servico}`;
    $('secaoEditar').hidden = false;
    $('secaoEditar').scrollIntoView({ behavior: 'smooth' });
  };

  // NOVO em relação ao sistema original: concluir/cancelar um agendamento.
  window.mudarStatus = async (id, status) => {
    try {
      await api(`/agendamentos/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      carregarAgendamentos();
    } catch (erro) {
      alert(erro.message);
    }
  };

  // NOVO em relação ao sistema original: excluir um agendamento.
  window.excluirAgendamento = async (id) => {
    if (!confirm('Excluir este agendamento?')) return;
    try {
      await api('/agendamentos/' + id, { method: 'DELETE' });
      carregarAgendamentos();
    } catch (erro) {
      alert(erro.message);
    }
  };

  $('btnCancelarEditar').addEventListener('click', () => {
    $('secaoEditar').hidden = true;
    mostrarErro('msgEditar', '');
  });

  $('formEditarData').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/agendamentos/' + $('agendamentoId').value, {
        method: 'PUT',
        body: JSON.stringify({ data_agendamento: $('novaData').value }),
      });
      $('secaoEditar').hidden = true;
      carregarAgendamentos();
    } catch (erro) {
      mostrarErro('msgEditar', erro.message);
    }
  });

  async function carregarSelectPets() {
    const pets = await api('/pets');
    $('agPet').innerHTML = '<option value="">Selecione o pet...</option>' +
      pets.map((p) => `<option value="${p.id}">${esc(p.nome)} (${esc(p.tutor)})</option>`).join('');
  }

  $('formAgendamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          pet_id: $('agPet').value,
          data_agendamento: $('agData').value,
          servico: $('agServico').value,
        }),
      });
      $('formAgendamento').reset();
      mostrarErro('msgAgendamento', '');
      carregarAgendamentos();
    } catch (erro) {
      mostrarErro('msgAgendamento', erro.message);
    }
  });

  carregarAgendamentos();
  carregarSelectPets();
}

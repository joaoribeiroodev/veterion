# Relatório de Requisitos Funcionais — Veterion

Requisitos funcionais descrevem **o que o sistema deve fazer**: as
funcionalidades disponíveis para os usuários.

| ID    | Requisito                                                                 | Prioridade |
|-------|----------------------------------------------------------------------------|------------|
| RF01  | O sistema deve permitir que o usuário faça login com usuário e senha.      | Alta       |
| RF02  | O sistema deve rejeitar login com credenciais inválidas, exibindo mensagem de erro. | Alta |
| RF03  | O sistema deve manter a sessão do usuário logado até que ele clique em "Sair". | Média |
| RF04  | O sistema deve exibir, na tela inicial, um resumo com total de tutores, total de pets, agendamentos do dia e agendamentos em aberto. | Média |
| RF05  | O sistema deve permitir cadastrar um tutor com nome, CPF, telefone e e-mail. | Alta |
| RF06  | O sistema deve validar o CPF informado (11 dígitos e dígitos verificadores corretos) antes de cadastrar ou editar um tutor. | Alta |
| RF07  | O sistema não deve permitir cadastrar dois tutores com o mesmo CPF.         | Alta       |
| RF08  | O sistema deve permitir buscar tutores por nome, e-mail ou telefone.        | Média      |
| RF09  | O sistema deve permitir editar os dados de um tutor já cadastrado, mantendo o CPF atual caso o campo seja deixado em branco. | Alta |
| RF10  | O sistema deve permitir excluir um tutor; seus pets e os agendamentos desses pets também devem ser removidos. | Média |
| RF11  | O sistema deve exibir o CPF do tutor sempre protegido (nunca em texto puro) nas telas e respostas da API. | Alta |
| RF12  | O sistema deve permitir cadastrar um pet vinculado a um tutor existente, com nome, espécie, raça e data de nascimento. | Alta |
| RF13  | O sistema não deve permitir cadastrar um pet sem um tutor válido selecionado. | Alta |
| RF14  | O sistema deve permitir editar os dados de um pet já cadastrado, incluindo a troca de tutor. | Alta |
| RF15  | O sistema deve permitir excluir um pet; os agendamentos desse pet também devem ser removidos. | Média |
| RF16  | O sistema deve permitir filtrar a listagem de pets por espécie.            | Baixa      |
| RF17  | O sistema deve permitir criar um agendamento para um pet, informando data/hora e serviço. | Alta |
| RF18  | O sistema não deve permitir dois agendamentos ativos no mesmo pet e horário. | Média |
| RF19  | O sistema deve listar os agendamentos ordenados pela data/hora.            | Alta       |
| RF20  | O sistema deve permitir filtrar agendamentos por status.                   | Baixa      |
| RF21  | O sistema deve permitir remarcar a data/hora de um agendamento existente.  | Alta       |
| RF22  | O sistema deve permitir marcar um agendamento como "Concluído" ou "Cancelado". | Alta    |
| RF23  | O sistema deve permitir excluir um agendamento.                            | Média      |
| RF24  | O sistema deve exibir mensagens de erro claras ao usuário quando uma operação falhar (campo obrigatório, CPF inválido, conflito de horário, etc.). | Alta |

## Fora de escopo (nesta versão)

- Cadastro/edição de usuários pela interface (os usuários de teste são
  inseridos via seed do banco).
- Controle de permissões por papel (`admin`, `veterinario`, `recepcao`) — o
  campo existe no modelo de dados, mas ainda não restringe ações na API.
- Histórico/prontuário clínico do pet (exames, prescrições, etc.).
- Notificações (e-mail/SMS) de lembrete de agendamento.

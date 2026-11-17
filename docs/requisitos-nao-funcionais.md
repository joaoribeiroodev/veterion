# Relatório de Requisitos Não Funcionais — Veterion

Requisitos não funcionais descrevem **como o sistema deve se comportar**:
qualidades, restrições técnicas e atributos de qualidade, em vez de
funcionalidades específicas.

| ID     | Categoria        | Requisito                                                                 |
|--------|------------------|------------------------------------------------------------------------------|
| RNF01  | Segurança        | Senhas de usuário devem ser armazenadas apenas como hash com salt aleatório (scrypt), nunca em texto puro. |
| RNF02  | Segurança        | O CPF do tutor deve ser armazenado de forma protegida (hash com salt) e nunca retornado em texto puro pela API. |
| RNF03  | Segurança        | A checagem de CPF duplicado deve ser feita sem reverter ou expor o CPF original, usando um hash determinístico dedicado apenas para essa finalidade. |
| RNF04  | Segurança        | Mensagens de erro retornadas ao cliente não devem expor detalhes internos (stack trace, mensagens cruas do driver do banco de dados). |
| RNF05  | Usabilidade      | O sistema deve exibir mensagens de validação em português, próximas ao campo/ação que originou o erro. |
| RNF06  | Usabilidade      | Ações destrutivas (excluir tutor, pet ou agendamento) devem pedir confirmação do usuário antes de serem executadas. |
| RNF07  | Compatibilidade  | O frontend deve funcionar nos navegadores modernos mais usados (Chrome, Edge, Firefox) sem necessidade de frameworks adicionais. |
| RNF08  | Desempenho       | Listagens (tutores, pets, agendamentos) devem responder em menos de 1 segundo em bases de dados de porte pequeno/médio (até alguns milhares de registros), com uso de índices nas chaves estrangeiras e na data do agendamento. |
| RNF09  | Manutenibilidade | O backend deve ser organizado em módulos por domínio (rotas, acesso a dados, criptografia, validação), evitando um único arquivo monolítico. |
| RNF10  | Confiabilidade   | Integridade referencial deve ser garantida pelo banco de dados (chaves estrangeiras com `ON DELETE CASCADE`), evitando pets ou agendamentos órfãos. |
| RNF11  | Portabilidade    | O backend deve rodar em qualquer sistema operacional com Node.js 18+ instalado, sem dependências de serviços externos (usa SQLite em arquivo local). |
| RNF12  | Configurabilidade| A porta da API e o "pepper" usado no hash de busca do CPF devem ser configuráveis por variável de ambiente, com valores padrão seguros para desenvolvimento. |
| RNF13  | Versionamento    | Arquivos gerados (banco de dados `.db`, `node_modules`) não devem ser versionados no controle de versão (Git). |
| RNF14  | Auditabilidade   | Todo registro criado (usuário, tutor, pet, agendamento) deve guardar a data de criação (`criado_em`). |

## Observações

- O projeto não implementa, nesta versão, requisitos de alta disponibilidade,
  balanceamento de carga ou múltiplos ambientes (homologação/produção
  separados), por se tratar de um sistema de porte pequeno voltado a uma
  única clínica.
- Testes automatizados (unitários/integração) não fazem parte do escopo atual
  e ficam como evolução futura recomendada.

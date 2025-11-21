# Guardian Suite

O **Guardian Suite** é uma ferramenta avançada de segurança para servidores Linux, concebida para identificar vulnerabilidades, monitorizar em tempo real o desempenho dos recursos do sistema (CPU, memória, disco) e gerar relatórios detalhados que ajudam os administradores a manterem ambientes seguros e otimizados.]  

## 🚀 Funcionalidades

- **Scan de Vulnerabilidades:** Detecção proativa de falhas de segurança críticas no sistema.  
- **Monitorização em Tempo Real:** Acompanhamento do uso de CPU, RAM e armazenamento com dados ao vivo.  
- **Relatórios e Logs:** Histórico detalhado dos scans e métricas de desempenho para auditoria e análises.  
- **Dashboard Responsivo:** Interface moderna e intuitiva para visualização e gestão centralizada.  
- **Automação e Escalabilidade:** Facilita a integração em ambientes de produção com deploy rápido.

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e de alta performance:

- **Runtime:** [Bun](https://bun.sh/) – runtime JavaScript ultra-rápido.  
- **Frontend:** [React](https://react.dev/) com [Vite](https://vitejs.dev/) para uma experiência de desenvolvimento ágil.  
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) para robustez e escalabilidade.  
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) para estilos eficientes e responsivos.  
- **Base de Dados:** PostgreSQL para armazenamento confiável e escalável.

## ⚙️ Pré-requisitos

Certifica-te de que tens o seguinte instalado no teu ambiente antes de começares:

- [Bun](https://bun.sh/) (versão 1.0 ou superior)  
- [PostgreSQL](https://www.postgresql.org/)

## 📦 Instalação e Configuração

1. **Clona o repositório:**  
git clone https://github.com/TiagoCCRaposo/guardian-suite.git
cd guardian-suite



2. **Instala as dependências:**  
bun install



3. **Configura as variáveis de ambiente:**  
cp .env.example .env


Abre o ficheiro `.env` e preenche com detalhes da tua base de dados e outras chaves necessárias.

4. **Executa migrações (se utilizares ORM):**  
bun run db:push



## ▶️ Como Executar

- **Modo Desenvolvimento:**  
Inicia frontend e backend em modo desenvolvimento:  
bun run dev


A aplicação estará disponível em `http://localhost:5173`.

- **Build para Produção:**  
Cria uma versão otimizada para produção:  
bun run build



## 🤝 Como Contribuir

Contribuições são bem-vindas! Segue os passos:

1. Faz um **fork** do projeto.  
2. Cria uma branch para a tua funcionalidade:  
git checkout -b feature/nome-da-funcionalidade


3. Faz commit das tuas alterações:  
git commit -m "Adiciona nova funcionalidade"


4. Faz push para a branch:  
git push origin feature/nome-da-funcionalidade


5. Abre um **Pull Request** no repositório principal.

## 📄 Licença

Este projeto está licenciado sob a licença MIT. Consulta o ficheiro [LICENSE](LICENSE) para mais detalhes.
   

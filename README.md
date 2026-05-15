# 📚 Books Library

Aplicação web para gerenciamento de biblioteca pessoal.

## 🚀 Como executar o projeto

### Pré-requisitos

- Docker Desktop (20.10+)

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/flaviocarvlh1/books-library.git
cd books-library

# 2. Inicie os containers
docker compose up -d

# 3. Aguarde docker terminar e acesse
# Frontend: http://localhost:3000
# Backend API: http://localhost:3333

Para parar a aplicação:

bash
docker compose down       # mantém os dados
docker compose down -v    # remove tudo (incluindo banco)

Verificando se está funcionando
bash
docker compose ps
# Você deve ver os 3 containers com status "Up" ou "Running"




## 🧠 Decisões de desenvolvimento

Interface do usuário
A escolha do frontend foi baseada em uma interface que remetesse a uma biblioteca visual e organizada, conforme referência da imagem enviada. Optou-se por:

Barra de pesquisa + filtro + botão de adicionar livro → usabilidade direta e intuitiva.

Cards de livros exibindo: capa, título, gênero, autor e ano → facilita a identificação rápida.

Fallback visual para livros sem capa: um banner com os dados do livro no lugar da imagem → evita espaços vazios e mantém a consistência da interface.

Optei pelo Docker pra garantir que o projeto rode de forma padronizada em qualquer ambiente, sem surpresas.

```

<img width="1280" height="699" alt="interface" src="https://github.com/user-attachments/assets/29ec2e7f-059e-4ef1-91ff-0b04928f05f1" />

<img width="1280" height="698" alt="interface2" src="https://github.com/user-attachments/assets/7cbc5663-b13e-45ea-ab7e-c1919724049a" />



import "./style.css";
import { get, post, del } from "./http";

function $(selector) {
  return document.querySelector(selector);
}

const url = "http://localhost:3333/cars";
const table = $('[data-js="table"]');
const form = $('[data-js="cars-form"]');

const getFormElement = (event) => (elementName) =>
  event.target.elements[elementName];

const elementTypes = {
  image: createImage,
  text: createText,
  color: createColor,
};

function createImage(value) {
  const td = document.createElement("td");
  const img = document.createElement("img");
  img.src = value;
  img.width = 100;
  td.appendChild(img);
  return td;
}

function createText(value) {
  const td = document.createElement("td");
  td.textContent = value;
  return td;
}

function createColor(value) {
  const td = document.createElement("td");
  const div = document.createElement("div");
  div.style.width = "100px";
  div.style.height = "100px";
  div.style.backgroundColor = value;
  td.appendChild(div);
  return td;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const getElement = getFormElement(e);

  const data = {
    image: getElement("image").value,
    brandModel: getElement("brand-model").value,
    year: getElement("year").value,
    plate: getElement("plate").value,
    color: getElement("color").value,
  };

  // Fazer a chamada post para cadastrar o carro na API
  // caso dê erro, avisar o erro e caso dê sucesso
  // remover o aviso que não há dados na tabela e criar visualmente
  // a tabela com os dados do carro cadastrado
  const result = await post(url, data);

  if (result.error) {
    setError(result.message);
    return;
  }

  const noContent = $('[data-js="no-content"]');
  table.removeChild(noContent);
  createTableRow(data);

  e.target.reset();
  image.focus();
});

// Função para criação de linha com os dados inseridos
// no formulário ou que já estão na API
function createTableRow(data) {
  const tr = document.createElement("tr");

  const elements = [
    { type: "image", value: data.image },
    { type: "text", value: data.brandModel },
    { type: "text", value: data.year },
    { type: "text", value: data.plate },
    { type: "color", value: data.color },
  ];

  tr.dataset.plate = data.plate;

  elements.forEach((element) => {
    const td = elementTypes[element.type](element.value);
    tr.appendChild(td);
  });

  const button = document.createElement("button");
  button.textContent = "Excluir";
  button.dataset.plate = data.plate;
  button.addEventListener("click", handleDelete);

  tr.appendChild(button);

  table.appendChild(tr);
}

// Função para a deleção de um dado específico da
// tabela e remoção do botão de deletar
async function handleDelete(e) {
  const button = e.target;
  const plate = button.dataset.plate;

  const result = await del(url, { plate });

  if (result.error) {
    setError(result.message);
    return;
  }

  const tr = $(`tr[data-plate="${plate}"]`);
  table.removeChild(tr);
  button.removeEventListener("click", handleDelete);

  const allTrs = table.querySelector("tr");
  if (!allTrs) {
    createNoCarRow();
  }
}

// Função de criação de linha com erro para ser exibida na tabela
function createNoCarRow() {
  const tr = document.createElement("tr");
  const td = document.createElement("td");
  const ths = document.querySelectorAll("table th");
  td.setAttribute("colspan", ths.length);
  td.textContent = "Nenhum carro encontrado!";

  tr.dataset.js = "no-content";
  tr.appendChild(td);
  table.appendChild(tr);
}

function setError(message) {
  const error = $('[data-js="error"]');
  error.classList.toggle("hide");
  error.textContent = message;
}

async function main() {
  const result = await get(url);

  if (result.error) {
    setError(result.message);
    return;
  }

  // Executar função para exibir mensagem avisando que não
  // há nenhum carro cadastrado.
  if (result.length === 0) {
    createNoCarRow();
  }

  // Quando resultado for obtido com sucesso, executar a função
  // de criação de linha da tabela para cada resultado obtido.
  result.forEach(createTableRow);
}

main();

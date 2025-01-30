document.getElementById("uploadForm").addEventListener("submit", async function(event) {
  event.preventDefault();

  const formData = new FormData();
  const imageFiles = document.getElementById("image").files;
  const metadata = document.getElementById("metadata").value;
  const collectionId = document.getElementById("collectionSelect").value;

  for (const imageFile of imageFiles) {
    formData.append("images", imageFile);
  }
  if (metadata) {
    formData.append("metadata", metadata);
  }
  if (collectionId) {
    formData.append("collectionId", collectionId);
  }

  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert("Imagens carregadas com sucesso!");
      fetchImages(); // Atualiza a lista de imagens
    } else {
      alert("Erro ao fazer upload.");
      console.error(data);
    }
  } catch (error) {
    console.error("Erro ao enviar arquivo", error);
    alert("Erro ao fazer upload.");
  }
});

// Função para exibir as imagens carregadas
async function fetchImages(collectionId = null) {
  const url = collectionId ? `/collections/${collectionId}` : "/images";
  const response = await fetch(url);
  const data = await response.json();
  const images = collectionId ? data.images : data;

  const imageList = document.getElementById("imageList");
  imageList.innerHTML = ""; // Limpa a lista antes de adicionar novas imagens

  images.forEach((image) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <input type="checkbox" class="select-image" data-id="${image.id}">
      <img src="${image.url}" onerror="this.onerror=null; this.src='fallback-image.jpg';" alt="${image.filename}">
      <a href="${image.url}" target="_blank">${image.filename}</a>
      <button class="show-metadata-btn" onclick="toggleMetadata(${image.id})">Mostrar Metadados</button>
      <div id="metadata-${image.id}" class="metadata" style="display: none; font-size: 12px; margin-top: 5px;">${formatMetadata(image.metadata)}</div>
      <div class="action-buttons">
        <button class="edit-btn" onclick="editMetadata(${image.id}, '${encodeURIComponent(JSON.stringify(image.metadata))}', ${image.collectionId})">Editar</button>
        <button class="delete-btn" onclick="deleteImage(${image.id})">Excluir</button>
        <button class="download-btn" onclick="downloadImage(${image.id})">Baixar</button>
      </div>
      <div id="edit-form-${image.id}" class="edit-form">
        ${generateMetadataForm(image.metadata, image.id)}
        <button class="add-property-btn" onclick="addMetadataProperty(${image.id})">Adicionar Propriedade</button>
        <label for="collection-${image.id}">Coleção:</label>
        <select id="collection-${image.id}" name="collection">
          <option value="">Nenhuma</option>
          ${generateCollectionOptions(image.collectionId)}
        </select>
        <button class="save-btn" onclick="saveMetadata(${image.id})">Salvar</button>
        <button class="cancel-btn" onclick="cancelEdit(${image.id})">Cancelar</button>
      </div>
    `;
    imageList.appendChild(listItem);
  });
}

// Função para exibir as coleções carregadas
async function fetchCollections() {
  const response = await fetch("/collections");
  const collections = await response.json();

  const collectionSelect = document.getElementById("collectionSelect");
  const collectionList = document.getElementById("collectionList");
  collectionSelect.innerHTML = '<option value="">Selecione uma coleção (opcional)</option>'; // Limpa o dropdown antes de adicionar novas coleções
  collectionList.innerHTML = ""; // Limpa a lista antes de adicionar novas coleções

  collections.forEach((collection) => {
    const option = document.createElement("option");
    option.value = collection.id;
    option.textContent = collection.name;
    collectionSelect.appendChild(option);

    const listItem = document.createElement("li");
    listItem.textContent = collection.name;
    listItem.onclick = () => {
      fetchImages(collection.id);
      highlightSelectedCollection(listItem);
    }; // Filtra as imagens ao clicar na coleção
    collectionList.appendChild(listItem);
  });

  // Adiciona botão para ver todas as imagens
  const viewAllButton = document.createElement("button");
  viewAllButton.textContent = "Ver Todas as Imagens";
  viewAllButton.onclick = () => {
    fetchImages();
    highlightSelectedCollection(null);
  };
  collectionList.appendChild(viewAllButton);
}

// Função para destacar a coleção selecionada
function highlightSelectedCollection(selectedItem) {
  const collectionItems = document.querySelectorAll("#collectionList li");
  collectionItems.forEach(item => {
    item.classList.remove("selected-collection");
  });
  if (selectedItem) {
    selectedItem.classList.add("selected-collection");
  }
}

// Função para criar uma nova coleção
document.getElementById("newCollectionBtn").addEventListener("click", async function() {
  const collectionName = prompt("Digite o nome da nova coleção:");
  if (collectionName) {
    try {
      const response = await fetch("/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: collectionName })
      });

      if (response.ok) {
        alert("Coleção criada com sucesso!");
        fetchCollections(); // Atualiza a lista de coleções
      } else {
        alert("Erro ao criar coleção.");
      }
    } catch (error) {
      console.error("Erro ao criar coleção", error);
    }
  }
});

// Função para formatar os metadados para exibição
function formatMetadata(metadata) {
  return Object.entries(metadata).map(([key, value]) => `<strong>${key}:</strong> ${value}`).join('<br>');
}

// Função para gerar o formulário de edição de metadados
function generateMetadataForm(metadata, imageId) {
  return Object.entries(metadata).map(([key, value]) => `
    <label for="metadata-${imageId}-${key}">${key}:</label>
    <input type="text" id="metadata-${imageId}-${key}" name="${key}" value="${value}">
  `).join('<br>');
}

// Função para gerar as opções de coleção
function generateCollectionOptions(selectedCollectionId) {
  const collections = document.querySelectorAll("#collectionSelect option");
  return Array.from(collections).map(option => `
    <option value="${option.value}" ${option.value === selectedCollectionId ? "selected" : ""}>${option.textContent}</option>
  `).join('');
}

// Função para exibir o formulário de edição de metadados
function editMetadata(imageId, metadata, collectionId) {
  const decodedMetadata = decodeURIComponent(metadata);
  document.getElementById(`edit-form-${imageId}`).style.display = "block";
  document.getElementById(`collection-${imageId}`).value = collectionId;
}

// Função para cancelar a edição de metadados
function cancelEdit(imageId) {
  document.getElementById(`edit-form-${imageId}`).style.display = "none";
}

// Função para adicionar uma nova propriedade de metadados
function addMetadataProperty(imageId) {
  const newPropertyKey = prompt("Digite o nome da nova propriedade:");
  if (newPropertyKey) {
    const newPropertyValue = prompt("Digite o valor da nova propriedade:");
    if (newPropertyValue) {
      const newPropertyElement = document.createElement("div");
      newPropertyElement.innerHTML = `
        <label for="metadata-${imageId}-${newPropertyKey}">${newPropertyKey}:</label>
        <input type="text" id="metadata-${imageId}-${newPropertyKey}" name="${newPropertyKey}" value="${newPropertyValue}">
      `;
      document.getElementById(`edit-form-${imageId}`).insertBefore(newPropertyElement, document.querySelector(`#edit-form-${imageId} .add-property-btn`));
    }
  }
}

// Função para salvar os novos metadados
async function saveMetadata(imageId) {
  const formElements = document.querySelectorAll(`#edit-form-${imageId} input`);
  const newMetadata = {};

  formElements.forEach(element => {
    newMetadata[element.name] = element.value;
  });

  const collectionId = document.getElementById(`collection-${imageId}`).value;

  try {
    const response = await fetch(`/image/${imageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ metadata: newMetadata, collectionId })
    });

    if (response.ok) {
      alert("Metadados atualizados!");
      fetchImages(); // Atualiza a lista de imagens
    } else {
      alert("Erro ao atualizar metadados.");
    }
  } catch (error) {
    console.error("Erro ao atualizar metadados", error);
  }
}

// Função para excluir uma imagem
async function deleteImage(imageId) {
  if (!confirm("Tem certeza de que deseja excluir esta imagem?")) {
    return;
  }

  try {
    const response = await fetch(`/image/${imageId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Imagem excluída com sucesso!");
      fetchImages(); // Atualiza a lista de imagens
    } else {
      alert("Erro ao excluir imagem.");
    }
  } catch (error) {
    console.error("Erro ao excluir imagem", error);
  }
}

// Função para excluir imagens selecionadas
async function deleteSelectedImages() {
  const selectedImages = document.querySelectorAll(".select-image:checked");
  const imageIds = Array.from(selectedImages).map(input => input.dataset.id);

  if (imageIds.length === 0) {
    alert("Nenhuma imagem selecionada.");
    return;
  }

  if (!confirm("Tem certeza de que deseja excluir as imagens selecionadas?")) {
    return;
  }

  try {
    for (const imageId of imageIds) {
      const response = await fetch(`/image/${imageId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        alert(`Erro ao excluir imagem com ID ${imageId}.`);
      }
    }

    alert("Imagens excluídas com sucesso!");
    fetchImages(); // Atualiza a lista de imagens
  } catch (error) {
    console.error("Erro ao excluir imagens", error);
  }
}

// Função para baixar uma imagem com metadados criptografados
async function downloadImage(imageId) {
  try {
    const response = await fetch(`/download/${imageId}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `image-${imageId}.${blob.type.split('/')[1]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("Erro ao baixar imagem.");
    }
  } catch (error) {
    console.error("Erro ao baixar imagem", error);
  }
}

// Função para baixar imagens selecionadas
async function downloadSelectedImages() {
  const selectedImages = document.querySelectorAll(".select-image:checked");
  const imageIds = Array.from(selectedImages).map(input => input.dataset.id);

  if (imageIds.length === 0) {
    alert("Nenhuma imagem selecionada.");
    return;
  }

  try {
    for (const imageId of imageIds) {
      await downloadImage(imageId);
    }
  } catch (error) {
    console.error("Erro ao baixar imagens", error);
  }
}

// Função para alternar a exibição dos metadados
function toggleMetadata(imageId) {
  const metadataDiv = document.getElementById(`metadata-${imageId}`);
  const showMetadataBtn = document.querySelector(`button[onclick="toggleMetadata(${imageId})"]`);
  if (metadataDiv.style.display === "none") {
    metadataDiv.style.display = "block";
    showMetadataBtn.textContent = "Ocultar Metadados";
  } else {
    metadataDiv.style.display = "none";
    showMetadataBtn.textContent = "Mostrar Metadados";
  }
}

// Função para excluir a coleção de uma imagem
async function deleteCollection(imageId) {
  if (!confirm("Tem certeza de que deseja excluir a coleção desta imagem?")) {
    return;
  }

  try {
    const response = await fetch(`/image/${imageId}/collection`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Coleção excluída com sucesso!");
      fetchImages(); // Atualiza a lista de imagens
    } else {
      alert("Erro ao excluir coleção.");
    }
  } catch (error) {
    console.error("Erro ao excluir coleção", error);
  }
}

// Carregar imagens e coleções ao iniciar a página
fetchImages();
fetchCollections();

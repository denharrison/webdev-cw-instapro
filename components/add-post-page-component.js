// add-post-page-component.js
import { addPost } from "../api.js";

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="upload-image-container"></div>
        <textarea id="description-input" class="input" placeholder="Описание"></textarea>
        <button class="button" id="add-button" ${
          !imageUrl ? "disabled" : ""
        }>Добавить</button>
      </div>
    `;

    appEl.innerHTML = appHtml;

    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange: (newImageUrl) => {
        imageUrl = newImageUrl;
        document.getElementById("add-button").disabled = !newImageUrl;
      },
    });

    document.getElementById("add-button").addEventListener("click", () => {
      const description = document.getElementById("description-input").value;

      addPost({
        token: user.token,
        description,
        imageUrl,
      })
        .then(() => {
          onAddPostClick(); // Переход на страницу постов
        })
        .catch((error) => {
          console.error("Ошибка добавления поста:", error);
          alert("Не удалось добавить пост");
        });
    });
  };

  render();
}

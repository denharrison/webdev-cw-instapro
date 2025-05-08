import { addPost } from "../api.js";
import { renderUploadImageComponent } from "./upload-image-component.js";
import { user } from "../index.js";

/**
 * Компонент страницы добавления поста.
 * @param {HTMLElement} params.appEl - Корневой элемент приложения.
 * @param {Function} params.onAddPostClick - Колбэк, вызываемый после успешного добавления поста.
 */
export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  if (!user || !user.token) {
    alert("Для добавления поста нужно войти в систему");
    goToPage(AUTH_PAGE);
    return;
  }
  
  let imageUrl = ""; // URL загруженного изображения
  let description = ""; // Текст описания поста

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить пост</h3>
          <div class="upload-image-container"></div>
          <textarea 
            id="description-input" 
            class="input input-textarea" 
            placeholder="Описание (минимум 3 символа)"
          >${description}</textarea>
          <button class="button" id="add-button" ${!imageUrl ? "disabled" : ""}>
            Опубликовать
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    // Рендер компонента загрузки изображения
    renderUploadImageComponent({
      element: document.querySelector(".upload-image-container"),
      onImageUrlChange: (newImageUrl) => {
        imageUrl = newImageUrl;
        updateAddButtonState();
      },
    });

    // Поля ввода
    const descriptionInput = document.getElementById("description-input");
    descriptionInput.addEventListener("input", (e) => {
      description = e.target.value;
      updateAddButtonState();
    });

    // Кнопка "Опубликовать"
    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl || description.trim().length < 3) {
        alert("Добавьте фото и описание (минимум 3 символа)");
        return;
      }

      // Блокируем кнопку на время отправки
      const button = document.getElementById("add-button");
      button.disabled = true;
      button.textContent = "Публикую...";

      addPost({
        token: user.token,
        description: description.trim(),
        imageUrl,
      })
        .then(() => {
          onAddPostClick(); // Возврат на страницу постов
        })
        .catch((error) => {
          console.error("Ошибка добавления поста:", error);
          alert("Не удалось опубликовать пост. Попробуйте позже.");
        })
        .finally(() => {
          button.disabled = false;
          button.textContent = "Опубликовать";
        });
    });
  };

  // Обновление состояния кнопки
  const updateAddButtonState = () => {
    const button = document.getElementById("add-button");
    if (button) {
      button.disabled = !imageUrl || description.trim().length < 3;
    }
  };

  render();
}

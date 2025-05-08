import { loginUser, registerUser } from "../api.js";
import { renderHeaderComponent, initHeader } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";
import { USER_POSTS_PAGE } from "../routes.js";

export function renderAuthPageComponent({ appEl, setUser, user, goToPage }) {
  // Инициализация хедера один раз при монтировании
  initHeader(user, goToPage);

  let isLoginMode = true;
  let imageUrl = "";
  let authError = null;

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">
            ${isLoginMode ? "Вход в Instapro" : "Регистрация в Instapro"}
          </h3>
          <div class="form-inputs">
            ${
              !isLoginMode
                ? `
                <div class="upload-image-container"></div>
                <input 
                  type="text" 
                  id="name-input" 
                  class="input" 
                  placeholder="Имя"
                  value="${isLoginMode ? "" : "Lera"}"
                />
                `
                : ""
            }
            <input 
              type="text" 
              id="login-input" 
              class="input" 
              placeholder="Логин"
              value="${isLoginMode ? "lera123" : ""}"
            />
            <input 
              type="password" 
              id="password-input" 
              class="input" 
              placeholder="Пароль"
              value="${isLoginMode ? "lera321" : ""}"
            />
            <div class="form-error">
              ${authError ? authError : ""}
            </div>
            <button class="button" id="auth-button">
              ${isLoginMode ? "Войти" : "Зарегистрироваться"}
            </button>
          </div>
          <div class="form-footer">
            <p class="form-footer-title">
              ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
              <button class="link-button" id="toggle-button">
                ${isLoginMode ? "Зарегистрироваться." : "Войти."}
              </button>
            </p>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = appHtml;

    // Рендер хедера
    renderHeaderComponent(document.querySelector(".header-container"));

    // Компонент загрузки изображения (только для регистрации)
    if (!isLoginMode) {
      renderUploadImageComponent({
        element: document.querySelector(".upload-image-container"),
        onImageUrlChange: (newImageUrl) => {
          imageUrl = newImageUrl;
        },
      });
    }

    // Обработчики событий
    document
      .getElementById("auth-button")
      .addEventListener("click", handleAuth);
    document
      .getElementById("toggle-button")
      .addEventListener("click", toggleAuthMode);
  };

  const handleAuth = () => {
    authError = null;

    if (isLoginMode) {
      const login = document.getElementById("login-input").value.trim();
      const password = document.getElementById("password-input").value.trim();

      if (!login || !password) {
        authError = "Заполните все поля";
        render();
        return;
      }

      loginUser({ login, password })
        .then((response) => {
          if (response.user) {
            setUser(response.user);
            goToPage(POSTS_PAGE);
          }
        })
        .catch((error) => {
          authError = error.message;
          render();
        });
    } else {
      const name = document.getElementById("name-input").value.trim();
      const login = document.getElementById("login-input").value.trim();
      const password = document.getElementById("password-input").value.trim();

      if (!name || !login || !password) {
        authError = "Заполните все поля";
        render();
        return;
      }

      if (!imageUrl) {
        authError = "Выберите изображение";
        render();
        return;
      }

      registerUser({ login, password, name, imageUrl })
        .then((response) => {
          if (response.user) {
            setUser(response.user);
            goToPage(POSTS_PAGE);
          }
        })
        .catch((error) => {
          authError = error.message;
          render();
        });
    }
  };

  const toggleAuthMode = () => {
    isLoginMode = !isLoginMode;
    authError = null;
    render();
  };

  // Первоначальный рендер
  render();
}

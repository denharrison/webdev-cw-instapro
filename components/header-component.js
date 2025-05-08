import { ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE } from "../routes.js";
import { logout } from "../index.js";

let currentUser = null;
let currentGoToPage = () => {};

export function initHeader(user, goToPage) {
  currentUser = user;
  currentGoToPage = goToPage;
}

export function renderHeaderComponent(element) {
  try {
    // Проверяем и нормализуем element
    const container =
      typeof element === "string" ? document.querySelector(element) : element;

    if (!(container instanceof HTMLElement)) {
      console.error("Header: Invalid container", container);
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <h1 class="logo">instapro</h1>
        <button class="header-button add-or-login-button">
          ${
            currentUser
              ? `<div title="Добавить пост" class="add-post-sign"></div>`
              : "Войти"
          }
        </button>
        ${
          currentUser
            ? `<button title="${currentUser.name}" class="header-button logout-button">Выйти</button>`
            : ""
        }
      </div>
    `;

    // Безопасные обработчики
    const addListener = (selector, handler) => {
      const el = container.querySelector(selector);
      if (el) el.addEventListener("click", handler);
    };

    addListener(".logo", () => currentGoToPage(POSTS_PAGE));
    addListener(".add-or-login-button", () => {
      currentUser
        ? currentGoToPage(ADD_POSTS_PAGE)
        : currentGoToPage(AUTH_PAGE);
    });
    addListener(".logout-button", logout);
  } catch (error) {
    console.error("Header render error:", error);
  }
}

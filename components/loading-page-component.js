import { renderHeaderComponent } from "./header-component.js";

export function renderLoadingPageComponent({ appEl, user, goToPage }) {
  const container = typeof appEl === 'string' ? document.querySelector(appEl) : appEl;
  
  if (!container) {
    console.error('LoadingPage: Invalid container');
    return;
  }

  container.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="loading-page">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
    </div>
  `;

  // Используем безопасный рендер хедера
  const headerContainer = container.querySelector('.header-container');
  if (headerContainer) {
    renderHeaderComponent(headerContainer);
  } else {
    console.error('Header container not found');
  }
}
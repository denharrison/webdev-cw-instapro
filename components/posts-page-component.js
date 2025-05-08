import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { getPosts, likePost, dislikePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  // Проверка и нормализация appEl
  const container =
    typeof appEl === "string" ? document.querySelector(appEl) : appEl;
  if (!container) {
    console.error("PostsPage: Invalid container");
    return;
  }

  // Функция рендеринга постов
  const renderPosts = (posts) => {
    try {
      const postsHtml = posts
        .map(
          (post) => `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
          </div>
          <div class="post-image-container">
            <img class="post-image" src="${post.imageUrl}">
          </div>
          <div class="post-likes">
            <button data-post-id="${post.id}" class="like-button">
              <img src="./assets/images/like-${
                post.likes.some((like) => like.userId === user?._id)
                  ? "active"
                  : "not-active"
              }.svg">
            </button>
            <p class="post-likes-text">
              Нравится: <strong>${post.likes.length}</strong>
            </p>
          </div>
          <p class="post-text">
            <span class="user-name">${post.user.name}</span>
            ${post.description}
          </p>
          <p class="post-date">
            ${new Date(post.createdAt).toLocaleDateString()} 
            ${new Date(post.createdAt).toLocaleTimeString()}
          </p>
        </li>
      `
        )
        .join("");

      container.innerHTML = `
        <div class="page-container">
          <div class="header-container"></div>
          <ul class="posts">${postsHtml}</ul>
        </div>
      `;

      // Рендер хедера
      const headerContainer = container.querySelector(".header-container");
      if (headerContainer) {
        renderHeaderComponent(headerContainer);
      }

      // Обработчики событий
      initEventListeners();
    } catch (error) {
      console.error("Posts render error:", error);
      container.innerHTML = `
        <div class="page-container">
          <div class="header-container"></div>
          <div class="error">Ошибка при загрузке постов</div>
        </div>
      `;
      renderHeaderComponent(container.querySelector(".header-container"));
    }
  };

  // Инициализация обработчиков
  const initEventListeners = () => {
    // Лайки
    container.querySelectorAll(".like-button").forEach((button) => {
      button.addEventListener("click", async () => {
        if (!user) {
          alert("Для этого действия нужно войти");
          return;
        }

        const postId = button.dataset.postId;
        const post = posts.find((p) => p.id === postId);
        const isLiked = post.likes.some((like) => like.userId === user._id);

        try {
          if (isLiked) {
            await dislikePost({ token: user.token, postId });
          } else {
            await likePost({ token: user.token, postId });
          }
          const updatedPosts = await getPosts({ token: user.token });
          renderPosts(updatedPosts);
        } catch (error) {
          console.error("Like error:", error);
          alert("Не удалось поставить лайк");
        }
      });
    });

    // Клики по пользователям
    container.querySelectorAll(".post-header").forEach((header) => {
      header.addEventListener("click", () => {
        goToPage(USER_POSTS_PAGE, { userId: header.dataset.userId });
      });
    });
  };

  // Первоначальный рендер
  if (posts.length > 0) {
    renderPosts(posts);
  } else {
    container.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="loading">Загрузка постов...</div>
      </div>
    `;
    renderHeaderComponent(container.querySelector(".header-container"));

    getPosts({ token: user?.token })
      .then((newPosts) => renderPosts(newPosts))
      .catch((error) => {
        console.error("Posts load error:", error);
        container.innerHTML = `
          <div class="page-container">
            <div class="header-container"></div>
            <div class="error">Ошибка загрузки: ${error.message}</div>
          </div>
        `;
        renderHeaderComponent(container.querySelector(".header-container"));
      });
  }
}

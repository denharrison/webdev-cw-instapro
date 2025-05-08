import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, user } from "../index.js";
import { getPosts, likePost, dislikePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  const renderPosts = (posts) => {
    const postsHtml = posts
      .map((post) => {
        const isLiked = post.likes.some((like) => like.userId === user._id);
        return `
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
                  isLiked ? "active" : "not-active"
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
              ${new Date(post.createdAt).toLocaleDateString()} ${new Date(
          post.createdAt
        ).toLocaleTimeString()}
            </p>
          </li>
        `;
      })
      .join("");

    appEl.innerHTML = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">${postsHtml}</ul>
      </div>
    `;

    // Добавляем обработчики событий
    document.querySelectorAll(".like-button").forEach((button) => {
      button.addEventListener("click", () => {
        const postId = button.dataset.postId;
        const post = posts.find((post) => post.id === postId);
        const isLiked = post.likes.some((like) => like.userId === user._id);

        (isLiked ? dislikePost : likePost)({ token: user.token, postId })
          .then(() => {
            return getPosts({ token: user.token });
          })
          .then((newPosts) => {
            renderPosts(newPosts);
          })
          .catch((error) => {
            console.error("Ошибка:", error);
            alert("Не удалось поставить лайк");
          });
      });
    });

    document.querySelectorAll(".post-header").forEach((header) => {
      header.addEventListener("click", () => {
        goToPage(USER_POSTS_PAGE, {
          userId: header.dataset.userId,
        });
      });
    });
  };

  // Первоначальная загрузка постов
  getPosts({ token: user.token })
    .then((posts) => {
      renderPosts(posts);
    })
    .catch((error) => {
      console.error("Ошибка загрузки постов:", error);
      alert("Не удалось загрузить посты");
    });

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });
}

import { getPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import {
  initHeader,
  renderHeaderComponent,
} from "./components/header-component.js";

// Глобальное состояние приложения
export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  return user?.token ? `Bearer ${user.token}` : undefined;
};

// Объявляем функцию до ее использования
const renderApp = () => {
  const appEl = document.getElementById("app");
  if (!appEl) {
    console.error("App element not found");
    return;
  }

  switch (page) {
    case LOADING_PAGE:
      return renderLoadingPageComponent({
        appEl,
        user,
        goToPage,
      });

    case AUTH_PAGE:
      return renderAuthPageComponent({
        appEl,
        setUser: (newUser) => {
          user = newUser;
          saveUserToLocalStorage(user);
          initHeader(user, goToPage);
          goToPage(POSTS_PAGE);
        },
        user,
        goToPage,
      });

    case ADD_POSTS_PAGE:
      if (!user) return goToPage(AUTH_PAGE);
      return renderAddPostPageComponent({
        appEl,
        onAddPostClick: ({ description, imageUrl }) => {
          console.log("Добавляю пост...", { description, imageUrl });
          goToPage(POSTS_PAGE);
        },
      });

    case POSTS_PAGE:
      return renderPostsPageComponent({
        appEl,
      });

    case USER_POSTS_PAGE:
      if (!user) return goToPage(AUTH_PAGE);
      appEl.innerHTML = "Здесь будет страница фотографий пользователя";
      return;

    default:
      console.error("Unknown page:", page);
  }
};

// Теперь объявляем goToPage после renderApp
export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      if (!user) {
        alert("Для добавления поста необходимо войти в систему");
        page = AUTH_PAGE;
        return renderApp();
      }
      page = ADD_POSTS_PAGE;
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          if (error.message === "Нет авторизации") {
            logout();
          } else {
            goToPage(POSTS_PAGE);
          }
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      if (!user) {
        alert("Для просмотра страницы пользователя необходимо войти в систему");
        page = AUTH_PAGE;
        return renderApp();
      }
      console.log("Открываю страницу пользователя: ", data.userId);
      page = USER_POSTS_PAGE;
      posts = [];
      return renderApp();
    }

    page = newPage;
    renderApp();
    return;
  }

  throw new Error("Страницы не существует");
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  initHeader(null, goToPage);
  goToPage(AUTH_PAGE);
};

// Инициализация приложения
initHeader(user, goToPage);
if (!user) {
  goToPage(AUTH_PAGE);
} else {
  goToPage(POSTS_PAGE);
}

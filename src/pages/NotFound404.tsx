import { useEffect } from "react";
import NotFound from "./NotFound";

const NotFound404 = () => {
  useEffect(() => {
    // Сигнал для Яндекса и поисковых роботов — страница не существует
    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = "noindex, nofollow";
    metaRobots.setAttribute("data-page", "404");
    document.head.appendChild(metaRobots);

    // Сигнал для пререндеров (Яндекс, Google) — вернуть HTTP 404
    const metaStatus = document.createElement("meta");
    metaStatus.name = "prerender-status-code";
    metaStatus.content = "404";
    metaStatus.setAttribute("data-page", "404");
    document.head.appendChild(metaStatus);

    // Обновляем title страницы
    const prevTitle = document.title;
    document.title = "404 — Страница не найдена | Наша Семья";

    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaStatus);
      document.title = prevTitle;
    };
  }, []);

  return <NotFound />;
};

export default NotFound404;

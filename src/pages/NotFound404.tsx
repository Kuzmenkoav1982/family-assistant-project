import { useEffect } from "react";
import NotFound from "./NotFound";

/**
 * SEO-404 (client-side смягчение).
 *
 * Полное исправление = сервер отдаёт HTTP 404. Без доступа к инфраструктуре
 * хостинга мы делаем максимум на стороне фронта:
 *  - переписываем СТАТИЧЕСКИЙ <meta name="robots"> из index.html на noindex,nofollow
 *    (а не добавляем второй тег — иначе остаётся исходный index,follow);
 *  - снимаем <link rel="canonical"> на главную, чтобы мусорный URL не склеивался
 *    с главной страницей;
 *  - подменяем title;
 *  - оставляем сигнал prerender-status-code=404 для пререндеров.
 *
 * Ограничение: реальный HTTP-статус остаётся 200 (статический SPA-хостинг).
 * Настоящий 404 требует серверного/edge-конфига.
 */
const NotFound404 = () => {
  useEffect(() => {
    const head = document.head;

    // 1. robots: переписываем СУЩЕСТВУЮЩИЙ тег из index.html, а не добавляем второй
    const existingRobots = head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prevRobots = existingRobots?.getAttribute("content") ?? null;
    let createdRobots: HTMLMetaElement | null = null;
    if (existingRobots) {
      existingRobots.setAttribute("content", "noindex, nofollow");
    } else {
      createdRobots = document.createElement("meta");
      createdRobots.name = "robots";
      createdRobots.content = "noindex, nofollow";
      head.appendChild(createdRobots);
    }

    // 2. canonical на главную убираем — мусорный URL не должен указывать на "/"
    const canonical = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const prevCanonicalHref = canonical?.getAttribute("href") ?? null;
    if (canonical) canonical.remove();

    // 3. Сигнал для пререндеров — вернуть HTTP 404
    const metaStatus = document.createElement("meta");
    metaStatus.name = "prerender-status-code";
    metaStatus.content = "404";
    metaStatus.setAttribute("data-page", "404");
    head.appendChild(metaStatus);

    // 4. title
    const prevTitle = document.title;
    document.title = "Страница не найдена — Наша Семья";

    return () => {
      // Восстанавливаем head при переходе на нормальную страницу
      if (existingRobots && prevRobots !== null) {
        existingRobots.setAttribute("content", prevRobots);
      }
      if (createdRobots) createdRobots.remove();
      if (prevCanonicalHref !== null) {
        const link = document.createElement("link");
        link.rel = "canonical";
        link.href = prevCanonicalHref;
        head.appendChild(link);
      }
      metaStatus.remove();
      document.title = prevTitle;
    };
  }, []);

  return <NotFound />;
};

export default NotFound404;

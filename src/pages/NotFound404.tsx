import { useEffect } from "react";
import NotFound from "./NotFound";

const NotFound404 = () => {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    meta.setAttribute("data-page", "404");
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return <NotFound />;
};

export default NotFound404;

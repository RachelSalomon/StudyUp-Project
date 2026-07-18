import { useEffect, useState } from "react";
import { loadJQuery } from "../utils/jqueryApi";

export function useJQuery() {
  const [ready, setReady] = useState(!!window.jQuery);

  useEffect(() => {
    loadJQuery()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  return ready;
}

import { useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function useSearchHistory(maxItems = 20) {
  const [historyStorage, saveHistoryStorage] = useLocalStorage<string[]>("searchHistory", []);

  const push = useCallback(
    (search: string) => {
      saveHistoryStorage([search, ...historyStorage.filter((h) => h !== search)].slice(0, maxItems));
    },
    [saveHistoryStorage]
  );

  return { history: historyStorage, push };
}

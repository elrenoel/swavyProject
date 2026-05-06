import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as listApi from "../services/list";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listApi.getAllLists();
      setLists(data);
    } catch (err) {
      setError(err?.message || "Failed to load lists");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLists();
  }, []);

  const getListById = useCallback(async (listId) => {
    const list = await listApi.getListById(listId);
    if (list) {
      setLists((prev) => {
        const exists = prev.some((item) => item.id === list.id);
        if (!exists) return [list, ...prev];
        return prev.map((item) => (item.id === list.id ? list : item));
      });
    }

    return list;
  }, []);

  const createList = useCallback(async ({ title, desc }) => {
    const list = await listApi.createList({ title, desc });
    if (list) {
      setLists((prev) => [list, ...prev]);
    }
    return list;
  }, []);

  const addSongToList = useCallback(async (listId, song) => {
    const created = await listApi.addSongToList(listId, song);
    if (!created) return null;

    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        const exists = list.songs?.some((item) => item.id === created.id);
        if (exists) return list;
        return {
          ...list,
          songs: [...(list.songs || []), created],
        };
      }),
    );

    return created;
  }, []);

  const removeSongFromList = useCallback(async (listId, songId) => {
    await listApi.removeSongFromList(listId, songId);

    let updatedList = null;
    setLists((prev) =>
      prev.map((list) => {
        if (list.id !== listId) return list;
        updatedList = {
          ...list,
          songs: (list.songs || []).filter((song) => song.id !== songId),
        };
        return updatedList;
      }),
    );

    return updatedList;
  }, []);

  return (
    <ListContext.Provider
      value={{
        lists,
        isLoading,
        error,
        refreshLists,
        getListById,
        createList,
        addSongToList,
        removeSongFromList,
      }}
    >
      {children}
    </ListContext.Provider>
  );
};

export const useLists = () => useContext(ListContext);

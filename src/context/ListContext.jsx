import { createContext, useContext, useState, useEffect } from "react";

const ListContext = createContext();

export const ListProvider = ({ children }) => {
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem("lists");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(lists));
  }, [lists]);

  const addSongToList = (listId, song) => {
    setLists(prev =>
      prev.map(list => {
        if (list.id !== listId) return list;

        const exists = list.songs.find(s => s.id === song.id);
        if (exists) return list;

        return {
          ...list,
          songs: [...list.songs, song]
        };
      })
    );
  };

  const removeSongFromList = (listId, songId) => {
    setLists(prev =>
      prev.map(list => {
        if (list.id !== listId) return list;

        return {
          ...list,
          songs: list.songs.filter(song => song.id !== songId)
        };
      })
    );
  };

  return (
    <ListContext.Provider value={{
      lists,
      setLists,
      addSongToList,
      removeSongFromList
    }}>
      {children}
    </ListContext.Provider>
  );
};

export const useLists = () => useContext(ListContext);
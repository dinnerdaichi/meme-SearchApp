import axios from "axios";
import md5 from "crypto-js/md5";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarvelCharacter } from "./interfaces/MarvelCharacter";



const BASE_URL = "https://gateway.marvel.com/v1/public/characters";

const RandomMarvelCharacterFetcher: React.FC = () => {
  // eslint-disable-next-line
  // const [characters, setCharacters] = useState<MarvelCharacter[]>([]);
  // const [searchTerm, setSearchTerm] = useState<string>(""); // 検索ワードの状態
  const [randomCharacter, setRandomCharacter] = useState<MarvelCharacter[]>([]);
  // eslint-disable-next-line
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRandomMarvelCharacters = async () => {
    setLoading(true);
    const ts = Date.now();
    const publicKey = "10a7b1e2e36a7af44b45b670370bb4b7";
    const privateKey = "abde8a432425925a22eb7566fe09397a6fe7af8b";

    const generateHash = (ts: number, privateKey: string, publicKey: string) => {
      return md5(`${ts}${privateKey}${publicKey}`).toString();
    };

    const hash = generateHash(ts, privateKey, publicKey);
    let characters: MarvelCharacter[] = [];

    try {
      // 15枚のキャラクターが集まるまでループ
      while (characters.length < 3) {
        const randomOffset = Math.floor(Math.random() * 1000);
        const response = await axios.get(`${BASE_URL}?limit=10&offset=${randomOffset}&ts=${ts}&apikey=${publicKey}&hash=${hash}`);
        const filteredCharacters = response.data.data.results.filter((character: MarvelCharacter) => {
          const path = character.thumbnail.path;
          return path && !path.includes("image_not_available");
        });

        characters = [...characters, ...filteredCharacters]; // 新しいキャラクターを追加

        // 重複を排除
        // eslint-disable-next-line
        characters = Array.from(new Set(characters.map((character) => character.id))).map((id) => characters.find((character) => character.id === id));
      }

      setRandomCharacter(characters.slice(0, 15)); // 最終的に15枚に制限
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("API error:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // コンポーネントがマウントされた時にランダムなキャラクターを取得
    fetchRandomMarvelCharacters();
  }, []);

  return (
    <div className="p-mv__content">
      {randomCharacter.map((character: MarvelCharacter) => (
        <Link
          to={`/characters/${character.id}`}
          key={character.id}
          className="p-mv__item"
        >
          <img
            src={`${character.thumbnail.path}.${character.thumbnail.extension}`}
            alt={character.name}
          />
          <p className="character-name">{character.name}</p>
        </Link>
      ))}
    </div>
  );
};


export default RandomMarvelCharacterFetcher;
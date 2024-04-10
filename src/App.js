import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://swapi.dev/api/people/?page=${page}`);
        setCharacters(response.data.results);
        setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 characters per page
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [page]);

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => prevPage - 1);
  };

  const toggleModal = (character) => {
    setSelectedCharacter(character);
  };

  const closeModal = () => {
    setSelectedCharacter(null);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCharacters = characters.filter(character =>
    character.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search characters..."
        />
      </div>
      <div className="character-list">
        {filteredCharacters.map((character, index) => (
          <CharacterCard key={index} character={character} onClick={() => toggleModal(character)} />
        ))}
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        onNext={handleNextPage}
        onPrev={handlePrevPage}
      />
      {selectedCharacter && <CharacterDetails character={selectedCharacter} onClose={closeModal} />}
    </div>
  );
};

const CharacterCard = ({ character, onClick }) => {
  const speciesColor = character.species.length > 0 ? character.species[0] === 'https://swapi.dev/api/species/1/' ? '#ff9999' : '#99ff99' : '#9999ff';

  return (
    <div className="character-card" style={{ backgroundColor: speciesColor }} onClick={onClick}>
      <img className="character-image" src={`https://picsum.photos/200?random=${character.name}`} alt={character.name} />
      <h3 className="character-name">{character.name}</h3>
    </div>
  );
};

const Pagination = ({ page, totalPages, onNext, onPrev }) => {
  return (
    <div className="pagination">
      <button onClick={onPrev} disabled={page === 1}>Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button onClick={onNext} disabled={page === totalPages}>Next</button>
    </div>
  );
};

const CharacterDetails = ({ character, onClose }) => {
  const [homeworld, setHomeworld] = useState(null);

  useEffect(() => {
    const fetchHomeworld = async () => {
      try {
        const response = await axios.get(character.homeworld);
        setHomeworld(response.data);
      } catch (error) {
        console.error('Error fetching homeworld:', error);
      }
    };

    fetchHomeworld();
  }, [character.homeworld]);

  return (
    <div className="character-details">
      <h2>{character.name}</h2>
      <p>Height: {character.height} cm</p>
      <p>Mass: {character.mass} kg</p>
      <p>Birth Year: {character.birth_year}</p>
      <p>Number of Films: {character.films.length}</p>
      <p>Homeworld: {homeworld && homeworld.name}</p>
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default App;

import React from 'react';
import { MdSearch } from 'react-icons/md';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="search-bar-container">
      <MdSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <style jsx>{`
        .search-bar-container {
          display: flex;
          align-items: center;
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.5rem 1rem;
          gap: 0.75rem;
          width: 100%;
          max-width: 400px;
          transition: var(--transition);
        }
        .search-bar-container:focus-within {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }
        .search-icon {
          color: var(--text-muted);
          font-size: 1.25rem;
        }
        .search-input {
          background: transparent;
          border: none;
          color: var(--text-main);
          width: 100%;
          outline: none;
          font-size: 0.95rem;
        }
        .search-input::placeholder {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;

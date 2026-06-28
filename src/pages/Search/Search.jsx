import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { HiOutlineSearch } from 'react-icons/hi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
import { supabase } from '../../utils/supabase/client';
import './Search.css';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!query) return;
    const run = async () => {
      setLoading(true);
      setSearched(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);
      setResults(data ?? []);
      setLoading(false);
    };
    run();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const toCard = p => ({ id: p.id, name: p.name, price: p.price, image: p.images ?? '' });

  return (
    <div className="search-page">
      <Navbar />
      <main className="search-container">
        <p className="search-tag">Search</p>
        <h1 className="search-headline">Find Your Perfect Wig</h1>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search wigs by name..."
            className="search-input"
            autoFocus
          />
          <button type="submit" className="search-btn"><HiOutlineSearch /></button>
        </form>

        {loading && <p className="search-status">Searching...</p>}

        {!loading && searched && query && results.length > 0 && (
          <p className="search-status">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="search-grid">
            {results.map(p => <ProductCard key={p.id} product={toCard(p)} />)}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="search-empty-container">
            <div className="search-empty-icon-wrap">
              <HiOutlineSearch />
            </div>
            <h2 className="search-empty-title">No wigs found</h2>
            <p className="search-empty-text">
              We couldn’t find any wigs matching your search. Try another keyword or explore our collections.
            </p>
            <Link to="/shop" className="search-empty-btn">
              Continue Shopping
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Search;

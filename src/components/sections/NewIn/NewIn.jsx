
import './NewIn.css';
import ProductCard from '../../ProductCard/ProductCard';

const NewIn = () => {
  // Sample array tracking the exact items present in image_93149b.jpg
  const newArrivals = [
    { id: 1, name: "Layered bone straight", price: 270000, image: "/wig3.svg" },
    { id: 2, name: "Short wavy", price: 270000, image: "/wig4.svg" },
    { id: 3, name: "Pixie Curls", price: 270000, image: "/wig5.svg" },
    { id: 4, name: "Bone Straight", price: 270000, image: "/wig6.svg" },
  ];

  return (
    <section className="new-in-section">
      <div className="new-in-container">
        
        {/* Header Structure matching your layout guidelines */}
        <div className="new-in-header">
          <p className="new-in-tag">Shop</p>
          <h2 className="new-in-headline">New Ins</h2>
        </div>

        {/* 4-Column Component Grid */}
        <div className="new-in-grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default NewIn;
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Search } from 'lucide-react';

const DESTINATIONS = [
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    rating: '4.5',
    reviews: 128,
    image: 'shimla.jpg',
    hotels: [
      { name: 'Havens Resort', price: 4120, image: 'Hotel Shimla Havens Resort.jpg' },
      { name: 'Oberoi Cecil', price: 4200, image: 'oberoi cecil shimla.jpg' },
      { name: 'Marigold Sarovar Portico', price: 4150, image: 'marigoldsarovarporticoshimla.jpg' },
      { name: 'Flag House Resort', price: 4100, image: 'hotel2.jpg.jpg' }
    ]
  },
  {
    id: 'araku',
    name: 'Araku Valley',
    state: 'Andhra Pradesh',
    rating: '4.3',
    reviews: 87,
    image: 'ArakuHarithaValleyResort.jpg',
    hotels: [
      { name: 'Krishna Tara Comforts', price: 370, image: 'krishna tara comforts.jpg' },
      { name: 'Sri Sai Suvarna Inn', price: 360, image: 'ss.jpg' },
      { name: 'Araku Haritha Valley Resort', price: 380, image: 'ArakuHarithaValleyResort.jpg' },
      { name: 'Hill Park Resort', price: 390, image: 'Hill Park Resorts.jpg' }
    ]
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    rating: '4.6',
    reviews: 215,
    image: 'manali.jpg',
    hotels: [
      { name: 'Hotel Devlok Manali', price: 280, image: 'Hotel Devlok Manali.jpg' },
      { name: 'Sterling Manali-Resorts&Hotels', price: 2100, image: 'Sterling Manali-Resorts&Hotels.jpg' },
      { name: 'Hotel Snow Park Manali', price: 290, image: 'Hotel Snow Park Manali.jpg' },
      { name: 'Hotel Jupiter', price: 2110, image: 'Hotel Jupiter, Manali.jpg' }
    ]
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    rating: '4.7',
    reviews: 312,
    image: 'goa.JPG',
    hotels: [
      { name: 'Hotel Colva Kinara', price: 2120, image: 'Hotel Colva Kinara.jpg' },
      { name: 'Jasminn by Mango Hotels', price: 2150, image: 'Jasminn by Mango Hotels.jpg' },
      { name: 'The Queeny', price: 2130, image: 'The Queeny.jpg' },
      { name: 'Amigo Plaza', price: 2110, image: 'Amigo Plaza.jpg' }
    ]
  },
  {
    id: 'ooty',
    name: 'Ooty',
    state: 'Tamil Nadu',
    rating: '4.4',
    reviews: 156,
    image: 'Ooty-Flower-Show-Main-II- (1).jpg',
    hotels: [
      { name: 'Hotel Preethi Classic Towers', price: 380, image: 'Hotel Preethi Classic Towers.jpg' },
      { name: 'Hotel Lakeview', price: 3100, image: 'Hotel Lakeview.jpg' },
      { name: 'Treebo Yantra Leisures', price: 390, image: 'Treebo Yantra Leisures.jpg' },
      { name: 'Berry Hills Resort', price: 3110, image: 'Berry Hills Resort.jpg' }
    ]
  },
  {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    rating: '4.8',
    reviews: 428,
    image: 'taj_mahal_agra_indian_4k_5k-3840x2160.jpg',
    hotels: [
      { name: 'Hotel Atulyaa Taj', price: 3100, image: 'Hotel Atulyaa Taj.jpg' },
      { name: 'ITC Mughal', price: 3120, image: 'ITC Mughal.jpg' },
      { name: 'Hotel Royale Residency', price: 380, image: 'Hotel Royale Residency.jpg' },
      { name: 'Hotel Pushp Villa', price: 390, image: 'Hotel Pushp Villa.jpg' }
    ]
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    state: 'West Bengal',
    rating: '4.5',
    reviews: 189,
    image: 'darjeeling.jpg',
    hotels: [
      { name: 'Central Heritage Resort', price: 580, image: 'Central Heritage Resort.jpg' },
      { name: 'Summit Grace Hotel', price: 590, image: 'Summit Grace Hotel.jpg' },
      { name: 'The Swiss Hotel', price: 5100, image: 'The Swiss Hotel.jpg' },
      { name: 'Hotel Broadway (Annexe)', price: 5110, image: 'Hotel Broadway (Annexe).jpg' }
    ]
  },
  {
    id: 'dalhousie',
    name: 'Dalhousie',
    state: 'Himachal Pradesh',
    rating: '4.2',
    reviews: 95,
    image: 'dalhousie.jpg',
    hotels: [
      { name: 'Snow Valley Resorts', price: 480, image: 'Snow Valley Resorts.jpg' },
      { name: 'Grand View Hotel', price: 4100, image: 'Grand View Hotel.jpg' },
      { name: 'Alps Resort Dalhousie', price: 4120, image: 'Alps Resort Dalhousie.jpg' },
      { name: 'A.S Clarks Inn', price: 490, image: 'hotel3.jpg' }
    ]
  },
  {
    id: 'dharamshala',
    name: 'Dharamshala',
    state: 'Himachal Pradesh',
    rating: '4.4',
    reviews: 142,
    image: 'dharamshala.jpeg',
    hotels: [
      { name: 'Hotel Center Point', price: 270, image: 'Hotel Center Point.jpg' },
      { name: 'Hotel Inclover', price: 280, image: 'Hotel Inclover.jpg' },
      { name: 'Treebo GK Conifer', price: 290, image: 'Treebo GK Conifer.jpg' },
      { name: 'WelcomHeritage Grace Hotel', price: 2100, image: 'WelcomHeritage Grace Hotel.jpg' }
    ]
  },
  {
    id: 'alleppey',
    name: 'Alleppey',
    state: 'Kerala',
    rating: '4.6',
    reviews: 203,
    image: 'alleppey.jpg',
    hotels: [
      { name: 'Hotel Royale Park', price: 380, image: 'Hotel Royale Park.jpg' },
      { name: 'Alleppey Prince Hotel', price: 390, image: 'Alleppey Prince Hotel.jpg' },
      { name: 'Hotel Bonanza', price: 3100, image: 'Hotel Bonanza.jpg' },
      { name: 'Royal Homes', price: 370, image: 'Royal Homes.jpg' }
    ]
  }
];

export default function Home({ backendUrl }) {
  const [searchVal, setSearchVal] = useState('');
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const navigate = useNavigate();
  const destsRef = useRef(null);
  const hotelsRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchVal.trim().toLowerCase();
    const found = DESTINATIONS.find(d => 
      d.name.toLowerCase().includes(query) || 
      d.state.toLowerCase().includes(query)
    );
    if (found) {
      setSelectedDest(found);
      setTimeout(() => {
        hotelsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      destsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDestClick = (dest) => {
    setSelectedDest(dest);
    setTimeout(() => {
      hotelsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookNow = (hotelName, price) => {
    navigate(`/booking?hotel=${encodeURIComponent(hotelName)}&price=${price}`);
  };

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div 
        className="hero animate-fadeIn" 
        style={{ backgroundImage: `url(${backendUrl}/images/main.jpg)` }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontFamily: 'var(--font-sans)' }}>
            Experience Luxury<br />Like Never Before
          </h1>
          <p className="hero-subtitle">
            Book your stay at the world's most exquisite hotels. Secure, Seamless, and Spectacular.
          </p>

          <form onSubmit={handleSearch} className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Where would you like to go?" 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              list="dest-options"
            />
            <datalist id="dest-options">
              {DESTINATIONS.map(d => (
                <option key={d.id} value={d.name}>{d.state}</option>
              ))}
            </datalist>
            <button type="submit" className="search-btn">
              <Search size={18} />
            </button>
          </form>

          <div style={{ marginTop: '2.5rem' }}>
            <button 
              onClick={() => destsRef.current?.scrollIntoView({ behavior: 'smooth' })} 
              className="hero-cta-btn"
            >
              Book Now <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container" ref={destsRef}>
        {/* Destination Navigation Quicklinks */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3.5rem' }}>
          <div className="glass" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '8px', borderRadius: '30px', maxWidth: '100%', justifyContent: 'center' }}>
            {DESTINATIONS.map(d => (
              <button
                key={d.id}
                onClick={() => handleDestClick(d)}
                style={{
                  background: selectedDest.id === d.id ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: selectedDest.id === d.id ? 'white' : 'var(--text-muted)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s'
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        <h2 className="section-title">Explore Our Destinations</h2>
        <div className="destinations-grid">
          {DESTINATIONS.map(d => (
            <div 
              key={d.id}
              onClick={() => handleDestClick(d)}
              className={`destination-card glass ${selectedDest.id === d.id ? 'active-dest' : ''}`}
              style={{ 
                cursor: 'pointer', 
                border: selectedDest.id === d.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                boxShadow: selectedDest.id === d.id ? '0 0 15px var(--primary-glow)' : 'none'
              }}
            >
              <div className="dest-img-container">
                <img src={`${backendUrl}/images/${d.image}`} alt={d.name} />
                <span className="dest-tag">{d.state}</span>
              </div>
              <div className="dest-card-content">
                <div>
                  <h3 className="dest-card-title">{d.name}</h3>
                  <div className="dest-rating">
                    <Star size={14} fill="currentColor" />
                    <span>{d.rating}</span>
                    <span className="rating-count">({d.reviews} reviews)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    View Hotels <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Destination's Hotels */}
        <div ref={hotelsRef} style={{ paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <h2 className="section-title">Luxury Hotels in {selectedDest.name}</h2>
          <div className="hotel-grid">
            {selectedDest.hotels.map((hotel, idx) => (
              <div key={idx} className="hotel-card glass">
                <div className="hotel-img-container">
                  <img src={`${backendUrl}/images/${hotel.image}`} alt={hotel.name} />
                  <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(4,8,20,0.8)', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <MapPin size={12} style={{ color: 'var(--primary)' }} />
                    {selectedDest.name}
                  </div>
                </div>
                <div className="hotel-content">
                  <div>
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div style={{ display: 'flex', gap: '3px', color: 'var(--gold)', marginTop: '5px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < 4 ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="hotel-price">
                      ₹{hotel.price.toLocaleString('en-IN')}
                      <span> / night</span>
                    </div>
                    <button 
                      onClick={() => handleBookNow(hotel.name, hotel.price)} 
                      className="btn-book"
                    >
                      Book Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

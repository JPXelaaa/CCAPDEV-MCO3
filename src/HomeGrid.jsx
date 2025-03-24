import { useState, useEffect } from "react";
import './HomeGrid.css';
import EstablishmentPreview from "./EstablishmentPreview";

const HomeGrid = () => {
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const establishmentsPerPage = 12;

  useEffect(() => {
    const fetchEstablishments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/establishments');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setEstablishments(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching establishments:", error);
        setError("Failed to load establishments. Please try again later.");
        setLoading(false);
      }
    };

    fetchEstablishments();
  }, []);

  const indexOfLastEstablishment = currentPage * establishmentsPerPage;
  const indexOfFirstEstablishment = indexOfLastEstablishment - establishmentsPerPage;
  const currentEstablishments = establishments.slice(indexOfFirstEstablishment, indexOfLastEstablishment);
  const totalPages = Math.ceil(establishments.length / establishmentsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  if (loading) {
    return <div className="left-main loading">Loading establishments...</div>;
  }

  if (error) {
    return <div className="left-main error">{error}</div>;
  }

  if (establishments.length === 0) {
    return <div className="left-main empty">No establishments found.</div>;
  }

  return (
    <>
      <div className="left-main">
        <div className="main-section">
          {currentEstablishments.map(establishment => (
            <EstablishmentPreview 
              key={establishment._id} 
              establishment={establishment} 
              className="grid-preview"
            />
          ))}
        </div>
      </div>
      
      {totalPages > 1 && (
        <div className="page-mover">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <a 
                className="page-link" 
                href="#" 
                aria-label="Previous"
                onClick={(e) => {
                  e.preventDefault();
                  prevPage();
                }}
              >
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            
            {[...Array(totalPages)].map((_, index) => (
              <li 
                key={index} 
                className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
              >
                <a 
                  className="page-link" 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    paginate(index + 1);
                  }}
                >
                  {index + 1}
                </a>
              </li>
            ))}
            
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <a 
                className="page-link" 
                href="#" 
                aria-label="Next"
                onClick={(e) => {
                  e.preventDefault();
                  nextPage();
                }}
              >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default HomeGrid;

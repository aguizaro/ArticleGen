import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";

// Mock images for testing
const mockImages = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  url: `https://via.placeholder.com/300?text=Image+${i + 1}`,
  title: `Image ${i + 1}`,
  description: `This is the description for Image ${i + 1}`,
}));

const Gallery = () => {
  const [images, setImages] = useState([]); // Holds images for the current page
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 9;

  useEffect(() => {
    // Simulate fetching paginated images
    const fetchImages = () => {
      const startIndex = (currentPage - 1) * imagesPerPage;
      const endIndex = startIndex + imagesPerPage;
      setImages(mockImages.slice(startIndex, endIndex));
    };

    fetchImages();
  }, [currentPage]);

  // Handles pagination click
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Total pages calculation
  const totalPages = Math.ceil(mockImages.length / imagesPerPage);

  return (
    <div className="container mt-4">
      <h1 className="text-center">Gallery</h1>
      <div className="row">
        {images.map((image) => (
          <div key={image.id} className="col-md-4 mb-4">
            <div className="card">
              <img src={image.url} alt={image.title} className="card-img-top" />
              <div className="card-body">
                <h5 className="card-title">{image.title}</h5>
                <p className="card-text">{image.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination className="justify-content-center">
        {Array.from({ length: totalPages }, (_, i) => (
          <Pagination.Item
            key={i + 1}
            active={i + 1 === currentPage}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </Pagination.Item>
        ))}
      </Pagination>
    </div>
  );
};

export default Gallery;

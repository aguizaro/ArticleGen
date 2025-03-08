import React, { useState, useEffect } from "react";
import { Pagination } from "react-bootstrap";
import { Spinner } from "react-bootstrap";

const galleryEndpoint = "https://api.letsgeneratearticles.com/gallery";
const fetchGallery = async (page, limit) => {
  try {
    if (!page || !limit) {
      throw new Error("Page and limit are required");
    }
    const response = await fetch(
      `${galleryEndpoint}?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Error fetching gallery");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching gallery:", error);
  }
};

const Gallery = () => {
  const [articles, setArticles] = useState([]); // Holds images for the current page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [articlesPerPage, setArticlesPerPage] = useState(9);

  useEffect(() => {
    const fetchGalleryOnMount = async () => {
      try {
        const data = await fetchGallery(currentPage, articlesPerPage);
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
    };

    fetchGalleryOnMount();
  }, [currentPage]);

  // Handles pagination click
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mt-4">
      {articles.length !== 0 && <h1 className="text-center mb-4">Gallery</h1>}
      <span className="text-center d-block mb-4">
        {articles.length === 0 && <Spinner animation="border" />}
      </span>
      <div className="row">
        {articles.map((a) => (
          <div key={a.seed} className="col-md-4 mb-4">
            <a
              href={`https://www.letsgeneratearticles.com/?seed=${a.seed}`}
              target="_blank"
            >
              <div className="card">
                <img
                  src={`data:image/png;base64,${a.urlToImage}`}
                  alt={a.title}
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title lead fs-5 text-center">
                    {a.title}
                  </h5>
                  <p className="card-text fw-bold text-center">
                    {a.publishedAt}
                  </p>
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {articles.length !== 0 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} />
        </Pagination>
      )}
    </div>
  );
};

export default Gallery;

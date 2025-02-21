import React, { useState, useEffect } from "react";
import "./style.css"; // Import your CSS file

const articleEndpoint =
  "https://api.letsgeneratearticles.com/article?category=";

const seedEndpoint = "https://api.letsgeneratearticles.com/generated?seed=";

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [article, setArticle] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Check for seed in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get("seed");

    if (seed) {
      fetchSeed(seed);
    } else {
      setArticle(null);
    }
  }, []); // Runs only once on component mount

  const categories = [
    "general",
    "sports",
    "entertainment",
    "technology",
    "business",
    "health",
    "science",
  ];

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const fetchSeed = async (seed) => {
    try {
      setIsButtonDisabled(true);
      const response = await fetch(`${seedEndpoint}${seed}`);
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }

      setArticle({
        title: data.title,
        publishedAt: data.publishedAt,
        seed: data.seed,
        content: data.content,
        urlToImage: data.urlToImage,
      });

      setIsButtonDisabled(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error(error);
      setIsButtonDisabled(false);
    }
  };

  // fetch article from API given the category
  const fetchArticle = async () => {
    try {
      setIsButtonDisabled(true);
      const category = selectedCategory;
      const response = await fetch(`${articleEndpoint}${category}`);
      const data = await response.json();

      if (response.status !== 200) {
        throw new Error(data.message);
      }
      setIsButtonDisabled(false);
      return data.response;
    } catch (error) {
      console.error(error);
      setIsButtonDisabled(false);
    }
  };

  const generateArticle = async () => {
    //FETCH ARTICLE FROM API
    const data = await fetchArticle();
    if (
      data.title &&
      data.publishedAt &&
      data.seed &&
      data.content &&
      data.urlToImage
    ) {
      setArticle({
        title: data.title,
        publishedAt: data.publishedAt,
        seed: data.seed,
        content: data.content,
        urlToImage: data.urlToImage,
      });

      setIsDropdownOpen(false);
    }
  };

  const downloadArticle = () => {
    // capture screen using html2canvas
  };

  return (
    <div className="container" id="app">
      <div className="header">
        <h1
          id="main-title"
          style={{
            fontSize: article ? "6em" : "10em",
            transition: "font-size 0.3s ease",
          }}
        >
          ArticleGen
        </h1>
        <h2
          id="main-subtitle"
          style={{
            fontSize: article ? "2rem" : "4em",
            transition: "font-size 0.3s ease",
          }}
        >
          Satirical News Article Generator
        </h2>
      </div>

      {!article && (
        <p id="prompt">Select a category below to generate a news article</p>
      )}

      {/* Dropdown Button */}
      <div className="dropdown">
        <button
          className="dropbtn"
          id="dropdown-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
        >
          {article ? "Select Another Category" : "Select Category"}
        </button>

        {/* Dropdown Content (only shown when isDropdownOpen is true) */}
        {isDropdownOpen && (
          <div className="dropdown-content">
            <div className="options">
              {categories.map((category) => (
                <div className="category" key={category} id={category}>
                  <label htmlFor={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </label>
                  <input
                    type="radio"
                    id={`${category}-radio`}
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={handleCategoryChange}
                  />
                </div>
              ))}
            </div>
            <div className="submit">
              <button
                id="generate-button"
                onClick={generateArticle}
                disabled={isButtonDisabled}
              >
                Generate Article
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Show article only if one is generated */}
      {console.log(article)}
      {article && (
        <div className="article">
          <h2 id="article-title">{article.title}</h2>
          <img
            src={`data:image/png;base64,${article.urlToImage}`}
            alt="Article Image"
            id="article-image"
          />
          <div className="article-body">
            <p id="article-date">{article.publishedAt}</p>
            <p id="article-content">{article.content}</p>
          </div>
          <div className="download">
            <button id="download-button" onClick={downloadArticle}>
              Download Article
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

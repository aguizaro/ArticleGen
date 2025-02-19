import React, { useState } from "react";
import "./style.css"; // Import your CSS file

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [article, setArticle] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown visibility

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

  const generateArticle = () => {
    // Placeholder function for generating articles
    setArticle({
      title: "Breaking: Satire Takes Over the World",
      date: new Date().toLocaleDateString(),
      content: `This is a generated satirical article about ${selectedCategory}.`,
      weblink: "#",
    });
  };

  return (
    <div className="container" id="app">
      <div className="header">
        <h1 id="main-title">ArticleGen</h1>
        <h2 id="main-subtitle">Satirical News Article Generator</h2>
      </div>

      <p id="prompt">Select a category below to generate a news article</p>

      {/* Dropdown Button */}
      <div className="dropdown">
        <button
          className="dropbtn"
          id="dropdown-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown
        >
          Select Category
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
              <button id="generate-button" onClick={generateArticle}>
                Generate Article
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Show article only if one is generated */}
      {article && (
        <div className="article">
          <h2 id="article-title">{article.title}</h2>
          <div className="article-body">
            <p id="article-date">{article.date}</p>
            <p id="article-content">{article.content}</p>
          </div>
          <div className="download">
            <p id="weblink">
              <a href={article.weblink}>Read more</a>
            </p>
            <button id="download-button">Download Article</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

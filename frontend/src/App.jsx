import React, { useState, useEffect } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import "bootstrap/dist/css/bootstrap.min.css"; // Ensure Bootstrap styles are included
import "./style.css"; // Your custom styles

const articleEndpoint =
  "https://api.letsgeneratearticles.com/article?category=";
const seedEndpoint = "https://api.letsgeneratearticles.com/generated?seed=";

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [article, setArticle] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    console.log("article changed: ", article);
  }, [article]);

  useEffect(() => {
    const fetchArticleOnMount = async () => {
      const params = new URLSearchParams(window.location.search);
      const seed = params.get("seed");

      if (!seed) {
        setArticle(null);
        return;
      }
      try {
        const data = await fetchSeed(seed);
        setArticle({
          title: data.title,
          publishedAt: data.publishedAt,
          seed: data.seed,
          content: data.content,
          urlToImage: data.urlToImage,
        });
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setIsButtonDisabled(false);
      }
    };

    fetchArticleOnMount();
  }, []);

  const categories = [
    "general",
    "sports",
    "entertainment",
    "technology",
    "business",
    "health",
    "science",
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const fetchSeed = async (seed) => {
    try {
      setIsButtonDisabled(true);
      const response = await fetch(`${seedEndpoint}${seed}`);
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

  const fetchArticle = async () => {
    try {
      setIsButtonDisabled(true);
      const response = await fetch(`${articleEndpoint}${selectedCategory}`);
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
    const data = await fetchArticle();
    if (
      data?.title &&
      data?.publishedAt &&
      data?.seed &&
      data?.content &&
      data?.urlToImage
    ) {
      setArticle({
        title: data.title,
        publishedAt: data.publishedAt,
        seed: data.seed,
        content: data.content,
        urlToImage: data.urlToImage,
      });
      //set url to be letsgeneratearticles.com/?seed=seed
      window.history.pushState({}, "", `?seed=${data.seed}`);
    }
  };

  return (
    <div className="container mb-0 p-0" id="app">
      <div className="header">
        <h1 id="main-title" style={article ? { fontSize: "0" } : {}}>
          ArticleGen
        </h1>
        <h2 id="main-subtitle" style={article ? { fontSize: "0" } : {}}>
          Satirical News Article Generator
        </h2>
      </div>

      {!article && (
        <p id="prompt">Select a category below to generate a news article</p>
      )}

      {/* Article only rendered when not null */}
      {article && (
        <div className="article mb-0">
          <h2 id="article-title" className=" text-center m-4">
            {article.title}
          </h2>
          <img
            src={`data:image/png;base64,${article.urlToImage}`}
            alt="Article Image"
            id="article-image"
          />
          <div className="article-body mb-0">
            <p>
              <strong id="article-date">{article.publishedAt}</strong>
            </p>
            <p className="lead mb-0" id="article-content">
              {article.content}
            </p>
          </div>
        </div>
      )}

      {/* Bootstrap Dropdown for Category Selection */}
      <div className="d-flex justify-content-center">
        {article && (
          <Button>
            <FontAwesomeIcon icon={faDownload} />
          </Button>
        )}
        <Dropdown className="mx-2">
          <Dropdown.Toggle>
            {selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {categories.map((category) => (
              <Dropdown.Item
                key={category}
                active={selectedCategory === category}
                onClick={() => handleCategoryChange(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Button onClick={generateArticle} disabled={isButtonDisabled}>
          {isButtonDisabled ? (
            <Spinner animation="border" size="sm" />
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </div>
  );
};

export default App;

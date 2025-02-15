import { useState } from "react";
import React from "react";
import "./style.css";

function App() {
    const [category, setCategory] = useState("general");

    return (
        <div className="container">
            <div className="header">
                <h1 id="title">ArticleGen</h1>
                <h2 id="subtitle">Satirical News Article Generator</h2>
            </div>
            <p id="prompt">Select a category below to generate a news article</p>
            <div className="dropdown">
                <button className="dropbtn">Select Category</button>
                <div className="dropdown-content">
                    {[
                        "general",
                        "sports",
                        "entertainment",
                        "technology",
                        "business",
                        "health",
                        "science",
                    ].map((cat) => (
                        <div key={cat} className="category">
                            <label htmlFor={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </label>
                            <input
                                type="radio"
                                id={`${cat}-radio`}
                                name="category"
                                value={cat}
                                checked={category === cat}
                                onChange={() => setCategory(cat)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <button id="generate-button">Generate Article</button>
            <div className="article">
                <h2 id="article-title"></h2>
                <img id="article-img" src="" alt="Article" />
                <div className="article-body">
                    <p id="article-date"></p>
                    <p id="article-content"></p>
                </div>
                <div className="download">
                    <p id="weblink"></p>
                    <button id="download-button">Download Article</button>
                </div>
            </div>
        </div>
    );
}

export default App;

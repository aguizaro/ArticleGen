//dependencies -----------------------------------------------------

const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const cheerio = require("cheerio");

// fetch article content -----------------------------------------------------

/**
 * Fetches and extracts article content from a given URL.
 * @param {string} url - The URL of the article to scrape.
 * @returns {Promise<string>} The article content or an error message.
 */
async function fetchArticleContent(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        let articleContent = $("article").text().trim();

        // Fallback to other possible content containers if 'article' is not found
        if (!articleContent) {
            articleContent = $(
                "div.post-content, div.entry-content, div.content, section.main-content",
            )
                .text()
                .trim();
        }
        // Further fallback using site-specific heuristics (customize as needed)
        if (!articleContent) {
            articleContent = $(
                'div[class*="body"], div[class*="text"], div[class*="article"]',
            )
                .text()
                .trim();
        }

        // Clean up whitespace
        const cleanedContent = articleContent
            .replace(/\s+/g, " ") // Replace multiple whitespace with a single space
            .trim(); // Trim leading and trailing whitespace

        return cleanedContent || null;
    } catch (error) {
        return null;
    }
}

/**
 * Fetches and extracts the main image URL from a given article URL.
 * @param {string} url - The URL of the article to scrape.
 * @returns {Promise<string>} The main image URL or null.
 */
async function fetchMainImage(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Try to find the main image using meta tags (Open Graph or Twitter)
        let imageUrl =
            $('meta[property="og:image"]').attr("content") ||
            $('meta[name="twitter:image"]').attr("content");

        // Fallback to common image selectors if meta tags are not found
        if (!imageUrl) {
            imageUrl = $(
                "img.featured-image, img.main-image, img.post-thumbnail, img.wp-post-image",
            ).attr("src");
        }
        // Further fallback using hero or banner section (customize as needed)
        if (!imageUrl) {
            imageUrl = $("div.hero img, div.banner img, header img").attr("src");
        }

        return imageUrl ? imageUrl.trim() : "No main image found";
    } catch (error) {
        return null;
    }
}

// insertion -----------------------------------------------------

// takes an array of articles and inserts them into the database
const { MongoClient } = require("mongodb"); // mongodb v2 only uses commonjs modules - do not import with ES6 syntax
const mongoClient = new MongoClient(process.env.MONGO_URI, {
    useUnifiedTopology: true,
}); //options object to avoid deprecation warning on aws server -- not needed on local server bc mongodb is up to date

mongoClient.on("connectionClosed", () => console.log("DB CONNECTION CLOSED"));
mongoClient.on("connectionCreated", () => console.log("DB CONNECTION CREATED"));
mongoClient.on("close", () => console.log("db connection closed"));
mongoClient.on("open", () => console.log("db connection oppened"));
mongoClient.on("error", (e) => console.log("db error: " + e.message));

/**
 * Inserts the given articles into the database.
 * @param {Array} articles - The array of articles to insert.
 * @param {string} category - The category of the articles.
 * @returns {Promise<void>} A Promise that resolves when the insertion is complete.
 */
const insertData = async (articles, category) => {
    try {
        const database = mongoClient.db("admin");
        const collection = database.collection("articles");

        let index = 0;
        for (const article of articles) {
            // skip if any of the fields are null
            if (article.title === null || article.url === null) {
                console.log(`${index}: Skipping article with null field`);
                index++;
                continue;
            }
            // avoid duplicates
            const found = await collection.findOne({ title: article.title });
            if (found) {
                console.log(`${index}: Article already exists`);
                index++;
                continue;
            }

            // fetch article content using cheerio if filed is null
            if (article.content == null)
                article.content = await fetchArticleContent(article.url);

            // if failed to fetch content, skip article
            if (article.content == null) {
                console.log(`${index}: Skipping article with null content`);
                index++;
                continue;
            }

            // fetch main image using cheerio if field is null
            if (article.urlToImage == null)
                article.urlToImage = await fetchMainImage(article.url);

            // if failed to fetch image, skip article
            if (article.urlToImage === null) {
                console.log(`${index}: Skipping article with null image`);
                index++;
                continue;
            }

            // insert data
            await collection.insertMany([
                {
                    category: category,
                    sourceId: article.source.id,
                    sourceName: article.source.name,
                    author: article.author,
                    title: article.title,
                    description: article.description,
                    url: article.url,
                    urlToImage: article.urlToImage,
                    publishedAt: article.publishedAt,
                    content: article.content,
                },
            ]);
            console.log(`${index}: ${article.title}`);
            index++;
        }
    } catch (error) {
        console.log(error);
    }
};

// collection -----------------------------------------------------

// collects articles from the newsapi and calls insertData to insert them into the database
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

/**
 * Collects articles from the News API for a given category.
 * @param {string} category - The category of articles to collect.
 * @returns {Promise<void>} A Promise that resolves when the articles are collected.
 */
const collectArticles = async (category) => {
    try {
        const response = await newsapi.v2.topHeadlines({
            category: category,
            language: "en",
            sortBy: "relevancy",
            pageSize: 100,
        });

        console.log(`Found ${response.articles.length} articles for ${category}`);
        await insertData(response.articles, category);
        await Wait(250);
    } catch (error) {
        console.log(error);
    }
};

// helpers ----------------------------------------------------

function Wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// main --------------------------------------------------------

// collect articles for each category and stores them in the database
const CATEGORIES = [
    "business",
    "entertainment",
    "general",
    "health",
    "science",
    "sports",
    "technology",
];
async function main() {
    try {
        await mongoClient.connect();
        console.log("DB CONNECTION OPENED");

        for (const category of CATEGORIES) {
            await collectArticles(category);
            console.log();
        }
    } catch (error) {
        console.log(`err on main: ${error.message}`);
    } finally {
        await mongoClient.close();
        console.log("DB CONNECTION CLOSED");
    }
}

main();

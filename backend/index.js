// express -----------------------------------------------------
const ExpressJS = require("express");
const app = ExpressJS();

// cors -----------------------------------------------------
const cors = require("cors");
app.use(cors({ origin: "*" }));

// mongoDB -----------------------------------------------------
const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient(process.env.MONGO_URI, {
  useUnifiedTopology: true,
}); //options object to avoid deprecation warning on aws server -- not needed on local server bc mongodb is up to date

// image processing -----------------------------------------------------
const axios = require("axios");

// convert image URL to base64 encoding
async function urlToBase64(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageData = Buffer.from(response.data, "binary").toString("base64");
    return imageData;
  } catch (error) {
    console.error("Error downloading image:", error);
    return null;
  }
}

// seed generation -----------------------------------------------------
let counter = 0;
const generateSeed = () => {
  const timestamp = new Date().getTime();
  const timestampDigits = timestamp.toString().slice(-3);
  const seed = `${timestampDigits}${counter++}`;
  return seed;
};

// openai -----------------------------------------------------
const OpenAI = require("openai");
const openaiClient = new OpenAI(process.env.OPENAI_API_KEY);

async function generateArticle(data) {
  const completion = await openaiClient.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You will receive a title and content for a news article. Your job is to convert this into a complete “The Onion”-style satirical news article. Your article must be absurd and funny. You can make up fake content. Include at least one social commentary from a relevant source that contributes to the satire. The title must capture the satirical aspect of the article. Respond with json format for the title and content. Limit the content to a maximum of 1000 words.",
      },
      {
        role: "user",
        content: `Title: ${data.title}\nContent: ${data.content}`,
      },
    ],
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
  });

  return completion.choices[0];
}

// server -----------------------------------------------------
const port = process.env.PORT;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on 0.0.0.0:${port}`);
});

// routes -----------------------------------------------------
app.get("/article", async (req, res) => {
  try {
    await mongoClient.connect();

    const { category } = req.query;
    if (!category) throw new Error("Category is required");
    if (
      category !== "business" &&
      category !== "entertainment" &&
      category !== "general" &&
      category !== "health" &&
      category !== "science" &&
      category !== "sports" &&
      category !== "technology"
    )
      throw new Error("Invalid category");

    const articles = mongoClient.db("admin").collection("articles");
    const response = await articles
      .find({ category: category })
      .sort({ publishedAt: -1 })
      .limit(300)
      .toArray();

    if (response.length === 0)
      throw new Error(`No articles found with category ${category}`);

    console.log(`Found ${response.length} articles with category: ${category}`);
    const index = Math.floor(Math.random() * response.length);
    const data = response[index]; // random article from db in category
    const article = await generateArticle(data);
    const articleData = JSON.parse(article.message.content);
    articleData.urlToImage = await urlToBase64(data.urlToImage);
    articleData.publishedAt = new Date(data.publishedAt);

    const seed = generateSeed();
    articleData.seed = seed;

    // insert generated article into seeds collection
    await mongoClient.db("admin").collection("seeds").insertOne(articleData);

    res.status(200).json({ response: articleData });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    await mongoClient.close();
  }
});

app.get("/generated", async (req, res) => {
  try {
    await mongoClient.connect();

    const { seed } = req.query;
    if (!seed) throw new Error("Seed is required");

    const seeds = mongoClient.db("admin").collection("seeds");
    const response = await seeds.findOne({ seed: seed });

    if (!response) throw new Error("Seed not found");

    res.status(200).json({ response: response });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    await mongoClient.close();
  }
});

app.get("/gallery", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const maxArticles = 120;

  const skip = (page - 1) * limit;

  try {
    await mongoClient.connect();

    const articles = await mongoClient
      .db("admin")
      .collection("seeds")
      .find({ publishedAt: { $exists: true } })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    if (articles.length === 0) throw new Error("No articles found");
    const totalArticles = await mongoClient
      .db("admin")
      .collection("seeds")
      .countDocuments({ publishedAt: { $exists: true } });

    res.json({
      articles,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalArticles / limit),
        totalArticles,
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ message: "Error fetching articles" });
  } finally {
    await mongoClient.close();
  }
});

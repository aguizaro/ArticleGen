import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

const Home = () => {
  return (
    <Container className="mt-5">
      <Row className="text-center">
        <Col>
          <h1>📰 Satirical News Generator 🎭</h1>
          <p className="lead">
            A creative tool that turns real-world news into witty, AI-generated
            satire.
          </p>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8} className="mx-auto">
          <h3>How It Works</h3>
          <ul>
            <li>
              <strong>🌍 Select a Category:</strong> Choose a news category to
              generate an article from real-world events.
            </li>
            <li>
              <strong>📝 AI-Powered Satire:</strong> OpenAI rewrites the article
              with a humorous twist, including a witty title and a fake quote.
            </li>
            <li>
              <strong>📸 Share with Ease:</strong> Download the article as an
              image for effortless sharing.
            </li>
          </ul>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={8} className="mx-auto">
          <h3>Under the Hood</h3>
          <ul>
            <li>
              <strong>🚀 Full-Stack JavaScript:</strong> Built with Node.js,
              Express.js, and React.
            </li>
            <li>
              <strong>📡 Automated News Fetching:</strong> NewsAPI feeds
              articles into a MongoDB database nightly.
            </li>
            <li>
              <strong>🔀 Containerized & Deployed:</strong> Hosted on an AWS
              Lightsail VPS with Docker and Traefik.
            </li>
            <li>
              <strong>📡 RESTful API:</strong> Delivers structured JSON
              responses, including a base64-encoded image.
            </li>
          </ul>
        </Col>
      </Row>

      <Row className="text-center mt-4">
        <Col>
          <Button variant="primary" size="lg" href="/demo">
            Start generating articles 🚀
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;

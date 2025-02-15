import { useState } from "react";
import "./header.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import "../../utils/theme-color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleHalfStroke } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "auto");

    const handleThemeChange = (selectedTheme) => {
        //set theme to device default
        if (selectedTheme === "auto") {
            document
                .getElementsByTagName("html")[0]
                .setAttribute(
                    "data-bs-theme",
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "dark"
                        : "light",
                );
            setTheme(selectedTheme);
            localStorage.setItem("theme", selectedTheme);
            return;
        }

        //set theme to selected theme
        setTheme(selectedTheme);
        document
            .getElementsByTagName("html")[0]
            .setAttribute("data-bs-theme", selectedTheme);
        localStorage.setItem("theme", selectedTheme);
    };

    return (
        <>
            <Navbar expand="lg">
                <Container>
                    <Navbar.Brand href="./">
                        <h1 id="title" className="is-active">
                            ArticleGen
                        </h1>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link href="./" className="link">
                                Home
                            </Nav.Link>
                            <Nav.Link href="./gallery" className="link">
                                Gallery
                            </Nav.Link>
                            <NavDropdown
                                title={<FontAwesomeIcon icon={faCircleHalfStroke} />}
                                className="basic-dropdown"
                                drop={window.innerWidth < 992 ? "end" : "down"}
                            >
                                <NavDropdown.Item
                                    onClick={() => handleThemeChange("light")}
                                    active={theme === "light"}
                                >
                                    Light
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                    onClick={() => handleThemeChange("dark")}
                                    active={theme === "dark"}
                                >
                                    Dark
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                    onClick={() => handleThemeChange("auto")}
                                    active={theme === "auto"}
                                >
                                    Auto
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;

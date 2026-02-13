import React from "react";
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>

        {/* Column 1 */}
        <div style={styles.column}>
          <h2 style={styles.brand}>
            ©2026 <span style={{ color: "#22c55e" }}>GovScheme</span> AI
          </h2>
          <p style={styles.text}>
            Powered by Digital India <br />
            Ministry of Electronics & IT (MeitY) <br />
            Government of India
          </p>
          <button style={styles.button}>Connect on Social Media</button>
        </div>

        {/* Column 2 */}
        <div style={styles.column}>
          <h3 style={styles.heading}>Quick Links</h3>
          <ul style={styles.list}>
            <li>About Us</li>
            <li>Contact Us</li>
            <li>Accessibility</li>
            <li>FAQs</li>
            <li>Disclaimer</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        {/* Column 3 */}
        <div style={styles.column}>
          <h3 style={styles.heading}>Useful Links</h3>
          <ul style={styles.list}>
            <li>Digital India</li>
            <li>DigiLocker</li>
            <li>UMANG</li>
            <li>India.gov.in</li>
            <li>data.gov.in</li>
          </ul>
        </div>

        {/* Column 4 */}
        <div style={styles.column}>
          <h3 style={styles.heading}>Get in Touch</h3>
          <p style={styles.text}>
            4th Floor, Electronics Niketan <br />
            CGO Complex, Lodhi Road <br />
            New Delhi – 110003, India
          </p>
          <p style={styles.text}>
            support@govschemeai.in <br />
            (011) 24303714
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottom}>
        🏛️ GovScheme AI — Made with{" "}
        <FaHeart style={{ color: "#ef4444", verticalAlign: "middle" }} />{" "}
        for every Indian citizen
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: "#0f172a",
    color: "white",
    padding: "50px 20px 20px",
    marginTop: "auto",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "40px",
  },
  column: {},
  brand: {
    fontSize: "18px",
    marginBottom: "15px",
  },
  heading: {
    fontSize: "16px",
    marginBottom: "15px",
    fontWeight: "600",
  },
  list: {
    listStyle: "none",
    padding: 0,
    lineHeight: "28px",
    color: "rgba(255,255,255,0.7)",
  },
  text: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: "22px",
  },
  button: {
    marginTop: "15px",
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },
  bottom: {
    marginTop: "40px",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    textAlign: "center",
    fontSize: "14px",
    color: "rgba(255,255,255,0.7)",
  },
};

export default Footer;

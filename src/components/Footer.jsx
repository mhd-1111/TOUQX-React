import TextType from './TextType';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <TextType
          text={[
            "This web is under development",
            "Thank you for trying our product",
            "More features coming soon! Stay tuned",
            "— Team touqX"
          ]}
          typingSpeed={60}
          deletingSpeed={25}
          pauseDuration={1800}
          showCursor={true}
          cursorCharacter="|"
          cursorBlinkDuration={0.5}
          loop={true}
          className="footer-text"
          cursorClassName="footer-cursor"
        />
      </div>
    </footer>
  );
};

export default Footer;

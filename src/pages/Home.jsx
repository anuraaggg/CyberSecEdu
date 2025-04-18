import { useState } from 'react';
import '../styles/home.css';

const Home = () => {
  const [activeResource, setActiveResource] = useState(null);

  const resources = [
    {
      id: 1,
      title: 'OWASP Top 10',
      description: 'Learn about the most critical web application security risks.',
      link: 'https://owasp.org/www-project-top-ten/',
      category: 'Web Security'
    },
    {
      id: 2,
      title: 'NIST Cybersecurity Framework',
      description: 'Understand the gold standard for security guidelines.',
      link: 'https://www.nist.gov/cyberframework',
      category: 'Standards'
    },
    {
      id: 3,
      title: 'HaveIBeenPwned',
      description: 'Check if your data has been compromised in a breach.',
      link: 'https://haveibeenpwned.com/',
      category: 'Privacy'
    }
  ];

  return (
    <div className="home-container">
      <section className="hero">
        <h1>Welcome to CyberSec Edu</h1>
        <p className="subtitle">
          Your interactive platform for learning cybersecurity fundamentals
        </p>
        <div className="cta-buttons">
          <a href="/learn" className="button primary">
            Start Learning
          </a>
          <a href="/games" className="button secondary">
            Play Games
          </a>
        </div>
      </section>

      <section className="key-topics">
        <h2>Essential Cybersecurity Topics</h2>
        <div className="topic-grid">
          <a 
            href="https://www.cisco.com/c/en/us/products/security/what-is-network-security.html" 
            className="topic-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Network Security</h3>
            <ul>
              <li>Firewall Configuration</li>
              <li>VPN Implementation</li>
              <li>Network Monitoring</li>
              <li>Intrusion Detection</li>
            </ul>
          </a>
          <a 
            href="https://owasp.org/www-project-top-ten/" 
            className="topic-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Application Security</h3>
            <ul>
              <li>Secure Coding Practices</li>
              <li>Input Validation</li>
              <li>Authentication & Authorization</li>
              <li>API Security</li>
            </ul>
          </a>
          <a 
            href="https://www.nist.gov/privacy-framework/privacy-framework" 
            className="topic-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Data Protection</h3>
            <ul>
              <li>Encryption Methods</li>
              <li>Data Classification</li>
              <li>Backup Strategies</li>
              <li>Privacy Compliance</li>
            </ul>
          </a>
          <a 
            href="https://www.sans.org/cybersecurity-knowledge-base/" 
            className="topic-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h3>Security Operations</h3>
            <ul>
              <li>Incident Response</li>
              <li>Security Monitoring</li>
              <li>Threat Intelligence</li>
              <li>Vulnerability Management</li>
            </ul>
          </a>
        </div>
      </section>

      <section className="features">
        <h2>Platform Features</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Interactive Learning</h3>
            <p>Explore comprehensive cybersecurity topics through hands-on exercises and real-world examples.</p>
            <a href="/learn" className="learn-more">Start Learning →</a>
          </div>
          <div className="feature-card">
            <h3>Security Games</h3>
            <p>Test your knowledge with interactive cybersecurity games designed to reinforce key concepts.</p>
            <a href="/games" className="learn-more">Play Games →</a>
          </div>
          <div className="feature-card">
            <h3>Live Chat</h3>
            <p>Connect with other security enthusiasts and share knowledge in our global chat room.</p>
            <a href="/chat" className="learn-more">Join Chat →</a>
          </div>
        </div>
      </section>

      <section className="resources">
        <h2>Recommended Resources</h2>
        <div className="resources-grid">
          {resources.map((resource) => (
            <div 
              key={resource.id} 
              className="resource-card"
              onMouseEnter={() => setActiveResource(resource.id)}
              onMouseLeave={() => setActiveResource(null)}
            >
              <span className="resource-category">{resource.category}</span>
              <h3>{resource.title}</h3>
              <p>{resource.description}</p>
              <a 
                href={resource.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`resource-link ${activeResource === resource.id ? 'active' : ''}`}
              >
                Visit Resource →
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="security-tips">
        <h2>Quick Security Tips</h2>
        <div className="tips-container">
          <div className="tip">
            <h3>Use Strong Passwords</h3>
            <p>Create unique, complex passwords for each account and consider using a password manager.</p>
          </div>
          <div className="tip">
            <h3>Enable 2FA</h3>
            <p>Add an extra layer of security by enabling two-factor authentication on your accounts.</p>
          </div>
          <div className="tip">
            <h3>Keep Software Updated</h3>
            <p>Regularly update your operating system and applications to patch security vulnerabilities.</p>
          </div>
          <div className="tip">
            <h3>Backup Your Data</h3>
            <p>Maintain regular backups of important data following the 3-2-1 backup rule.</p>
          </div>
        </div>
      </section>

      <section className="get-started">
        <h2>Ready to Begin?</h2>
        <p>Start your cybersecurity journey today with our structured learning paths.</p>
        <div className="cta-buttons">
          <a href="/learn" className="button primary">
            Explore Courses
          </a>
          <a href="/chat" className="button secondary">
            Join Community
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home; 
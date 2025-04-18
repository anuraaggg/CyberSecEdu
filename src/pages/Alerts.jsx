import { useState, useEffect, useRef } from 'react';
import '../styles/alerts.css';

const Alerts = () => {
  const [currentAlert, setCurrentAlert] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState('next');
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const intervalRef = useRef(null);

  const alerts = [
    {
      title: "Password Security Alert",
      message: "Using the same password across multiple accounts puts all your accounts at risk. Use a unique password for each account and consider using a password manager.",
      type: "warning",
      icon: "🔑",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/use-strong-passwords"
    },
    {
      title: "Two-Factor Authentication",
      message: "Two-factor authentication adds an extra layer of security to your accounts. Enable it wherever possible to protect against unauthorized access.",
      type: "info",
      icon: "🔐",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/use-strong-passwords"
    },
    {
      title: "System Update Available",
      message: "Keep your operating system and applications up to date to protect against known vulnerabilities. Regular updates help maintain system security.",
      type: "success",
      icon: "🔄",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/update-software"
    },
    {
      title: "Phishing Alert",
      message: "Be cautious of emails or messages asking for personal information. Verify the sender's identity and never click on suspicious links.",
      type: "danger",
      icon: "⚠️",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/think-before-clicking"
    },
    {
      title: "Data Backup Reminder",
      message: "Regular backups protect your data from ransomware and hardware failures. Follow the 3-2-1 backup rule: 3 copies, 2 different media, 1 offsite.",
      type: "info",
      icon: "💾",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/backup-data"
    },
    {
      title: "Public Wi-Fi Warning",
      message: "When using public Wi-Fi, always use a VPN to encrypt your traffic. Avoid accessing sensitive information on public networks.",
      type: "warning",
      icon: "📶",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/use-strong-passwords"
    },
    {
      title: "Social Engineering Alert",
      message: "Be aware of social engineering tactics. Verify unusual requests, even if they appear to come from known contacts.",
      type: "danger",
      icon: "🎭",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/think-before-clicking"
    },
    {
      title: "Security Software Update",
      message: "Your antivirus and security tools need regular updates to protect against new threats. Keep them current for optimal protection.",
      type: "success",
      icon: "🛡️",
      learnMoreUrl: "https://www.cisa.gov/secure-our-world/update-software"
    }
  ];

  const startAutoRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        handleAlertChange(direction === 'next' ? 'next' : 'prev');
      }
    }, 5000);
  };

  useEffect(() => {
    startAutoRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, direction]);

  const handleAlertChange = (action) => {
    setIsVisible(false);
    setTimeout(() => {
      if (action === 'next') {
        setCurrentAlert((prev) => {
          let next = (prev + 1) % alerts.length;
          while (dismissedAlerts.includes(next)) {
            next = (next + 1) % alerts.length;
          }
          return next;
        });
      } else if (action === 'prev') {
        setCurrentAlert((prev) => {
          let next = (prev - 1 + alerts.length) % alerts.length;
          while (dismissedAlerts.includes(next)) {
            next = (next - 1 + alerts.length) % alerts.length;
          }
          return next;
        });
      } else if (typeof action === 'number') {
        setCurrentAlert(action);
      }
      setIsVisible(true);
    }, 300);
  };

  const handleDismiss = () => {
    setDismissedAlerts(prev => [...prev, currentAlert]);
    handleAlertChange('next');
  };

  const handleLearnMore = () => {
    window.open(alerts[currentAlert].learnMoreUrl, '_blank');
  };

  const getAlertClass = (type) => {
    switch (type) {
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      case 'danger':
        return 'alert-danger';
      default:
        return 'alert-info';
    }
  };

  return (
    <div className="alerts-container">
      <h1>Security Alerts Center</h1>
      <p className="alerts-description">
        Stay informed about the latest security threats and best practices
      </p>
      
      <div className="alerts-content">
        <button 
          className="nav-button prev"
          onClick={() => {
            setDirection('prev');
            handleAlertChange('prev');
          }}
          aria-label="Previous alert"
        >
          ‹
        </button>

        <div 
          className={`alert-card ${getAlertClass(alerts[currentAlert].type)} ${isVisible ? 'visible' : 'hidden'}`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="alert-icon">{alerts[currentAlert].icon}</div>
          <div className="alert-content">
            <h2>{alerts[currentAlert].title}</h2>
            <p>{alerts[currentAlert].message}</p>
          </div>
          <div className="alert-actions">
            <button 
              className="alert-action-btn"
              onClick={handleLearnMore}
            >
              Learn More
            </button>
            <button 
              className="alert-action-btn dismiss"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>

        <button 
          className="nav-button next"
          onClick={() => {
            setDirection('next');
            handleAlertChange('next');
          }}
          aria-label="Next alert"
        >
          ›
        </button>
      </div>

      <div className="alert-controls">
        <div className="alert-indicators">
          {alerts.map((_, index) => (
            !dismissedAlerts.includes(index) && (
              <button
                key={index}
                className={`indicator ${currentAlert === index ? 'active' : ''}`}
                onClick={() => handleAlertChange(index)}
                aria-label={`Go to alert ${index + 1}`}
              />
            )
          ))}
        </div>
        <button 
          className={`pause-button ${isPaused ? 'paused' : ''}`}
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? 'Resume alerts' : 'Pause alerts'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
      </div>

      <div className="alerts-progress">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${((currentAlert + 1) / alerts.length) * 100}%`,
            backgroundColor: getProgressColor(alerts[currentAlert].type)
          }} 
        />
      </div>
    </div>
  );
};

const getProgressColor = (type) => {
  switch (type) {
    case 'warning':
      return 'var(--warning-color)';
    case 'info':
      return 'var(--primary-color)';
    case 'success':
      return 'var(--success-color)';
    case 'danger':
      return 'var(--danger-color)';
    default:
      return 'var(--primary-color)';
  }
};

export default Alerts; 
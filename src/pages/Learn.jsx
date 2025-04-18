import { useState, useEffect } from 'react';
import '../styles/learn.css';

const Learn = () => {
  const [activeTab, setActiveTab] = useState('fundamentals');
  const [completedTopics, setCompletedTopics] = useState(() => {
    const saved = localStorage.getItem('completedTopics');
    return saved ? JSON.parse(saved) : [];
  });

  // Add IDs to topics for tracking
  const topics = {
    fundamentals: {
      title: 'Cybersecurity Fundamentals',
      content: [
        {
          id: 'intro_cyber',
          title: 'Introduction to Cybersecurity',
          description: 'Understanding the core concepts of cybersecurity and its importance in the digital age.',
          subtopics: [
            'Definition and scope of cybersecurity',
            'Evolution of cyber threats',
            'Impact on individuals and organizations',
            'Career paths in cybersecurity'
          ]
        },
        {
          id: 'cia_triad',
          title: 'CIA Triad',
          description: 'The three fundamental principles of information security: Confidentiality, Integrity, and Availability.',
          subtopics: [
            'Confidentiality: Protecting sensitive information',
            'Integrity: Ensuring data accuracy and trustworthiness',
            'Availability: Maintaining system accessibility',
            'Balancing security and usability'
          ]
        },
        {
          id: 'risk_mgmt',
          title: 'Risk Management',
          description: 'Identifying, assessing, and mitigating security risks in information systems.',
          subtopics: [
            'Risk assessment methodologies',
            'Threat modeling and analysis',
            'Security controls and countermeasures',
            'Continuous monitoring and improvement'
          ]
        }
      ]
    },
    threats: {
      title: 'Cyber Threats & Attacks',
      content: [
        {
          id: 'social_eng',
          title: 'Social Engineering',
          description: 'Understanding and defending against human-based attacks and manipulation techniques.',
          subtopics: [
            'Phishing and spear-phishing attacks',
            'Pretexting and baiting',
            'Social engineering prevention',
            'Employee security awareness'
          ]
        },
        {
          id: 'malware',
          title: 'Malware Analysis',
          description: 'Deep dive into various types of malicious software and their behaviors.',
          subtopics: [
            'Viruses and worms',
            'Trojans and backdoors',
            'Ransomware and cryptojacking',
            'Advanced persistent threats (APTs)'
          ]
        },
        {
          id: 'network_attacks',
          title: 'Network Attacks',
          description: 'Common network-based attacks and defense strategies.',
          subtopics: [
            'Man-in-the-middle attacks',
            'DDoS and DoS attacks',
            'DNS poisoning and spoofing',
            'Network security monitoring'
          ]
        }
      ]
    },
    defense: {
      title: 'Defense Strategies',
      content: [
        {
          id: 'security_arch',
          title: 'Security Architecture',
          description: 'Building robust security architectures and implementing defense in depth.',
          subtopics: [
            'Defense in depth strategy',
            'Zero trust architecture',
            'Network segmentation',
            'Security frameworks and standards'
          ]
        },
        {
          id: 'access_ctrl',
          title: 'Access Control',
          description: 'Managing and securing access to systems and resources.',
          subtopics: [
            'Authentication methods',
            'Authorization and privileges',
            'Identity management',
            'Privileged access management'
          ]
        },
        {
          id: 'incident_resp',
          title: 'Incident Response',
          description: 'Preparing for and handling security incidents effectively.',
          subtopics: [
            'Incident response planning',
            'Digital forensics',
            'Breach notification',
            'Recovery and lessons learned'
          ]
        }
      ]
    },
    compliance: {
      title: 'Security Compliance',
      content: [
        {
          id: 'regulations',
          title: 'Regulatory Standards',
          description: 'Understanding key security regulations and compliance requirements.',
          subtopics: [
            'GDPR and data privacy',
            'HIPAA compliance',
            'PCI DSS requirements',
            'SOX compliance'
          ]
        },
        {
          id: 'policies',
          title: 'Security Policies',
          description: 'Developing and implementing effective security policies and procedures.',
          subtopics: [
            'Policy development lifecycle',
            'Security awareness training',
            'Acceptable use policies',
            'Incident response procedures'
          ]
        },
        {
          id: 'auditing',
          title: 'Auditing & Assessment',
          description: 'Methods for evaluating and maintaining security compliance.',
          subtopics: [
            'Security audits',
            'Vulnerability assessments',
            'Penetration testing',
            'Compliance monitoring'
          ]
        }
      ]
    }
  };

  // Save completed topics to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('completedTopics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  // Calculate total topics and progress
  const totalTopics = Object.values(topics).reduce(
    (acc, section) => acc + section.content.length,
    0
  );

  const progress = (completedTopics.length / totalTopics) * 100;

  // Toggle topic completion
  const toggleTopicCompletion = (topicId) => {
    setCompletedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      return [...prev, topicId];
    });
  };

  return (
    <div className="learn-container">
      <div className="learn-header">
        <h1>Cybersecurity Learning Hub</h1>
        <p>Master the essential concepts and practices of modern cybersecurity</p>
      </div>
      
      <div className="tabs">
        {Object.keys(topics).map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {topics[tab].title}
          </button>
        ))}
      </div>

      <div className="content-section">
        <h2>{topics[activeTab].title}</h2>
        <div className="topic-grid">
          {topics[activeTab].content.map((topic) => (
            <div 
              key={topic.id} 
              className={`topic-card ${completedTopics.includes(topic.id) ? 'completed' : ''}`}
            >
              <div className="topic-header">
                <h3>{topic.title}</h3>
                <button 
                  className={`complete-button ${completedTopics.includes(topic.id) ? 'completed' : ''}`}
                  onClick={() => toggleTopicCompletion(topic.id)}
                >
                  {completedTopics.includes(topic.id) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
              <p>{topic.description}</p>
              <div className="subtopics">
                <h4>Key Concepts:</h4>
                <ul>
                  {topic.subtopics.map((subtopic, idx) => (
                    <li key={idx}>{subtopic}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="progress-section">
        <h3>Your Learning Progress</h3>
        <p>{Math.round(progress)}% Complete ({completedTopics.length} of {totalTopics} topics)</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Learn; 
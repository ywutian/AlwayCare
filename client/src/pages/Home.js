import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaShieldAlt, FaEye, FaBrain, FaUpload, FaChartBar, FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FaEye />,
      title: 'Smart Detection',
      description: 'Advanced AI identifies potential hazards in children\'s environments'
    },
    {
      icon: <FaBrain />,
      title: 'AI Analysis',
      description: 'Computer vision models detect water, fire, sharp objects, and more'
    },
    {
      icon: <FaUpload />,
      title: 'Easy Upload',
      description: 'Simply upload images to get instant safety analysis'
    },
    {
      icon: <FaChartBar />,
      title: 'Risk Assessment',
      description: 'Get detailed risk levels and safety recommendations'
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-text">
              <h1>
                <FaShieldAlt className="hero-icon" />
                AlwayCare
              </h1>
              <h2>Kids Protection AI Companion</h2>
              <p>
                Keep your children safe with our advanced AI-powered hazard detection system. 
                Upload images of your child's environment and get instant safety analysis.
              </p>
              <div className="hero-buttons">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">
                    <FaUpload />
                    Start Uploading
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary">
                      <FaHeart />
                      Get Started
                    </Link>
                    <Link to="/login" className="btn btn-secondary">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-visual">
              <div className="safety-illustration">
                <div className="child-safe">
                  <FaShieldAlt />
                </div>
                <div className="hazard-detection">
                  <div className="hazard water">💧</div>
                  <div className="hazard fire">🔥</div>
                  <div className="hazard sharp">✂️</div>
                  <div className="hazard electrical">⚡</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2>How AlwayCare Protects Your Family</h2>
            <p>Our advanced AI system detects potential hazards and provides safety recommendations</p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2>How It Works</h2>
            <p>Simple steps to keep your children safe</p>
          </motion.div>

          <div className="steps">
            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="step-number">1</div>
              <h3>Upload Image</h3>
              <p>Take a photo of your child's environment and upload it to our secure platform</p>
            </motion.div>

            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="step-number">2</div>
              <h3>AI Analysis</h3>
              <p>Our advanced computer vision AI analyzes the image for potential hazards</p>
            </motion.div>

            <motion.div 
              className="step"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="step-number">3</div>
              <h3>Get Results</h3>
              <p>Receive detailed safety analysis with risk levels and recommendations</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <motion.div 
            className="cta-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2>Ready to Protect Your Family?</h2>
            <p>Join thousands of parents who trust AlwayCare to keep their children safe</p>
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                <FaUpload />
                Start Uploading Images
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                <FaHeart />
                Get Started Free
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;

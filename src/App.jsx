import React, { useState, useEffect } from 'react';
import searchData from './data/searchData.json';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentQuery, setCurrentQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [topicDepth, setTopicDepth] = useState(0);
  const [currentTopic, setCurrentTopic] = useState('');
  const [grandmaMessage, setGrandmaMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Browser state
  const [tabs, setTabs] = useState([{ id: 1, title: 'New Tab', url: '', active: true }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bookmarks, setBookmarks] = useState([
    { name: 'Ammini Home', url: 'ammini://home' },
    { name: 'My Fish Curry Recipe', url: 'ammini://recipes/fish-curry' },
    { name: 'Neighbor Stories', url: 'ammini://stories' },
    { name: 'Malayalam Movies', url: 'ammini://entertainment' }
  ]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('ammini://home');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      // Keep timer running for future use
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper functions defined first to avoid reference errors
  function getRandomElement(array = []) {
    if (!Array.isArray(array) || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
  }

  // Browser helper functions
  const addToHistory = (url) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(history[historyIndex + 1]);
    }
  };

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const addBookmark = () => {
    const newBookmark = {
      name: currentQuery || 'Ammini Page',
      url: currentUrl
    };
    setBookmarks([...bookmarks, newBookmark]);
  };

  const createNewTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { id: newId, title: 'New Tab', url: '', active: false }]);
    setActiveTabId(newId);
  };

  const closeTab = (tabId) => {
    if (tabs.length === 1) return; // Don't close last tab
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  // Welcome animation sequence - simplified
  useEffect(() => {
    if (currentScreen === 'welcome') {
      const welcomeSequence = setTimeout(() => {
        setCurrentScreen('home');
        // Initialize browser state
        setCurrentUrl('ammini://home');
        addToHistory('ammini://home');
        const updatedTabs = tabs.map(tab => 
          tab.id === activeTabId 
            ? { ...tab, title: 'Ammini Browser Home' }
            : tab
        );
        setTabs(updatedTabs);
      }, 3000); // Simple 3 second delay

      return () => clearTimeout(welcomeSequence);
    }
  }, [currentScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 't':
            e.preventDefault();
            createNewTab();
            break;
          case 'w':
            e.preventDefault();
            if (tabs.length > 1) {
              closeTab(activeTabId);
            }
            break;
          case 'r':
            e.preventDefault();
            refresh();
            break;
          case 'l': {
            e.preventDefault();
            // Focus address bar
            const addressBar = document.querySelector('input[placeholder*="Search with Ammini"]');
            if (addressBar) addressBar.focus();
            break;
          }
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId]);

  // Get random intro message
  const getRandomIntro = () => getRandomElement(searchData.grandmaIntros || [
    "Oh dear, let me help you find something... I think I know how this works!"
  ]);

  // Enhanced forgetfulness (30% chance now!)
  const checkForgetfulness = () => {
    if (Math.random() < 0.3) {
      const message = getRandomElement(searchData.grandmaMessages || [
        "Wait, what was I doing again? Something about computers?"
      ]);
      setGrandmaMessage(message);
      setCurrentScreen('home');
      setTopicDepth(0);
      setCurrentTopic('');
      setSearchResults([]);
      return true;
    }
    return false;
  };

  // Enhanced search function that gets more wrong with more results
  const handleSearch = (query) => {
    if (!query?.trim()) return;
    if (checkForgetfulness()) return;

    setIsLoading(true);
    
    // Get topic based on query and depth (enhanced to be more wrong)
    const topicsMap = searchData?.topics || { random: [] };
    const topics = Object.keys(topicsMap);
    
    // Intentionally get wrong results
    const wrongTopic = getRandomElement(topics.length ? topics : ['random']);
    const resultsList = topicsMap[wrongTopic] || topicsMap.random || [];
    
    // Add some completely random results too
    const randomResults = topicsMap.random || [];
    const mixedResults = [...resultsList, ...randomResults];
    
    // Generate additional confusing results
    const additionalResults = [
      {
        title: `${query} - But Actually About Cooking`,
        url: 'ammini://confused/cooking-tips',
        snippet: 'I thought you wanted to know about my famous fish curry recipe. Let me tell you about the secret ingredients...'
      },
      {
        title: `Why ${query} Reminds Me of My Neighbor`,
        url: 'ammini://stories/neighbors',
        snippet: 'You know, this reminds me of when Mrs. Kamala down the street had the same problem. She solved it with coconut oil.'
      },
      {
        title: `${query} - A Malayalam Love Story`,
        url: 'ammini://entertainment/movies',
        snippet: 'There was this old Malayalam movie where the hero also searched for this. Such a romantic story, you should watch it!'
      },
      {
        title: `How to Fix ${query} with Traditional Methods`,
        url: 'ammini://health/ayurveda',
        snippet: 'In the old days, we would solve this with turmeric, ginger, and lots of prayers. Works every time!'
      },
      {
        title: `${query} - Why Young People Don't Understand`,
        url: 'ammini://wisdom/generation-gap',
        snippet: 'These modern gadgets make everything complicated. In my time, we had simpler solutions...'
      }
    ];
    
    const allResults = [...mixedResults, ...additionalResults];
    const shuffled = [...allResults].sort(() => Math.random() - 0.5);
    const selectedResults = shuffled.slice(0, Math.floor(Math.random() * 12) + 18); // 18-29 results

    setTimeout(() => {
      setSearchResults(selectedResults);
      setCurrentTopic(wrongTopic);
      setCurrentQuery(query);
      setTopicDepth(0);
      setCurrentScreen('results');
      setGrandmaMessage('');
      setIsLoading(false);
      
      // Update browser state
      const searchUrl = `ammini://search?q=${encodeURIComponent(query)}`;
      setCurrentUrl(searchUrl);
      addToHistory(searchUrl);
      
      // Update active tab title
      const updatedTabs = tabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, title: `Search: ${query.slice(0, 20)}${query.length > 20 ? '...' : ''}` }
          : tab
      );
      setTabs(updatedTabs);
    }, 1500);
  };

  // Handle clicking search results (gets even more confused)
  const handleResultClick = () => {
    if (checkForgetfulness()) return;

    setIsLoading(true);
    const newDepth = topicDepth + 1;
    
    // Gets more random with each click
    const topicsMap = searchData?.topics || { random: [] };
    const allTopics = Object.keys(topicsMap);
    const randomTopic = getRandomElement(allTopics.length ? allTopics : ['random']);
    const results = topicsMap[randomTopic] || topicsMap.random || [];
    
    const shuffled = [...results].sort(() => Math.random() - 0.5);
    const selectedResults = shuffled.slice(0, Math.floor(Math.random() * 10) + 15);

    setTimeout(() => {
      setSearchResults(selectedResults);
      setCurrentTopic(randomTopic);
      setTopicDepth(newDepth);
      setIsLoading(false);
    }, 2000);
  };

  // Animated Ammini Character with GIF
  const DetailedAmmini = () => (
    <div style={{ 
      width: '240px', 
      height: '280px', 
      margin: '0 auto 30px auto',
      position: 'relative',
      animation: 'gentleFloat 6s ease-in-out infinite'
    }}>
      <style>{`
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          25% { transform: translateY(-3px) scale(1.002); }
          50% { transform: translateY(-6px) scale(1.005); }
          75% { transform: translateY(-3px) scale(1.002); }
        }
        @keyframes bubbleFloat {
          0%, 100% { opacity: 1; transform: scale(1) translateY(0px) rotateZ(0deg); }
          25% { opacity: 0.9; transform: scale(1.02) translateY(-2px) rotateZ(1deg); }
          50% { opacity: 1; transform: scale(1.05) translateY(-1px) rotateZ(0deg); }
          75% { opacity: 0.95; transform: scale(1.01) translateY(-3px) rotateZ(-1deg); }
        }
        @keyframes sparkleRealistic {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          25% { opacity: 0.7; transform: scale(0.8) rotate(90deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
          75% { opacity: 0.8; transform: scale(0.9) rotate(270deg); }
        }
        @keyframes divaFlicker {
          0%, 100% { opacity: 0.8; transform: scale(1) rotateY(0deg); }
          25% { opacity: 1; transform: scale(1.1) rotateY(10deg); }
          50% { opacity: 0.9; transform: scale(1.05) rotateY(0deg); }
          75% { opacity: 1; transform: scale(1.08) rotateY(-10deg); }
        }
      `}</style>
      
      {/* Main Ammini GIF */}
      <img 
        src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeG9yejg0NGpyd244ZG9vazFicjEyMTBseXJtOTcxajNma3cyN3NxZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OamQUpu2KlPxhCIt2h/giphy.gif"
        alt="Ammini Character"
        style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          border: '3px solid #ff6b9d',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          position: 'absolute',
          top: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          objectFit: 'cover'
        }}
      />

      {/* Speech Bubble with Malayalam greeting */}
      <div style={{
        position: 'absolute',
        top: '-25px',
        right: '-85px',
        backgroundColor: '#ffffff',
        padding: '10px 15px',
        borderRadius: '20px',
        border: '2px solid #ff6b9d',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#333',
        whiteSpace: 'nowrap',
        animation: 'bubbleFloat 6s ease-in-out infinite',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        Ippo Sheriyaaki Tharaam
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '20px',
          width: '0',
          height: '0',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid #ff6b9d'
        }} />
      </div>

      {/* Sparkles around Ammini */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        fontSize: '18px',
        animation: 'sparkleRealistic 3s ease-in-out infinite'
      }}>✨</div>
      <div style={{
        position: 'absolute',
        top: '45px',
        right: '15px',
        fontSize: '16px',
        animation: 'sparkleRealistic 3s ease-in-out infinite 1s'
      }}>🌸</div>
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '25px',
        fontSize: '18px',
        animation: 'sparkleRealistic 3s ease-in-out infinite 2s'
      }}>�</div>
      <div style={{
        position: 'absolute',
        bottom: '40px',
        right: '25px',
        fontSize: '14px',
        animation: 'divaFlicker 4s ease-in-out infinite'
      }}>🪔</div>
      
      {/* Additional decorative elements */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '5px',
        fontSize: '14px',
        animation: 'sparkleRealistic 4s ease-in-out infinite 0.5s'
      }}>🌺</div>
      <div style={{
        position: 'absolute',
        top: '120px',
        right: '5px',
        fontSize: '12px',
        animation: 'divaFlicker 5s ease-in-out infinite 1.5s'
      }}>⭐</div>
    </div>
  );

  // Browser Toolbar Component
  const BrowserToolbar = () => (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      borderBottom: '1px solid rgba(255,255,255,0.2)', 
      padding: '8px 12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {/* Navigation buttons */}
      <button
        onClick={goBack}
        disabled={historyIndex <= 0}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
          opacity: historyIndex > 0 ? 1 : 0.5,
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (historyIndex > 0) {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (historyIndex > 0) {
            e.target.style.background = 'rgba(255,255,255,0.1)';
          }
        }}
      >
        ←
      </button>
      <button
        onClick={goForward}
        disabled={historyIndex >= history.length - 1}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed',
          opacity: historyIndex < history.length - 1 ? 1 : 0.5,
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          if (historyIndex < history.length - 1) {
            e.target.style.background = 'rgba(255,255,255,0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (historyIndex < history.length - 1) {
            e.target.style.background = 'rgba(255,255,255,0.1)';
          }
        }}
      >
        →
      </button>
      <button
        onClick={refresh}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: 'white',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        ↻
      </button>

      {/* Address bar */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          flex: 1,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '25px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span style={{ color: '#28a745', fontSize: '14px' }}>🔒</span>
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addToHistory(currentUrl);
                if (currentUrl.includes('search=')) {
                  const query = currentUrl.split('search=')[1];
                  handleSearch(decodeURIComponent(query));
                }
              }
            }}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontSize: '14px',
              background: 'transparent',
              color: '#333'
            }}
            placeholder="Search with Ammini or enter address"
          />
        </div>
      </div>

      {/* Browser actions */}
      <button
        onClick={addBookmark}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
        title="Add to bookmarks"
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        ⭐
      </button>
      <button
        onClick={() => setShowBookmarks(!showBookmarks)}
        style={{
          background: showBookmarks ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: 'white',
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
        title="Bookmarks"
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = showBookmarks ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)';
        }}
      >
        📚
      </button>
      <button
        onClick={createNewTab}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px',
          transition: 'all 0.3s ease'
        }}
        title="New tab"
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }}
      >
        +
      </button>
    </div>
  );

  // Tab Bar Component
  const TabBar = () => (
    <div style={{ 
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)', 
      display: 'flex', 
      borderBottom: '1px solid rgba(255,255,255,0.2)' 
    }}>
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => setActiveTabId(tab.id)}
          style={{
            background: activeTabId === tab.id 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'transparent',
            border: activeTabId === tab.id ? '1px solid rgba(255,255,255,0.3)' : 'none',
            borderBottom: 'none',
            padding: '10px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            maxWidth: '200px',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            color: 'white',
            transition: 'all 0.3s ease',
            boxShadow: activeTabId === tab.id ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (activeTabId !== tab.id) {
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTabId !== tab.id) {
              e.target.style.background = 'transparent';
            }
          }}
        >
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap',
            fontSize: '14px',
            fontWeight: activeTabId === tab.id ? 'bold' : 'normal'
          }}>
            {tab.title}
          </span>
          {tabs.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );

  // Bookmarks Bar Component
  const BookmarksBar = () => showBookmarks ? (
    <div style={{ 
      background: 'linear-gradient(135deg, #5a67d8 0%, #667eea 100%)', 
      borderBottom: '1px solid rgba(255,255,255,0.2)',
      padding: '6px 12px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center'
    }}>
      <span style={{ fontSize: '12px', color: 'white', fontWeight: 'bold', opacity: 0.9 }}>
        📚 Bookmarks:
      </span>
      {bookmarks.map((bookmark, index) => (
        <button
          key={index}
          onClick={() => {
            setCurrentUrl(bookmark.url);
            addToHistory(bookmark.url);
            if (bookmark.url === 'ammini://home') {
              setCurrentScreen('home');
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '15px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '4px 12px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.25)';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.15)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          {bookmark.name}
        </button>
      ))}
    </div>
  ) : null;

  // Home Screen Component
  const HomeScreen = () => {
    const [searchInput, setSearchInput] = useState('');
    const intro = getRandomIntro();

    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ 
              fontSize: '4rem', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              Ammini Browser
            </h1>
            
            <DetailedAmmini />
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: 'white', 
              marginBottom: '30px',
              opacity: 0.9
            }}>
              The browser that finds everything except what you&apos;re looking for!
            </p>
          </div>

          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)', 
              padding: '30px', 
              marginBottom: '30px'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '10px' }}>{intro}</p>
                {grandmaMessage && (
                  <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderLeft: '4px solid #fdcb6e', 
                    padding: '15px', 
                    marginTop: '15px', 
                    borderRadius: '4px'
                  }}>
                    <p style={{ color: '#856404', fontStyle: 'italic', margin: 0 }}>{grandmaMessage}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchInput.trim()) {
                      handleSearch(searchInput);
                    }
                  }}
                  placeholder="What are you looking for, dear?"
                  style={{ 
                    flex: 1, 
                    padding: '15px 20px', 
                    border: '2px solid #e1e5e9', 
                    borderRadius: '25px', 
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    background: '#f8f9fa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  onClick={() => {
                    if (searchInput.trim()) {
                      handleSearch(searchInput);
                    }
                  }}
                  disabled={!searchInput.trim()}
                  style={{ 
                    padding: '15px 30px', 
                    background: searchInput.trim() 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#ccc', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '25px', 
                    cursor: searchInput.trim() ? 'pointer' : 'not-allowed', 
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    opacity: searchInput.trim() ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (searchInput.trim()) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (searchInput.trim()) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  Get Confused! ✨
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: '0.9rem', opacity: 0.8 }}>
                Powered by confusion, love, and complete misunderstanding of technology ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Simple Welcome Animation Component with floating effects
  const WelcomeAnimation = () => {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}>
        <div style={{ 
          textAlign: 'center',
          animation: 'gentleFloat 4s ease-in-out infinite'
        }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold',
            marginBottom: '16px', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            animation: 'fadeIn 1s ease-out, titleGlow 3s ease-in-out infinite alternate' 
          }}>
            Keri Vaada Makkale...
          </h1>
          <p style={{ 
            fontSize: '1.2rem',
            opacity: 0.9, 
            animation: 'fadeIn 1.4s ease-out, pulse 2s ease-in-out infinite' 
          }}>
            Loading Ammini Browser
          </p>
          <div style={{
            marginTop: '30px',
            fontSize: '0.9rem',
            opacity: 0.8,
            animation: 'fadeIn 2s ease-out'
          }}>
            ✨ The browser that finds everything except what you&apos;re looking for! ✨
          </div>
        </div>
        
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes gentleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes titleGlow {
            0% { text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.3); }
            100% { text-shadow: 2px 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(102, 126, 234,0.4); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.9; }
            50% { opacity: 1; }
          }
          .sparkle {
            position: absolute;
            color: #FFD700;
            animation: sparkleFloat 6s ease-in-out infinite;
          }
          @keyframes sparkleFloat {
            0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
            25% { opacity: 1; transform: scale(1.2) rotate(90deg); }
            50% { opacity: 0.8; transform: scale(1.1) rotate(180deg); }
            75% { opacity: 1; transform: scale(1.3) rotate(270deg); }
          }
        `}</style>
        
        {/* Floating sparkles */}
        {[...Array(8)].map((_, i) => (
          <div 
            key={`sparkle-${i}`}
            className="sparkle"
            style={{ 
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              fontSize: `${12 + Math.random() * 8}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 3}s`
            }} 
          >
            {['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>
    );
  };

  // Results Screen Component
  const ResultsScreen = () => {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', background: '#f5f5f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#666' }}>
              About {searchResults.length} results for &quot;{currentQuery}&quot;
              {topicDepth > 0 && (
                <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}> (topic drift level: {topicDepth})</span>
              )}
            </p>
          </div>

          <div>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick()}
                style={{ background: 'white', padding: '16px', margin: '10px 0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              >
                <h3 style={{ color: '#1a0dab', fontSize: '18px', marginBottom: '4px' }}>
                  {result.title}
                </h3>
                <p style={{ color: '#006621', fontSize: '14px', marginBottom: '8px' }}>{result.url}</p>
                <p style={{ color: '#545454', lineHeight: '1.4' }}>{result.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentScreen === 'welcome' ? (
        <WelcomeAnimation />
      ) : (
        <>
          {/* Browser UI */}
          <TabBar />
          <BrowserToolbar />
          <BookmarksBar />
          
          {/* Page Content */}
          {currentScreen === 'home' ? <HomeScreen /> : <ResultsScreen />}
          
          {/* Loading overlay */}
          {isLoading && (
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3498db',
                  borderRadius: '50%',
                  animation: 'spin 2s linear infinite',
                  margin: '0 auto 20px'
                }} />
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                  {getRandomElement([
                    "Loading confusion...",
                    "Searching in the wrong places...",
                    "Finding unrelated content...",
                    "Grandma is thinking...",
                    "Buffering wisdom...",
                    "Connecting to confusion server..."
                  ])}
                </p>
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
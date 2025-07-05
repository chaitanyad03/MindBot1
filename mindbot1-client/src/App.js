import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [theme, setTheme] = useState('light');
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');
  const [modeSelected, setModeSelected] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [breathingTimeLeft, setBreathingTimeLeft] = useState(0);
  const [showBreathing, setShowBreathing] = useState(false);
  const [playlistType, setPlaylistType] = useState(() => localStorage.getItem('playlistType') || 'default');
  const [botTyping, setBotTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  const lightBg = process.env.PUBLIC_URL + '/light-bg.jpeg';
  const darkBg = process.env.PUBLIC_URL + '/dark-bg.jpeg';

  const moodVideoMap = {
    default: 'https://www.youtube.com/embed/2OEL4P1Rz04',
    happy: 'https://www.youtube.com/embed/DWcJFNfaw9c',
    sad: 'https://www.youtube.com/embed/2OEL4P1Rz04',
    angry: 'https://www.youtube.com/embed/kXYiU_JCYtU',
    nervous: 'https://www.youtube.com/embed/1ZYbU82GVz4',
    burnedout: 'https://www.youtube.com/embed/fLexgOxsZu0',
    confused: 'https://www.youtube.com/embed/5qap5aO4i9A'
  };

  const quotes = [
    "You can do it!",
    "I believe in you.",
    "You are stronger than you think.",
    "Keep going, brighter days are ahead.",
    "Take a deep breath. You're doing great.",
    "Everything will be okay.",
    "Your feelings are valid."
  ];

  const jokes = [
    "Why don’t scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "I told my computer I needed a break, and now it won’t stop sending me KitKat ads.",
    "Why did the math book look sad? Because it had too many problems."
  ];

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handlePlaylistChange = (type) => {
    setPlaylistType(type);
    localStorage.setItem('playlistType', type);
    botRespond(`Switched to ${type} mode.`);
  };

  useEffect(() => {
    document.body.className = theme;
    document.body.style.backgroundImage = `url(${theme === 'light' ? lightBg : darkBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }, [theme]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return alert('Speech recognition not supported');
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setMicActive(true);
    recognition.onend = () => setMicActive(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput('');
      handleMessage(transcript);
    };

    recognition.onerror = (event) => console.error('Speech error:', event.error);
    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('chatHistory');
    if (stored) setChatHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const speak = (text) => {
    if (context !== 'office') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  const addToChat = (text, sender) => setChatHistory(prev => [...prev, { text, sender }]);

  const botRespond = (text) => {
    setBotTyping(true);
    setTimeout(() => {
      addToChat(text, 'bot');
      speak(text);
      setBotTyping(false);
    }, 1000);
  };

  const extractSeconds = (text) => {
    const min = text.match(/(\d+)\s*(min|minute)/);
    const sec = text.match(/(\d+)\s*(sec|second)/);
    let total = 0;
    if (min) total += parseInt(min[1]) * 60;
    if (sec) total += parseInt(sec[1]);
    return total;
  };

  const startBreathingTimer = (seconds) => {
    setBreathingTimeLeft(seconds);
    setShowBreathing(true);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setBreathingTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setShowBreathing(false);
          if (audio) audio.pause();
          botRespond('Breathing exercise completed. Hope you feel better!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const logMood = (mood) => {
    let moodLog = JSON.parse(localStorage.getItem('moodLog') || '{}');
    moodLog[mood] = (moodLog[mood] || 0) + 1;
    localStorage.setItem('moodLog', JSON.stringify(moodLog));
  };

  const saveMoodToHistory = (mood) => {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    history.push(mood);
    localStorage.setItem('moodHistory', JSON.stringify(history));
  };

  const checkMoodTrends = () => {
    let history = JSON.parse(localStorage.getItem('moodHistory')) || [];
    if (history.length >= 3) {
      const moodCounts = history.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
      const topMood = Object.keys(moodCounts).reduce((a, b) =>
        moodCounts[a] > moodCounts[b] ? a : b
      );
      if (moodCounts[topMood] >= 3) {
        return `I've noticed you've often felt ${topMood}. Would you like to meditate or listen to music?`;
      }
    }
    return null;
  };

  const handleMessage = (text) => {
    console.log('handleMessage received:', text);

    const lower = text.toLowerCase();

    if (!modeSelected) {
      if (lower.includes('home')) {
        setContext('home');
        setModeSelected(true);
        setTimeout(() => {
          botRespond('Home mode enabled! You can now speak or type.');
        }, 100);
      } else if (lower.includes('office')) {
        setContext('office');
        setModeSelected(true);
        setTimeout(() => {
          botRespond('Office mode activated. Mic is disabled and bot will remain silent.');
        }, 100);
      }
      
    }

    addToChat(text, 'user');
fetch('http://localhost:5000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message: text, emotion: "", context })
})
  .then(res => res.json())
  .then(data => {
    if (data && data.response) {
      botRespond(data.response); 
    }
  })
  .catch(err => {
    console.error('Flask fetch error:', err);
  });

    if (lower.includes('music')) {
      botRespond('You mentioned music. Please click the 🎵 icon on the top right to play it!');
    } else if (lower.includes('breathe') || lower.includes('meditate')) {
      const seconds = extractSeconds(lower);
      if (seconds > 0) {
        botRespond(`Starting breathing exercise for ${seconds} seconds.`);
        startBreathingTimer(seconds);
      } else {
        botRespond('Please specify how long you want to breathe (e.g., "2 minutes").');
      }
    } else if (lower.includes('quote')) {
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      botRespond(`Here's a calming quote: "${quote}"`);
      setTimeout(() => {
        botRespond("Did it make you feel calm? If not, say 'quote' again for another one. 🧘‍♀️");
      }, 1200);
    } else if (lower.includes('joke')) {
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      botRespond(joke);
      setTimeout(() => {
        botRespond("Did that make you smile? If not, say 'joke' again for another one! 😊");
      }, 1200);
    } else if (lower.includes('youtube') || lower.includes('video')) {
      botRespond('Play the video below and take a few deep breaths...');
      addToChat(`▶️ [Watch calming video](https://www.youtube.com/watch?v=2OEL4P1Rz04)`, 'bot');
    } else {
      let reply = `You said "${text}". `;
      if (lower.includes('happy')) {
        logMood('happy');
        saveMoodToHistory('happy');
        reply += 'Would you like to listen to music? 🎶';
        setPlaylistType('happy');
      } else if (lower.includes('sad')) {
        logMood('sad');
        saveMoodToHistory('sad');
        reply += 'I’m here for you. Maybe try a relaxing meditation below. 🌈';
        setPlaylistType('sad');
      } else if (lower.includes('angry')) {
        logMood('angry');
        saveMoodToHistory('angry');
        reply += 'Take a few deep breaths. Want to start a 2-minute breathing session? 🧘‍♂️';
        setPlaylistType('angry');
      } else if (lower.includes('nervous') || lower.includes('anxious')) {
        logMood('nervous');
        saveMoodToHistory('nervous');
        reply += 'You’re not alone. Try calming music or a short breathing break. ✨';
        setPlaylistType('nervous');
      } else if (lower.includes('burned out') || lower.includes('tired')) {
        logMood('burnedout');
        saveMoodToHistory('burnedout');
        reply += 'Take a pause. How about a motivational quote or meditation video? 💪';
        setPlaylistType('burnedout');
      } else if (lower.includes('confused')) {
        logMood('confused');
        saveMoodToHistory('confused');
        reply += 'Let’s slow down. Try a short breathing exercise or nature sounds. 🌿';
        setPlaylistType('confused');
      } else {
        reply += 'Thanks for sharing that.';
      }
      botRespond(reply);

      const trendMessage = checkMoodTrends();
      if (trendMessage) {
        botRespond(trendMessage);
      }
    }
  };

  const handleMicClick = () => {
    if (!modeSelected) {
      botRespond("Please type or say 'home' or 'office' first.");
      return;
    }
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          if (e.name !== 'InvalidStateError') console.error(e);
        }
      }, 300);
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      handleMessage(input);
      setInput('');
    }
  };

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      setIsMusicPlaying(true);
    } else {
      audio.pause();
      setIsMusicPlaying(false);
    }
  };

  const refreshChat = () => {
    localStorage.removeItem('chatHistory');
    window.location.reload();
  };

  const downloadChat = () => {
    const content = chatHistory.map(m => `${m.sender === 'user' ? 'You' : 'MindBot'}: ${m.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mindbot-chat.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <div className="logo-container">
          <img src={`${process.env.PUBLIC_URL}/logo1.png`} alt="MindBot Logo" className="logo larger-logo" />
          <span className="brand-text larger-text">MindBot</span>
        </div>
        <div className="theme-toggle">
          <button onClick={refreshChat} className="refresh-button">🔄</button>
          <span className="music-toggle" onClick={toggleMusic}>{isMusicPlaying ? '🔊' : '🎵'}</span>
          <span>🌞</span>
          <label className="switch">
            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
          <span>🌙</span>
        </div>
      </header>

      <div className="main-content">
        <h1 className="prompt">{!modeSelected ? 'Are you at home or office?' : 'How are you feeling today?'}</h1>
        <div className="input-box">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={modeSelected ? 'Say how you feel...' : 'Type or say: home / office'}
          />
          {context === 'home' &&
            <button onClick={handleMicClick} className={`mic-button ${micActive ? 'active' : ''}`}>
              🎤
            </button>}
          <button onClick={handleSend}>Send</button>
          <button onClick={downloadChat}>📥 Export</button>
        </div>

        <div className="chat-box">
          <div className="chat-history">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
            ))}
            {botTyping && <div className="chat-bubble bot">Thinking...</div>}
          </div>
        </div>

        {showBreathing && (
          <div className="breathing-box">
            <div className="circle" />
            <p className="timer-text">{formatTime(breathingTimeLeft)}</p>
          </div>
        )}
      </div>

      <div className="dashboard-video">
        <div className="mode-buttons">
          {['default', 'focus', 'nature', 'binaural'].map(mode => (
            <button
              key={mode}
              className={`mode-button ${playlistType === mode ? 'active' : ''}`}
              onClick={() => handlePlaylistChange(mode)}
            >
              {mode === 'default' ? 'Relaxing' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        <iframe
          width="350"
          height="200"
          src={`${moodVideoMap[playlistType] || moodVideoMap.default}?autoplay=0`}
          title="Dashboard Meditation"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-video"
        ></iframe>
      </div>

      <audio ref={audioRef} src="calm-music.mp3" loop />
    </div>
  );
};

export default App;

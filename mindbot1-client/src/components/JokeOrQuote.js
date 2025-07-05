import React, { useEffect, useState } from 'react';

const JokeOrQuote = () => {
  const [joke, setJoke] = useState('');

  useEffect(() => {
    fetch('https://official-joke-api.appspot.com/random_joke')
      .then((res) => res.json())
      .then((data) => setJoke(`${data.setup} - ${data.punchline}`))
      .catch(() => setJoke('Feeling better is a joke away! 😄'));
  }, []);

  return (
    <div className="joke-box">
      <h3>😊 Here's something fun for you:</h3>
      <p>{joke}</p>
    </div>
  );
};

export default JokeOrQuote;

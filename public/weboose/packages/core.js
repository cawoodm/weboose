(function() {
  let h1;
  return {
    async init() {
      // Initialize UI and basics
      console.log('EXAMPLE Core initialized');
      h1 = document.createElement('H1');
      h1.innerText = 'Hello from the core package!';
    },
    async start() {
      // Initialize Extensions
      console.log('EXAMPLE Core started');
      document.body.appendChild(h1);
    },
  };
})();

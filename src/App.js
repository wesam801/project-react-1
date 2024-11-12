import logo from "./logo.svg";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div className="text-center p-4 bg-red-300">
          <h1 className="text-3xl font-bold underline">
            Hello, Tailwind in React!
          </h1>
        </div>
      </header>
    </div>
  );
}

export default App;

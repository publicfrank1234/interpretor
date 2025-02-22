import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { store } from "./store/store";
import TranslationPage from "./pages/TranslationPage";
import SummaryPage from "./pages/SummaryPage";
import SetupPage from "./pages/SetupPage";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <nav>
          <ul>
            <li>
              <Link to="/">Setup</Link>
            </li>
            <li>
              <Link to="/translation">Translation</Link>
            </li>
            <li>
              <Link to="/summary">Summary</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/translation" element={<TranslationPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/" element={<SetupPage />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;

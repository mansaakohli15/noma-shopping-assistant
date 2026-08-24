import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/navigation/AppShell';
import { ShoppingListProvider } from './lib/ShoppingListProvider';
import { LanguageProvider } from './lib/LanguageProvider';
import { HomePage } from './pages/HomePage';
import { ListPage } from './pages/ListPage';
import { SearchPage } from './pages/SearchPage';
import { InsightsPage } from './pages/InsightsPage';

function App() {
  return (
    <LanguageProvider>
      <ShoppingListProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/list" element={<ListPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/insights" element={<InsightsPage />} />
          </Routes>
        </AppShell>
      </ShoppingListProvider>
    </LanguageProvider>
  );
}

export default App;

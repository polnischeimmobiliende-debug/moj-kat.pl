import { Layout } from './components/Layout';
import { Route } from './components/Router';

import { SearchPage } from './pages/SearchPage';
import { PropertyPage } from './pages/PropertyPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddPropertyPage } from './pages/AddPropertyPage';

import { AuthProvider } from './hooks/useAuth';

export default function App() {
return ( <AuthProvider> <Layout>
<Route pattern="/" component={() => <SearchPage />} />

```
    <Route
      pattern="/property/:id/:slug"
      component={({ id }) => <PropertyPage id={id} />}
    />

    <Route pattern="/login" component={() => <LoginPage />} />
    <Route pattern="/register" component={() => <RegisterPage />} />

    <Route pattern="/dashboard" component={() => <DashboardPage />} />

    <Route pattern="/add" component={() => <AddPropertyPage />} />
  </Layout>
</AuthProvider>
```

);
}

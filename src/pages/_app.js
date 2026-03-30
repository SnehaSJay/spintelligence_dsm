import "@/styles/globals.css";
import "@/views/carding/betweenWithinCardEntry.css";
import { Provider } from 'react-redux';
import { store } from '../store';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

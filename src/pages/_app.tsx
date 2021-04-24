import '../styles/global.scss'

import { Header } from '../components/Header/Header';
import { Player } from '../components/Player/Player';
import PlayerProvider from '../contexts/PlayerContext';

import styles from '../styles/app.module.scss';

const MyApp = ({ Component, pageProps }) => {
  return (
    <PlayerProvider>
      <div className={styles.wrapper}>
        <main>
          <Header />
          <Component {...pageProps} />
        </main>

        <Player />
      </div>
    </PlayerProvider>
  );
}

export default MyApp

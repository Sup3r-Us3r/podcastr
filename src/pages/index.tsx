import { GetServerSideProps, GetStaticProps } from "next";
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '../services/api';
import { usePlayer } from "../contexts/PlayerContext";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from '../styles/home.module.scss';

type IEpisode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type IHomeProps = {
  latestEpisodes: IEpisode[];
  allEpisodes: IEpisode[];
};

const Home = ({ latestEpisodes, allEpisodes }: IHomeProps) => {
  const {
    playList,
    episodeList: currentEpisode,
    currentEpisodeIndex,
  } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];
  const episodePlaying = currentEpisode[currentEpisodeIndex];

  return (
    <>
      <Head>
        <title>{!episodePlaying ? 'Podcastr' : episodePlaying.title}</title>
      </Head>

      <div className={styles.homepage}>
        <section className={styles.latestEpisodes}>
          <h2>Útimos lançamentos</h2>

          <ul>
            {latestEpisodes.map((episode, index) => (
              <li key={episode.id}>
                <Image
                  height={192}
                  width={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button
                  type="button"
                  onClick={() => playList(episodeList, index)}
                >
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map((episode, index) => (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      height={120}
                      width={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 120 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => playList(episodeList, index + latestEpisodes.length)}
                    >
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}

// export const getServerSideProps: GetServerSideProps = async () => {
export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('/episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  const episodes: IEpisode[] = response.data.map((episode) => ({
    id: episode.id,
    title: episode.title,
    members: episode.members,
    publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    thumbnail: episode.thumbnail,
    duration: Number(episode.file.duration),
    durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
    url: episode.file.url,
  }));

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, // 60s * 60 = 1h * 8 -> A cada 8h
  };
}

export default Home;

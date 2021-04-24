import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import api from '../../services/api';
import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';

type IEpisode = {
  id: string;
  title: string;
  members: string;
  publishedAt: string;
  thumbnail: string;
  description: string;
  duration: number;
  durationAsString: string;
  url: string;
}

type IEpisodeProps = {
  episode: IEpisode;
}

const Episodes = ({ episode }: IEpisodeProps) => {
  const { play, episodeList, currentEpisodeIndex } = usePlayer();

  const episodePlaying = episodeList[currentEpisodeIndex];

  return (
    <>
      <Head>
        <title>{!episodePlaying ? 'Podcastr' : episodePlaying.title}</title>
      </Head>

      <div className={styles.episode}>
        <div className={styles.thumbnailContainer}>
          <Link href="/">
            <button type="button">
              <img src="/arrow-left.svg" alt="Voltar" />
            </button>
          </Link>
          <Image
            height={160}
            width={700}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <button type="button" onClick={() => play(episode)}>
            <img src="/play.svg" alt="Tocar episódio" />
          </button>
        </div>

        <header>
          <h1>{episode.title}</h1>
          <span>{episode.members}</span>
          <span>{episode.publishedAt}</span>
          <span>{episode.durationAsString}</span>
        </header>

        <div
          className={styles.description}
          dangerouslySetInnerHTML={{ __html: episode.description }}
        />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('/episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc',
    },
  });

  const paths = data.map((episode) => ({
    params: {
      slug: episode.id,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { data } = await api.get(`/episodes/${params.slug}`);

  const episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    thumbnail: data.thumbnail,
    description: data.description,
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    url: data.file.url,
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
}

export default Episodes;

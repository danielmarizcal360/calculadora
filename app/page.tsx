import styles from './page.module.css';
import Calculator from '@/components/Calculator/Calculator';

export default function Home() {
  return (
    <main className={styles.page}>
      <Calculator />
    </main>
  );
}

import Image from "next/image";
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.outer_container}>
      <div className={styles.left_container}>
        <div className={styles.hero}>
          <h1 className={styles.header_one}>
            Technical docs made simple.
          </h1>
          <h6 className={styles.paragraph}>
            Revolutionize the process of generating comprehensive technical documentation by learning directly from your codebase.
            <span className={styles.emph}> In fact, the documentation for Notepod was written with Notepod.</span>
          </h6>

          <h6 className={styles.paragraph}>
            Save more than 50 hours a month of technical writing and <span className={styles.emph}>increase team productivity</span>.
          </h6>

          <div className={styles.cta}>
            Save Hours of Your Time <span className={styles.emph}>Now</span>
          </div>
        </div>
      </div>
      <div className={styles.right_container}>
        <Image src="/hero_image.png" alt="something" height={400} width={400}/>
      </div>
    </div>
  );
}

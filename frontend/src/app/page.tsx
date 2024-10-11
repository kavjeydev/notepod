import Image from "next/image";
import styles from "./page.module.css"
import { Space_Grotesk } from 'next/font/google'
import { Lato } from 'next/font/google'

const space = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700']
});

const lato = Lato({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space',
  weight: ['100', '300', '400', '700']
})

export default function Home() {
  return (
    <div className={styles.whole_page}>
      <div className={styles.rect_container}>
       <img src="/rect.png" alt="something" className={styles.image_r}/>
      </div>

      <div className={`${styles.outer_container}`}>
        <div className={styles.left_container}>
          <div className={styles.hero}>
            <h1 className={`${styles.header_one} ${space.variable} antialiased`}>
              Technical docs for <span className={styles.header_emph}>any codebase</span> in seconds.
            </h1>
            <h6 className={`${styles.paragraph} ${lato.variable} antialiased`}>
            Technical documentation has never been easier. Our AI learns about any codebase, answers any questions, and writes any documents for you!
            </h6>

            <div className={styles.cta_container}>
              <div className={`${styles.cta} ${lato.variable}`}>
                Try for free
              </div>
              <div className={styles.video}>
                Watch a demo&nbsp;<span className={styles.arrow}>▶</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.right_container}>
          <Image src="/placeholder.png" alt="something" height={409} width={571}/>
        </div>
      </div>

      <div className={`${styles.sell} ${space.variable}`}>
        Writing documentation has never been easier.
      </div>

    </div>
  );
}

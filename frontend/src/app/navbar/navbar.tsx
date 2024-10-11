import styles from './navbar.module.css'
import Image from 'next/image'
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

export default function Navbar(){
    return (
        <div className={`${styles.outer_container} ${space.variable} antialiased`}>
            <div className={styles.left}>
                <Image src="/logo_w_text.png" alt='logo' height={36} width={130} />
            </div>

            <div className={`${styles.middle} ${lato.variable}`}>
                <div className={styles.home}>
                    Product
                </div>
                <div className={styles.home}>
                    Pricing
                </div>
                <div className={styles.home}>
                    Documentation
                </div>
                <div className={styles.home}>
                    <span className={styles.emph}>Write Now&nbsp;</span>
                    <img src="/squiggly arrow.svg" alt="" />
                </div>
            </div>

            <div className={styles.right}>
                <div className={styles.try}>
                    Log In
                </div>
                <div className={styles.signout}>
                    Sign Up
                </div>
            </div>
        </div>
    )
}
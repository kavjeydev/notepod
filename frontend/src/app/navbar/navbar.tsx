import styles from './navbar.module.css'
import Image from 'next/image'

export default function Navbar(){
    return (
        <div className={styles.outer_container}>
            <div className={styles.left}>
                <Image src="/logo_w_text.png" alt='logo' height={50} width={170} />
            </div>

            <div className={styles.middle}>
                <div className={styles.home}>
                    Home
                </div>
                <div className={styles.home}>
                    About
                </div>
                <div className={styles.home}>
                    Pricing
                </div>

            </div>

            <div className={styles.right}>
                <div className={styles.try}>
                    Try for <span className={styles.emph}>&nbsp;Free</span>
                </div>
                <div className={styles.signout}>
                    Sign Out
                </div>
            </div>
        </div>
    )
}
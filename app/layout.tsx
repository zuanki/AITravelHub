/* Components */
import { Providers } from '@/lib/providers';
// import { Nav } from './components/Nav'

/* Instruments */
import styles from './styles/layout.module.css';
import './styles/globals.css';

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <Providers>
      <html lang='en'>
        <body className='text-[#40513B] font-poppins'>
          <section >
            <main >{props.children}</main>
          </section>
        </body>
      </html>
    </Providers>
  );
}

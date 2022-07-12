import { trpc } from '../utils/trpc';
import { signIn, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRef, useState } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';

function LoginForm() {
  const { data } = useSession();
  const session: any = data;

  const userName = session?.token?.email;

  if (!userName) {
    return (
      <div>
        <p>
          You have to{' '}
          <button
            onClick={() =>
              signIn('spotify', { callbackUrl: 'http://localhost:3000' })
            }
          >
            sign in
          </button>{' '}
          to write.
        </p>
        <button
          onClick={() =>
            signIn('spotify', { callbackUrl: 'http://localhost:3000' })
          }
          data-testid="signin"
        >
          Sign In
        </button>
      </div>
    );
  }
  return (
    <>
      <div>Welcome {userName}!</div>
    </>
  );
}

export default function LoginPage() {
  const utils = trpc.useContext();

  const { data } = useSession();
  const session: any = data;
  const userName = session?.token?.email;
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Head>
        <title>Prisma Starter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <section>
          <div>
            <div>
              <header></header>
              <div>
                <article>
                  <h2>Introduction</h2>
                  <ul>
                    <li>Open inspector and head to Network tab</li>
                    <li>All client requests are handled through WebSockets</li>
                    <li>
                      We have a simple backend subscription on new messages that
                      adds the newly added message to the current state
                    </li>
                  </ul>
                </article>
                {userName && (
                  <article>
                    <h2>User information</h2>
                    <ul>
                      <li>
                        You&apos;re{' '}
                        <input
                          id="name"
                          name="name"
                          type="text"
                          disabled
                          value={userName}
                        />
                      </li>
                      <li>
                        <button onClick={() => signOut()}>Sign Out</button>
                      </li>
                    </ul>
                  </article>
                )}
              </div>
            </div>
          </div>
        </section>
        <div>
          <section>
            <div>
              <div>
                <div ref={scrollTargetRef}></div>
              </div>
            </div>
            <div>
              <LoginForm />
            </div>

            {process.env.NODE_ENV !== 'production' && (
              <div>
                <ReactQueryDevtools initialIsOpen={false} />
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

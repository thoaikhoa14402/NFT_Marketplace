import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SignerProvider } from "state/signer";
import Layout from "../components/Layout";
import "../styles/globals.css";
import theme from "../constants/theme.constant";
import { ConfigProvider } from "antd";
import { StyleProvider } from "@ant-design/cssinjs";

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

const GRAPH_URL = process.env.NEXT_PUBLIC_GRAPH_URL as string;
const client = new ApolloClient({ cache: new InMemoryCache(), uri: GRAPH_URL });

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ConfigProvider theme={theme}>
      <StyleProvider hashPriority="high">
        <SignerProvider>
          <ApolloProvider client={client}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick={false}
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </ApolloProvider>
        </SignerProvider>
      </StyleProvider>
    </ConfigProvider>
  );
};

export default MyApp;

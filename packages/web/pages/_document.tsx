import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { Children } from 'react';
import { AppRegistry } from 'react-native';

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    AppRegistry.registerComponent('MCBuilder', () => Main);

    const { getStyleElement } = AppRegistry.getApplication('MCBuilder');

    const page = await Document.getInitialProps(ctx);
    return { ...page, styles: Children.toArray([getStyleElement()]) };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }: { isServer: boolean }) => {
    if (!isServer && config.plugins) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
              to: path.join('public', 'static', 'workers', 'pdf.worker.min.js'),
            },
            {
              from: 'public/google.svg',
              to: path.join('public', 'static', 'workers', 'test_google.svg'),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;